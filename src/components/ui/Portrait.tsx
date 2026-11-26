import { Camera } from 'lucide-react';
import type { ImageAsset } from '@/types';
import { cn } from '@/lib/utils';

/** Framed portrait with viewfinder corners. Falls back to an initials placeholder. */
export function Portrait({ image, name, className }: { image: ImageAsset | null; name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <figure className={cn('relative', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card-hover">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="relative flex size-full flex-col items-center justify-center bg-gradient-to-br from-surface-2 via-surface to-surface-2">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
            <span className="relative font-display text-7xl font-semibold tracking-tighter text-fg/90 sm:text-8xl">
              {initials}
            </span>
            <span className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-canvas/70 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-fg-subtle backdrop-blur">
              <Camera className="size-3.5" aria-hidden />
              Portrait placeholder
            </span>
            <span className="sr-only">Portrait of {name} — image coming soon</span>
          </div>
        )}
      </div>

      {/* Viewfinder corners */}
      {(['-top-3 -left-3 border-t-2 border-l-2 rounded-tl-xl', '-top-3 -right-3 border-t-2 border-r-2 rounded-tr-xl', '-bottom-3 -left-3 border-b-2 border-l-2 rounded-bl-xl', '-bottom-3 -right-3 border-b-2 border-r-2 rounded-br-xl'] as const).map(
        (pos) => (
          <span key={pos} aria-hidden className={cn('absolute size-8 border-accent/70', pos)} />
        ),
      )}
    </figure>
  );
}
