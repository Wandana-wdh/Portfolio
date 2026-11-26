import type { SiteContent } from '@/types';
import { isSupabaseConfigured, publicFileUrl, publicHeaders, supabaseConfig } from '@/lib/supabaseConfig';
import { mapUploads } from '@/lib/uploads';
import { createRepository } from './contentRepository';
import type { PortfolioRepository } from './portfolioRepository';
import { staticSiteContent } from './staticContent';

export type ContentMode = 'static' | 'published' | 'preview';

export interface LoadedContent {
  mode: ContentMode;
  content: SiteContent;
  version: number | null;
  publishedAt: string | null;
}

const PREVIEW_KEY = 'portfolio-preview';

/** `?preview=1` turns preview on for this tab, `?preview=0` turns it off. */
export function isPreviewRequested(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('preview');
    if (param === '1') sessionStorage.setItem(PREVIEW_KEY, '1');
    if (param === '0') sessionStorage.removeItem(PREVIEW_KEY);
    return sessionStorage.getItem(PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
}

export function exitPreview() {
  try {
    sessionStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* ignore */
  }
}

async function loadPublished(): Promise<LoadedContent> {
  let res: Response;
  try {
    res = await fetch(`${supabaseConfig.url}/rest/v1/rpc/published_site`, {
      method: 'POST',
      headers: publicHeaders(),
      body: '{}',
    });
  } catch {
    throw new Error('Couldn’t reach the content server. Check your connection and try again.');
  }
  if (!res.ok) throw new Error(`Couldn’t load the site content (error ${res.status}).`);
  const data = (await res.json()) as { version: number; publishedAt: string; content: SiteContent } | null;
  if (!data?.content?.profile) throw new Error('The site has not been published yet.');
  return {
    mode: 'published',
    content: mapUploads(data.content, publicFileUrl),
    version: data.version,
    publishedAt: data.publishedAt,
  };
}

async function load(): Promise<LoadedContent> {
  if (!isSupabaseConfigured) {
    return { mode: 'static', content: staticSiteContent(), version: null, publishedAt: null };
  }
  if (isPreviewRequested()) {
    // Owner-only: loads the admin client lazily; returns null when not signed in as the owner.
    const { loadPreviewContent } = await import('@/admin/lib/preview');
    const preview = await loadPreviewContent().catch(() => null);
    if (preview) return preview;
  }
  return loadPublished();
}

let contentPromise: Promise<LoadedContent> | null = null;
let repository: { source: LoadedContent; repo: PortfolioRepository } | null = null;

/** Loads the site content once per page load (shared by every route loader). */
export function loadSiteContent(): Promise<LoadedContent> {
  if (!contentPromise) {
    contentPromise = load().catch((error) => {
      contentPromise = null; // allow a retry
      throw error;
    });
  }
  return contentPromise;
}

/** Forget cached content (after publishing, or when switching preview on/off). */
export function invalidateSiteContent() {
  contentPromise = null;
  repository = null;
}

export async function getRepository(): Promise<PortfolioRepository> {
  const source = await loadSiteContent();
  if (repository?.source !== source) repository = { source, repo: createRepository(source.content) };
  return repository.repo;
}
