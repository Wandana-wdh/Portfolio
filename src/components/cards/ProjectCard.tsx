import { ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { statusBadge } from '@/lib/labels';
import { Badge, StatusBadge, TechTag } from '@/components/ui/Badge';
import { Media } from '@/components/ui/CoverArt';
import { GitHubIcon } from '@/components/ui/SocialIcon';

const MAX_TAGS = 2;

/**
 * Compact project card: a short 2:1 cover, a two-line title, a two-line summary
 * and one row of tags. Fixed minimum heights keep every card in a grid the same
 * size, and the action row sits at the bottom so it lines up across a row.
 * Place it in a grid cell that stretches (the card fills its cell with h-full).
 * The full description, gallery and downloads are on the project page.
 */
export function ProjectCard({ project, headingLevel = 'h3' }: { project: Project; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  const href = `/projects/${project.slug}`;
  const extraTags = project.tech.length - MAX_TAGS;
  const repo = project.repositories[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-out-soft hover:-translate-y-1 hover:border-line-strong hover:shadow-card-hover">
      <Link to={href} tabIndex={-1} aria-hidden className="relative block aspect-[2/1] shrink-0 overflow-hidden">
        <Media
          image={project.cover}
          artwork={project.artwork}
          seed={project.slug}
          className="absolute inset-0 transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
        />
        <span className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-1.5">
          <span className="flex flex-wrap gap-1.5">
            <Badge tone="overlay">{project.category}</Badge>
            {project.team && (
              <Badge tone="overlay">
                <Users className="size-3" aria-hidden />
                Team
              </Badge>
            )}
          </span>
          <StatusBadge status={project.status} overlay />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Heading className="line-clamp-2 min-h-[2lh] text-lg font-semibold leading-snug">
          <Link to={href} className="transition-colors hover:text-accent">
            {project.title}
          </Link>
        </Heading>
        {/* The badge on the cover is hidden from screen readers with the rest of the image link. */}
        {project.status && <p className="sr-only">Status: {statusBadge[project.status].label}</p>}
        <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-fg-muted">{project.summary}</p>

        <ul className="mt-4 flex min-h-[1.5rem] flex-wrap content-start gap-1.5" aria-label="Technologies">
          {project.tech.slice(0, MAX_TAGS).map((t) => (
            <li key={t}>
              <TechTag>{t}</TechTag>
            </li>
          ))}
          {extraTags > 0 && (
            <li>
              <TechTag>
                +{extraTags}
                <span className="sr-only"> more</span>
              </TechTag>
            </li>
          )}
        </ul>

        {/* Fixed-height action row so "View Details" lines up whether or not a GitHub button is present. */}
        <div className="mt-auto flex h-13 items-center justify-between gap-4 pt-4">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            aria-label={`View details: ${project.title}`}
          >
            View Details
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          {repo && (
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub (opens in a new tab)`}
              className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              <GitHubIcon className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
