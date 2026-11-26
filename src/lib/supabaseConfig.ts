/**
 * Public Supabase settings (safe to ship to browsers). The publishable/anon key
 * only grants what Row Level Security allows: reading the published site.
 * Never put the service_role / secret key in a VITE_ variable.
 */
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabaseConfig = { url, key } as const;

/** True once the site is connected to Supabase (see SETUP.md). */
export const isSupabaseConfigured = Boolean(url && key);

/** Storage buckets: private drafts, public published files. */
export const BUCKETS = { drafts: 'drafts', site: 'site' } as const;

/** Uploaded files are stored and referenced as "uploads/...". */
export const isUploadPath = (value: unknown): value is string => typeof value === 'string' && value.startsWith('uploads/');

export const publicFileUrl = (path: string) =>
  `${url}/storage/v1/object/public/${BUCKETS.site}/${path.split('/').map(encodeURIComponent).join('/')}`;

/** Headers for calling the REST API with the publishable key (anonymous). */
export function publicHeaders(): Record<string, string> {
  const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
  // Legacy anon keys are JWTs and may also be sent as a bearer token.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  return headers;
}
