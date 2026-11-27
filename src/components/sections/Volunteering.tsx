import type { VolunteeringEntry } from '@/types';
import { experienceArtwork, experienceTypeLabel, roleWhen } from '@/lib/labels';
import { cardGrid } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { EntryCard } from '@/components/cards/EntryCard';
import { Reveal } from '@/components/ui/Reveal';

/** Volunteering & Experience: one card per role, linking to the role's page. */
export function VolunteeringList({ entries, className, headingLevel }: { entries: VolunteeringEntry[]; className?: string; headingLevel?: 'h2' | 'h3' }) {
  if (entries.length === 0) return null;
  return (
    <ul className={cn(cardGrid, className)}>
      {entries.map((v, i) => (
        <li key={v.id}>
          <Reveal delay={Math.min(i * 0.06, 0.2)} className="h-full">
            <EntryCard
              href={`/experience/${v.slug}`}
              title={v.role}
              badge={experienceTypeLabel[v.type] ?? 'Volunteering'}
              meta={v.organisation}
              when={roleWhen(v)}
              summary={v.description}
              cover={v.cover}
              artwork={experienceArtwork[v.type] ?? 'waves'}
              actionLabel="View Details"
              headingLevel={headingLevel}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
