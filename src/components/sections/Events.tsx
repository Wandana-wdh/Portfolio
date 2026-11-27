import type { EventEntry } from '@/types';
import { eventArtwork, eventTypeLabel } from '@/lib/labels';
import { cardGrid } from '@/lib/layout';
import { cn, formatDate } from '@/lib/utils';
import { EntryCard } from '@/components/cards/EntryCard';
import { Reveal } from '@/components/ui/Reveal';

/** Events & Participation: one card per event, linking to the event's page. */
export function EventsList({ entries, className, headingLevel }: { entries: EventEntry[]; className?: string; headingLevel?: 'h2' | 'h3' }) {
  if (entries.length === 0) return null;
  return (
    <ul className={cn(cardGrid, className)}>
      {entries.map((e, i) => (
        <li key={e.id}>
          <Reveal delay={Math.min(i * 0.06, 0.2)} className="h-full">
            <EntryCard
              href={`/events/${e.slug}`}
              title={e.title}
              badge={eventTypeLabel[e.type] ?? 'Event'}
              meta={[e.organiser, e.location].filter(Boolean).join(' · ')}
              when={formatDate(e.date) || null}
              summary={e.description}
              cover={e.cover}
              artwork={eventArtwork[e.type] ?? 'lattice'}
              actionLabel="View Event"
              headingLevel={headingLevel}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
