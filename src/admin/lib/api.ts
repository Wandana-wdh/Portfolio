import type { PostgrestError } from '@supabase/supabase-js';
import type { ContentCollection } from '@/types';
import { BUCKETS, supabaseConfig } from '@/lib/supabaseConfig';
import { getSupabase } from './supabaseClient';

/**
 * Owner-only data access for /admin. Every write goes through a database
 * function that checks the owner and runs under Row Level Security.
 */

export type Collection = ContentCollection | 'profile';

export interface EntryRow<T = Record<string, unknown>> {
  collection: Collection;
  id: string;
  sort_order: number;
  visible: boolean;
  data: T;
  updated_at: string;
}

export interface Usage {
  collection: Collection;
  id: string;
  title: string;
  visible: boolean;
}

export class AdminError extends Error {}

function friendly(error: PostgrestError | { message: string; code?: string }): string {
  const code = 'code' in error ? error.code : undefined;
  const message = error.message ?? 'Something went wrong.';
  if (code === '42501' || /permission denied|row-level security/i.test(message)) {
    return 'Only the approved owner account can make changes. Sign in again and retry.';
  }
  if (code === '23505' || /duplicate key/i.test(message)) {
    return 'That URL (slug) is already used by another entry. Choose a different one.';
  }
  if (code === '23514' || /violates check constraint/i.test(message)) {
    if (/slug_format/.test(message)) return 'The URL (slug) may only use lowercase letters, numbers and single hyphens.';
    if (/has_title|volunteering_has_role/.test(message)) return 'A title is required.';
    return 'Some information is missing or invalid. Check the highlighted fields.';
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return 'Couldn’t reach Supabase. Check your internet connection and try again.';
  }
  return message;
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().rpc(fn, args);
  if (error) throw new AdminError(friendly(error));
  return data as T;
}

// ---------------------------------------------------------------- auth

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) throw new AdminError('Incorrect email or password.');
    if (/email not confirmed/i.test(error.message)) throw new AdminError('This email address has not been confirmed yet.');
    throw new AdminError(friendly(error));
  }
  if (!(await isOwner())) {
    await supabase.auth.signOut();
    throw new AdminError('This account is not approved to edit the site.');
  }
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

export async function currentUserEmail(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.user.email ?? null;
}

export async function isOwner(): Promise<boolean> {
  const { data: auth } = await getSupabase().auth.getSession();
  if (!auth.session) return false;
  const { data, error } = await getSupabase().rpc('is_owner');
  return !error && data === true;
}

// ---------------------------------------------------------------- entries

export const listEntries = () => rpc<EntryRow[]>('admin_entries');

export async function listCollection<T>(collection: Collection): Promise<EntryRow<T>[]> {
  const rows = await listEntries();
  return rows.filter((r) => r.collection === collection) as EntryRow<T>[];
}

export async function getEntry<T>(collection: Collection, id: string): Promise<EntryRow<T> | null> {
  const rows = await listEntries();
  return (rows.find((r) => r.collection === collection && r.id === id) as EntryRow<T> | undefined) ?? null;
}

export const saveEntry = <T>(collection: Collection, id: string, data: T, visible?: boolean) =>
  rpc<EntryRow<T>>('save_entry', { p_collection: collection, p_id: id, p_data: data, p_visible: visible ?? null });

export const setVisibility = (collection: Collection, id: string, visible: boolean) =>
  rpc<null>('set_entry_visibility', { p_collection: collection, p_id: id, p_visible: visible });

export const reorderEntries = (collection: Collection, ids: string[]) =>
  rpc<null>('reorder_entries', { p_collection: collection, p_ids: ids });

export const credentialUsages = (id: string) => rpc<Usage[]>('credential_usages', { p_id: id });

/** Permanently deletes an entry (and removes its uploaded draft files). */
export async function deleteEntry(collection: Collection, id: string, files: string[]): Promise<void> {
  await rpc<unknown>('delete_entry', { p_collection: collection, p_id: id });
  await removeDraftFiles(files).catch(() => undefined); // leftovers are found by "Clean up unused uploads"
}

// ---------------------------------------------------------------- files

