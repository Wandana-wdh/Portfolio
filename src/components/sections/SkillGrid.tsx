import { ClipboardCheck, Cloud, Code2, Database, LayoutTemplate, Server, Wrench, type LucideIcon } from 'lucide-react';
import type { SkillGroup, SkillIcon } from '@/types';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/Reveal';

const icons: Record<SkillIcon, LucideIcon> = {
  code: Code2,
  layout: LayoutTemplate,
  server: Server,
  database: Database,
  cloud: Cloud,
  test: ClipboardCheck,
  wrench: Wrench,
};

export function SkillGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    // 4 columns + the emphasised card spanning 2 → rows fill exactly; `dense` backfills gaps at 2 columns.
    <div className="grid grid-flow-row-dense gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((group, i) => {
        const Icon = icons[group.icon];
        const emphasised = Boolean(group.emphasised);
        return (
          <Reveal key={group.id} delay={Math.min(i * 0.05, 0.25)} className={cn(emphasised && 'sm:col-span-2')}>
            <div
              className={cn(
                'h-full rounded-2xl border p-6 transition-colors',
                emphasised
                  ? 'border-accent/30 bg-accent-soft hover:border-accent/50'
                  : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-xl',
                    emphasised ? 'bg-accent-solid text-on-accent' : 'bg-surface-2 text-accent',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-base font-semibold">{group.title}</h3>
              </div>
              <p className="mt-3 text-sm text-fg-muted">{group.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${group.title} skills`}>
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-lg border border-line bg-canvas/60 px-2.5 py-1.5 text-[0.8rem] font-medium text-fg"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
