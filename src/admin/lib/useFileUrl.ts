import { useEffect, useState } from 'react';
import { isUploadPath } from '@/lib/supabaseConfig';
import { draftFileUrls } from './api';

/** Displayable URL for a stored reference (private uploads get a short-lived signed URL). */
export function useFileUrl(src: string | null | undefined): string | null {
  const [signed, setSigned] = useState<{ src: string; url: string } | null>(null);
  useEffect(() => {
    if (!src || !isUploadPath(src)) return;
    let cancelled = false;
    draftFileUrls([src])
      .then((m) => !cancelled && setSigned({ src, url: m.get(src) ?? '' }))
      .catch(() => !cancelled && setSigned({ src, url: '' }));
    return () => {
      cancelled = true;
    };
  }, [src]);
  if (!src) return null;
  if (!isUploadPath(src)) return src;
  return signed?.src === src ? signed.url || null : null;
}
