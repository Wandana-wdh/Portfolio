import { Briefcase, GraduationCap, Laptop, Paperclip, School, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TimelineKind } from '@/types';
import type { TimelineView } from '@/services';
import { timelineKindLabel } from '@/lib/labels';
import { cn, formatRange } from '@/lib/utils';
import { TechTag } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';

const kindIcon: Record<TimelineKind, LucideIcon> = {
  education: GraduationCap,
  school: School,
  internship: Briefcase,
  experience: Laptop,
};

export function Timeline({ entries }: { entries: TimelineView[] }) {
  return (
    <ol className="relative">
      {entries.map((entry, i) => {
        const Icon = kindIcon[entry.kind];
        const range = formatRange(entry.start, entry.end);
        const last = i === entries.length - 1;
        const meta = [entry.organisation, entry.location].filter(Boolean).join(' · ');
        return (
          <li key={entry.id} className="relative grid grid-cols-[2.75rem_1fr] gap-x-5 md:grid-cols-[9rem_2.75rem_1fr]">
            {/* Date (desktop) */}
            <div className="hidden pt-3 text-right md:block">
              {range && <p className="font-mono text-xs text-fg-subtle">{range}</p>}
            </div>

            {/* Rail */}
            <div className="relative flex justify-center">
              {!last && <span aria-hidden className="absolute top-11 bottom-0 w-px bg-line-strong" />}
              <span className="relative z-10 inline-flex size-11 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>

            <Reveal className={cn('pb-6', last && 'pb-0')} delay={Math.min(i * 0.05, 0.2)}>
              <div className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong sm:p-6">
                <span className="font-mono text-[0.7rem] uppercase tracking-widest text-accent">{timelineKindLabel[entry.kind]}</span>
                <h3 className="mt-2 text-lg font-semibold">{entry.title}</h3>
                {meta && <p className="mt-1 text-sm text-fg-muted">{meta}</p>}
                {range && <p className="mt-1 font-mono text-xs text-fg-subtle md:hidden">{range}</p>}
                {entry.description && <p className="mt-3 text-sm leading-relaxed text-fg-muted">{entry.description}</p>}
                {entry.highlights.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {entry.highlights.map((h) => (
                      <li key={h}>
                        <TechTag>{h}</TechTag>
                      </li>
                    ))}
                  </ul>
                )}
                {entry.credentials.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Certificates">
                    {entry.credentials.map((c) => {
                      const file = c.document?.href ?? c.image?.src ?? null;
                      const cls = 'inline-flex items-center gap-1.5 rounded text-sm font-medium text-accent hover:underline';
                      return (
                        <li key={c.id}>
                          {file ? (
                            <a href={file} target="_blank" rel="noopener noreferrer" className={cls}>
                              <Paperclip className="size-3.5" aria-hidden />
                              {c.document?.label ?? c.title}
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          ) : c.inAchievements ? (
                            <Link to={`/achievements#${c.id}`} className={cls}>
                              <Paperclip className="size-3.5" aria-hidden />
                              {c.title}
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                              <Paperclip className="size-3.5" aria-hidden />
                              {c.title}
                            </span>
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
    </ol>
  );
}