export const ACCEPT = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  pdf: ['application/pdf'],
} as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateFile(file: File, kinds: Array<keyof typeof ACCEPT>): string | null {
  const allowed: readonly string[] = kinds.flatMap((k) => ACCEPT[k]);
  if (!allowed.includes(file.type)) {
    const names = kinds.map((k) => (k === 'image' ? 'JPG, PNG, WebP, GIF or AVIF images' : 'PDF files')).join(' or ');
    return `“${file.name}” can’t be used — only ${names} are accepted.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `“${file.name}” is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`;
  }
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}

const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-60) || 'file';

/**
 * Uploads to the private drafts bucket with progress. Each upload gets a new
 * path, so a failed replacement never touches the file already in use.
 */
export async function uploadDraftFile(
  file: File,
  folder: string,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new AdminError('Your session has expired. Sign in again to upload.');

  const path = `uploads/${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const url = `${supabaseConfig.url}/storage/v1/object/${BUCKETS.drafts}/${path.split('/').map(encodeURIComponent).join('/')}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', supabaseConfig.key);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (error ${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        const detail = body.message ?? body.error ?? '';
        if (/exceeded the maximum allowed size|payload too large/i.test(detail) || xhr.status === 413) message = 'The file is larger than the 10 MB limit.';
        else if (/mime type|invalid_mime_type/i.test(detail)) message = 'This file type isn’t allowed.';
        else if (xhr.status === 403 || /row-level security|unauthorized/i.test(detail)) message = 'Only the approved owner account can upload files.';
        else if (detail) message = `Upload failed: ${detail}`;
      } catch {
        /* keep generic message */
      }
      reject(new AdminError(message));
    };
    xhr.onerror = () => reject(new AdminError('Upload failed — check your internet connection and try again.'));
    xhr.onabort = () => reject(new AdminError('Upload cancelled.'));
    signal?.addEventListener('abort', () => xhr.abort());
    xhr.send(file);
  });
  onProgress?.(1);
  return path;
}

const signedCache = new Map<string, { url: string; expires: number }>();

/** Short-lived URLs for viewing private draft files in the editor. */
export async function draftFileUrls(paths: string[]): Promise<Map<string, string>> {
  const now = Date.now();
  const result = new Map<string, string>();
  const missing = paths.filter((p) => {
    const hit = signedCache.get(p);
    if (hit && hit.expires > now) result.set(p, hit.url);
    return !(hit && hit.expires > now);
  });
  if (missing.length > 0) {
    const { data, error } = await getSupabase().storage.from(BUCKETS.drafts).createSignedUrls(missing, 60 * 60);
    if (error) throw new AdminError(friendly(error));
    data?.forEach((d) => {
      if (d.path && d.signedUrl) {
        signedCache.set(d.path, { url: d.signedUrl, expires: now + 55 * 60 * 1000 });
        result.set(d.path, d.signedUrl);
      }
    });
  }
  return result;
}

export async function removeDraftFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await getSupabase().storage.from(BUCKETS.drafts).remove(paths);
  if (error) throw new AdminError(friendly(error));
  paths.forEach((p) => signedCache.delete(p));
}

export const unusedDraftFiles = () => rpc<string[]>('unused_draft_files');

// ---------------------------------------------------------------- publishing

export interface PublishedInfo {
  version: number;
  publishedAt: string;
  content: unknown;
}

/** Stable JSON so two snapshots can be compared regardless of key order. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function publishStatus(): Promise<{ published: PublishedInfo | null; hasChanges: boolean }> {
  const [published, draft] = await Promise.all([rpc<PublishedInfo | null>('published_site'), rpc<unknown>('draft_snapshot')]);
  return { published, hasChanges: !published || canonical(published.content) !== canonical(draft) };
}

export type PublishStep =
  | { step: 'preparing' }
  | { step: 'copying'; done: number; total: number }
  | { step: 'publishing' }
  | { step: 'cleaning' }
  | { step: 'done'; version: number; removed: number; warning?: string };

/**
 * 1. find files the drafts reference that are not public yet, 2. copy them to
 * the public bucket, 3. publish the snapshot (the database refuses if a file is
 * missing), 4. remove public files the new version no longer uses (e.g. the
 * attachment of a certificate that was hidden or deleted).
 */
export async function publishSite(onStep: (s: PublishStep) => void): Promise<PublishStep & { step: 'done' }> {
  const supabase = getSupabase();
  onStep({ step: 'preparing' });
  const plan = await rpc<{ files: string[]; missing: string[] }>('publish_plan');

  for (let i = 0; i < plan.missing.length; i++) {
    onStep({ step: 'copying', done: i, total: plan.missing.length });
    const path = plan.missing[i];
    const { error } = await supabase.storage.from(BUCKETS.drafts).copy(path, path, { destinationBucket: BUCKETS.site });
    if (error && !/already exists|Duplicate/i.test(error.message)) {
      throw new AdminError(`Couldn’t copy “${path.split('/').pop()}” to the public site: ${friendly(error)} Nothing was published.`);
    }
  }

  onStep({ step: 'publishing' });
  const result = await rpc<{ version: number }>('publish_site');

  onStep({ step: 'cleaning' });
  let removed = 0;
  let warning: string | undefined;
  try {
    const stale = await rpc<string[]>('stale_public_files');
    for (let i = 0; i < stale.length; i += 100) {
      const batch = stale.slice(i, i + 100);
      const { error } = await supabase.storage.from(BUCKETS.site).remove(batch);
      if (error) throw error;
      removed += batch.length;
    }
  } catch {
    warning = 'Published, but some old public files could not be removed. Publish again to retry the clean-up.';
  }
  const done = { step: 'done' as const, version: result.version, removed, warning };
  onStep(done);
  return done;
}
