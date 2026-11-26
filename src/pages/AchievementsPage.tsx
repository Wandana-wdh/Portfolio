import { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import { useLoaderData, useLocation } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { credentialGroup, credentialGroupLabel, type CredentialGroup } from '@/lib/labels';
import { cardGrid } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { CredentialCard } from '@/components/cards/CredentialCard';
import { Section } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChips } from '@/components/ui/FilterChips';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import type { achievementsLoader, LoaderData } from './loaders';

type Filter = 'all' | CredentialGroup;

export default function AchievementsPage() {
  const { items } = useLoaderData() as LoaderData<typeof achievementsLoader>;
  const { hash } = useLocation();
  const targetId = decodeURIComponent(hash.slice(1));
  const [filter, setFilter] = useState<Filter>('all');
  useDocumentMeta({
    title: 'Achievements & Certifications',
    description: 'Project confirmation, skills credentials, badges and certificates — with verification links where available.',
  });

  // Deep links (/achievements#id): show everything, then scroll to and focus the card.
  useEffect(() => {
    if (!targetId) return;
    setFilter('all');
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.scrollIntoView({ block: 'center' });
      el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [targetId]);

  const options = useMemo(
    () => [
      { value: 'all' as Filter, label: 'All', count: items.length },
      ...(Object.keys(credentialGroupLabel) as CredentialGroup[])
        .map((g) => ({
          value: g as Filter,
          label: credentialGroupLabel[g],
          count: items.filter((i) => credentialGroup[i.type] === g).length,
        }))
        .filter((o) => o.count > 0),
    ],
    [items],
  );

  const visible = filter === 'all' ? items : items.filter((i) => credentialGroup[i.type] === filter);

  return (
    <>
      <PageHeader
        eyebrow="Achievements & Certifications"
        title="Credentials and recognition"
        description="Project confirmation, skills credentials, badges and certificates. Each one links to its official verification page where available."
      >
        {options.length > 2 && <FilterChips label="Filter credentials" options={options} value={filter} onChange={setFilter} />}
      </PageHeader>

      <Section className="pt-14 sm:pt-16 lg:pt-16">
        {visible.length === 0 ? (
          <EmptyState icon={Award} title="Nothing here yet" description="New credentials will appear here." />
        ) : (
          <ul className={cardGrid}>
            {visible.map((item, i) => (
              <li key={item.id}>
                <Reveal delay={Math.min(i * 0.05, 0.2)} className="h-full">
                  <div
                    className={cn(
                      'h-full rounded-2xl transition-shadow duration-500',
                      item.id === targetId && 'ring-4 ring-accent/30 ring-offset-4 ring-offset-canvas',
                    )}
                  >
                    <CredentialCard item={item} />
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
