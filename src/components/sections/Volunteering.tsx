import { ArrowRight, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VolunteeringView } from '@/services';
import { cn, formatMonth, formatRange } from '@/lib/utils';
import { TechTag } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';

/** Volunteering roles, each optionally linked to its credential record. */
export function VolunteeringList({ entries, className }: { entries: VolunteeringView[]; className?: string }) {
  if (entries.length === 0) return null;
  return (
    <ul className={cn('grid gap-4', entries.length > 1 && 'md:grid-cols-2', className)}>
      {entries.map((v, i) => {
        const range = formatRange(v.start, v.end);
        return (
          <li key={v.id} className="h-full">
            <Reveal delay={Math.min(i * 0.05, 0.2)} className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <HandHeart className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold leading-snug">{v.role}</h3>
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
                {v.credentials.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {v.credentials.map((c) => {
                      const file = c.document?.href ?? c.image?.src ?? null;
                      if (!c.inAchievements && !file) return null;
                      const cls = 'group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent';
                      const label = (
                        <>
                          {c.inAchievements ? 'View credential' : (c.document?.label ?? 'View certificate')}
                          {c.issueDate && ` · ${formatMonth(c.issueDate)}`}
                          <span className="sr-only">: {c.title}</span>
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </>
                      );
                      return (
                        <li key={c.id}>
                          {c.inAchievements ? (
                            <Link to={`/achievements#${c.id}`} className={cls}>
                              {label}
                            </Link>
                          ) : (
                            <a href={file ?? undefined} target="_blank" rel="noopener noreferrer" className={cls}>
                              {label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
