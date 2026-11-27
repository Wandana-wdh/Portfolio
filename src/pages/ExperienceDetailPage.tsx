import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { experienceTypeLabel, roleWhen } from '@/lib/labels';
import { EntryDetail } from '@/components/sections/EntryDetail';
import { VolunteeringList } from '@/components/sections/Volunteering';
import type { experienceDetailLoader, LoaderData } from './loaders';

export default function ExperienceDetailPage() {
  const { role: v, others } = useLoaderData() as LoaderData<typeof experienceDetailLoader>;
  const type = experienceTypeLabel[v.type] ?? 'Volunteering';
  const when = roleWhen(v);
  useDocumentMeta({ title: `${v.role} — ${v.organisation}`, description: v.description ?? `${v.role}, ${v.organisation}`, type: 'article', image: v.cover?.src });

  return (
    <EntryDetail
      back={{ to: '/about#volunteering', label: 'Volunteering & Experience' }}
      badge={type}
      title={v.role}
      subtitle={[v.organisation, when].filter(Boolean).join(' · ')}
      summary={v.description}
      link={v.url ? { href: v.url, label: 'Related link' } : null}
      cover={v.cover}
      recapTitle="About this role"
      recap={v.recap}
      gallery={v.gallery}
      credentials={v.credentials}
      meta={[
        { label: 'Type', value: type },
        { label: 'Organisation', value: v.organisation },
        { label: v.term ? 'Term' : 'Dates', value: when },
      ]}
      more={others.length > 0 ? { title: 'More roles', content: <VolunteeringList entries={others} /> } : null}
    />
  );
}
