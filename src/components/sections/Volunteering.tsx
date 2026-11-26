import type { ReactNode } from 'react';
import { Briefcase, ExternalLink, HandHeart, Megaphone, Users, type LucideIcon } from 'lucide-react';
import type { ExperienceType } from '@/types';
import type { VolunteeringView } from '@/services';
import { experienceTypeLabel } from '@/lib/labels';
import { cn, formatRange } from '@/lib/utils';
import { TechTag } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { CredentialLinks } from './CredentialLinks';

const typeIcon: Record<ExperienceType, LucideIcon> = {
  volunteering: HandHeart,
  ambassador: Megaphone,
  'student-role': Users,
  internship: Briefcase,
  work: Briefcase,
};

/** Card grid shared by Volunteering & Experience and Events & Participation. */
export function EntryGrid<T extends { id: string }>({
  entries,
  className,
  children,
}: {
  entries: T[];
  className?: string;
  children: (entry: T) => ReactNode;
}) {
  if (entries.length === 0) return null;
  return (
    <ul className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      {entries.map((entry, i) => (
        <li key={entry.id} className="h-full">
          <Reveal
            delay={Math.min(i * 0.05, 0.2)}
            className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:p-6"
          >
            {children(entry)}
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export function EntryIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function EntryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent hover:underline">
      {children}
      <ExternalLink className="size-3" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** Volunteering & Experience: roles where you contributed, with optional evidence. */
export function VolunteeringList({ entries, className }: { entries: VolunteeringView[]; className?: string }) {
  return (
    <EntryGrid entries={entries} className={className}>
      {(v) => {
        const range = formatRange(v.start, v.end);
        return (
          <>
            <EntryIcon icon={typeIcon[v.type] ?? HandHeart} />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[0.7rem] uppercase tracking-widest text-accent">{experienceTypeLabel[v.type] ?? 'Volunteering'}</span>
              <h3 className="mt-1.5 text-lg font-semibold leading-snug">{v.role}</h3>
              <p className="mt-1 text-sm text-fg-muted">{v.organisation}</p>
              {range && <p className="mt-1 font-mono text-xs text-fg-subtle">{range}</p>}
              {v.description && <p className="mt-3 text-sm leading-relaxed text-fg-muted">{v.description}</p>}
              {v.highlights.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {v.highlights.map((h) => (
                    <li key={h}>
                      <TechTag>{h}</TechTag>
                    </li>
                  ))}
                </ul>
              )}
              <CredentialLinks
                credentials={v.credentials}
                extra={v.url && <EntryLink href={v.url}>Related link</EntryLink>}
                className="mt-4"
              />
            </div>
          </>
        );
      }}
    </EntryGrid>
  );
}
