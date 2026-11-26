import { useMemo, useState } from 'react';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import type { ArticleCategory } from '@/types';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { siteConfig } from '@/data/site';
import { unique } from '@/lib/utils';
import { MediumIcon } from '@/components/ui/SocialIcon';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Section } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChips } from '@/components/ui/FilterChips';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import type { articlesLoader, LoaderData } from './loaders';

type Filter = 'all' | ArticleCategory;

export default function ArticlesPage() {
  const { articles } = useLoaderData() as LoaderData<typeof articlesLoader>;
  const [filter, setFilter] = useState<Filter>('all');
  useDocumentMeta({
    title: 'Articles',
    description: 'Writing by Wandana Herath on Medium — sharing what I’m learning across software, security and more.',
  });

  const options = useMemo(
    () => [
      { value: 'all' as Filter, label: 'All', count: articles.length },
      ...unique(articles.map((a) => a.category)).map((c) => ({
        value: c as Filter,
        label: c,
        count: articles.filter((a) => a.category === c).length,
      })),
    ],
    [articles],
  );

  const visible = filter === 'all' ? articles : articles.filter((a) => a.category === filter);
  const [lead, ...rest] = visible;

  return (
    <>
      <PageHeader
        eyebrow="Articles"
        title="Writing"
        description="I share what I’m learning through writing on Medium — across software, security and the ideas behind them."
      >
        <div className="flex flex-col gap-6">
          {options.length > 2 && <FilterChips label="Filter articles by category" options={options} value={filter} onChange={setFilter} />}
          <a
            href={siteConfig.mediumProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 self-start rounded-md text-sm font-medium text-accent"
          >
            <MediumIcon className="size-4" />
            View my Medium profile
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </PageHeader>

      <Section className="pt-14 sm:pt-16 lg:pt-16">
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} article{visible.length === 1 ? '' : 's'}
        </p>
        {!lead ? (
          <EmptyState icon={PenLine} title="No articles here yet" description="New writing will appear here as it is published." />
        ) : (
          <>
            <Reveal key={`${filter}-lead`}>
              <ArticleCard article={lead} variant="featured" />
            </Reveal>
            {rest.length > 0 && (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((a, i) => (
                  <Reveal key={`${filter}-${a.id}`} delay={Math.min(i * 0.05, 0.2)} className="h-full">
                    <ArticleCard article={a} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
