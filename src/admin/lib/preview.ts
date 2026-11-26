import type { SiteContent } from '@/types';
import { BUCKETS } from '@/lib/supabaseConfig';
import { collectUploads, mapUploads } from '@/lib/uploads';
import type { LoadedContent } from '@/services';
import { getSupabase } from './supabaseClient';

/**
 * Draft content for the owner's preview. Returns null unless the visitor is
 * signed in as the owner — everyone else falls back to the published site.
 */
export async function loadPreviewContent(): Promise<LoadedContent | null> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const { data, error } = await supabase.rpc('draft_snapshot');
  if (error || !data) return null;
  const content = data as SiteContent;

  const paths = collectUploads(content);
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from(BUCKETS.drafts).createSignedUrls(paths, 60 * 60);
    signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }
  return {
    mode: 'preview',
    content: mapUploads(content, (path) => urls.get(path) ?? ''),
    version: null,
    publishedAt: null,
  };
}
