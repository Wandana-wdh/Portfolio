import { CalendarCheck } from 'lucide-react';
import type { EventView } from '@/services';
import { formatDate } from '@/lib/utils';
import { CredentialLinks } from './CredentialLinks';
import { EntryGrid, EntryIcon, EntryLink } from './Volunteering';

/** Events & Participation: events, meetups and workshops attended. */
export function EventsList({ entries, className }: { entries: EventView[]; className?: string }) {
  return (
    <EntryGrid entries={entries} className={className}>
      {(e) => (
        <>
          <EntryIcon icon={CalendarCheck} />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-snug">{e.title}</h3>
            {e.organiser && <p className="mt-1 text-sm text-fg-muted">{e.organiser}</p>}
            {e.date && <p className="mt-1 font-mono text-xs text-fg-subtle">{formatDate(e.date)}</p>}
            {e.description && <p className="mt-3 text-sm leading-relaxed text-fg-muted">{e.description}</p>}
            <CredentialLinks
              credentials={e.credentials}
              extra={e.url && <EntryLink href={e.url}>Event page</EntryLink>}
              className="mt-4"
            />
          </div>
        </>
      )}
    </EntryGrid>
  );
}
