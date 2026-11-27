import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { eventTypeLabel } from '@/lib/labels';
import { formatDate } from '@/lib/utils';
import { EntryDetail } from '@/components/sections/EntryDetail';
import { EventsList } from '@/components/sections/Events';
import type { eventDetailLoader, LoaderData } from './loaders';

export default function EventDetailPage() {
  const { event: e, others } = useLoaderData() as LoaderData<typeof eventDetailLoader>;
  const type = eventTypeLabel[e.type] ?? 'Event';
  useDocumentMeta({ title: e.title, description: e.description ?? `${type}: ${e.title}`, type: 'article', image: e.cover?.src });

  return (
    <EntryDetail
      back={{ to: '/about#events', label: 'Events & Participation' }}
      badge={type}
      title={e.title}
      subtitle={[e.organiser, e.location].filter(Boolean).join(' · ') || null}
      summary={e.description}
      link={e.url ? { href: e.url, label: 'Event page' } : null}
      cover={e.cover}
      recapTitle="Recap"
      recap={e.recap}
      gallery={e.gallery}
      credentials={e.credentials}
      meta={[
        { label: 'Type', value: type },
        { label: 'Organiser', value: e.organiser },
        { label: 'Location', value: e.location },
        { label: 'Date', value: formatDate(e.date) || null },
      ]}
      more={others.length > 0 ? { title: 'More events', content: <EventsList entries={others} /> } : null}
    />
  );
}
