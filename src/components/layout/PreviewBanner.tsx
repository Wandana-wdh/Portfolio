import { Eye } from 'lucide-react';
import { exitPreview } from '@/services';

/** Shown only to the signed-in owner while previewing unpublished drafts. */
export function PreviewBanner() {
  return (
    <div role="status" className="relative z-[55] bg-amber-400 text-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 font-medium">
          <Eye className="size-4" aria-hidden />
          Preview — you’re seeing unpublished drafts. Only you can see this.
        </p>
        <div className="flex gap-4">
          <a href="/admin" className="font-semibold underline underline-offset-2">
            Back to admin
          </a>
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            onClick={() => {
              exitPreview();
              window.location.assign(window.location.pathname);
            }}
          >
            Exit preview
          </button>
        </div>
      </div>
    </div>
  );
}
