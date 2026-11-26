import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { GalleryImage } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Screenshot gallery with an accessible lightbox (native <dialog>: Esc closes,
 * focus is trapped and restored). Renders nothing for an empty gallery.
 */
export function ProjectGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [index, setIndex] = useState<number | null>(null);
  /** The thumbnail that opened the viewer — focus returns here on close. */
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const count = images.length;

  const open = (i: number) => {
    openerRef.current = triggerRefs.current[i];
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count)), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setIndex(null);
      openerRef.current?.focus();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  if (count === 0) return null;
  const current = index === null ? null : images[index];

  return (
    <>
      <ul className={cn('grid gap-5', count === 1 ? 'grid-cols-1' : 'sm:grid-cols-2')}>
        {images.map((img, i) => (
          <li key={img.src}>
            <figure className="group h-full">
              <button
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
                onClick={() => open(i)}
                className="relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-surface-2"
                aria-label={`Open image ${i + 1} of ${count}: ${img.caption ?? img.alt}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
                />
                <span className="absolute right-3 bottom-3 inline-flex size-8 items-center justify-center rounded-full bg-navy/70 text-offwhite opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Maximize2 className="size-4" aria-hidden />
                </span>
              </button>
              {(img.caption || img.description) && (
                <figcaption className="mt-3 text-sm">
                  {img.caption && <span className="block font-medium text-fg">{img.caption}</span>}
                  {img.description && <span className="mt-1 block leading-relaxed text-fg-muted">{img.description}</span>}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${title} — image viewer`}
        onClick={(e) => e.target === dialogRef.current && close()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
        className="m-auto max-h-[92dvh] w-[min(72rem,94vw)] overflow-visible bg-transparent p-0 backdrop:bg-navy/85 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="relative flex flex-col items-center">
            <img
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              className="max-h-[78dvh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <figcaption className="mt-4 w-full text-center text-sm text-offwhite/90">
              <span className="font-mono text-xs text-offwhite/60">
                {(index ?? 0) + 1} / {count}
              </span>
              {current.caption && <span className="mt-1 block font-medium text-offwhite">{current.caption}</span>}
              {current.description && <span className="mx-auto mt-1 block max-w-2xl text-offwhite/75">{current.description}</span>}
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close image viewer"
          className="fixed top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-offwhite backdrop-blur transition-colors hover:bg-white/20"
        >
          <X className="size-5" aria-hidden />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="fixed top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-offwhite backdrop-blur transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="fixed top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-offwhite backdrop-blur transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
