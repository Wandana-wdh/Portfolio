import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ArtworkVariant, ImageAsset } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Media } from '@/components/ui/CoverArt';

/**
 * Card for an event or a volunteering role, in the same style as the project
 * card: fixed-ratio cover (or a generated graphic when there is no photo),
 * clamped title, one meta line, clamped summary and an action at the bottom,
 * so every card in a grid is the same size.
 */
export function EntryCard({
  href,
  title,
  badge,
  meta,
  when,
  summary,
  cover,
  artwork,
  actionLabel,
  headingLevel = 'h3',
}: {
  href: string;
  title: string;
  badge: string;
  /** Secondary line, e.g. the organisation. */
  meta: string | null;
  /** Date, date range or term. */
  when: string | null;
  summary: string | null;
  cover: ImageAsset | null;
  artwork: ArtworkVariant;
  actionLabel: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-out-soft hover:-translate-y-1 hover:border-line-strong hover:shadow-card-hover">
      <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] shrink-0 overflow-hidden">
        <Media
          image={cover}
          artwork={artwork}
          seed={href}
          label={badge}
          className="absolute inset-0 transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 flex gap-2">
          <Badge tone="overlay">{badge}</Badge>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Heading className="line-clamp-2 min-h-[2lh] text-xl font-semibold leading-snug">
          <Link to={href} className="transition-colors hover:text-accent">
            {title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-1 min-h-[1lh] text-sm text-fg-muted">{meta}</p>
        <p className="mt-1 min-h-[1lh] truncate font-mono text-xs leading-5 text-fg-subtle">{when}</p>
        <p className="mt-3 line-clamp-3 min-h-[3lh] text-sm leading-relaxed text-fg-muted">{summary}</p>

        <div className="mt-auto pt-6">
          <Link to={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent" aria-label={`${actionLabel}: ${title}`}>
            {actionLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
