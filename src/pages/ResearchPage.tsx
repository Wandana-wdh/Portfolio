import { ArrowRight, FlaskConical } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { isActiveResearch, researchStatusLabel } from '@/lib/labels';
import { unique } from '@/lib/utils';
import { StatusPill, TechTag } from '@/components/ui/Badge';
import { Media } from '@/components/ui/CoverArt';
import { Section } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { LoaderData, researchListLoader } from './loaders';

export default function ResearchPage() {
  const { research } = useLoaderData() as LoaderData<typeof researchListLoader>;
  const areas = unique(research.flatMap((r) => r.areas));
  useDocumentMeta({
    title: 'Undergraduate Research',
    description: 'Undergraduate research by Wandana Herath at the University of Jaffna.',
  });

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Undergraduate Research"
        description="Research questions I’m exploring alongside my software work at the University of Jaffna."
      />

      <Section labelledBy="research-list-title">
        <h2 id="research-list-title" className="sr-only">
          Research projects
        </h2>
        {research.length === 0 ? (
          <EmptyState icon={FlaskConical} title="Nothing to show yet" description="Research projects will appear here." />
        ) : (
          <div className="space-y-8">
            {research.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.05}>
                <article className="group grid overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-shadow hover:shadow-card-hover lg:grid-cols-[1fr_1.1fr]">
                  <Link to={`/research/${r.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden lg:aspect-auto">
                    <Media
                      image={r.cover}
                      artwork={r.artwork}
                      seed={r.slug}
                      label={`${researchStatusLabel[r.status]} · ${r.institution}`}
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-col p-7 sm:p-10">
                    <div>
                      <StatusPill label={researchStatusLabel[r.status]} active={isActiveResearch(r.status)} />
                    </div>
                    <h3 className="mt-5 text-3xl font-semibold sm:text-4xl">
                      <Link to={`/research/${r.slug}`} className="rounded-sm transition-colors hover:text-accent">
                        {r.title}
                      </Link>
                    </h3>
                    <p className="mt-5 text-lg leading-relaxed text-fg-muted">{r.summary}</p>
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
                      {r.tags.map((t) => (
                        <li key={t}>
                          <TechTag>{t}</TechTag>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/research/${r.slug}`}
                      className="mt-8 inline-flex items-center gap-1.5 self-start rounded-md text-sm font-medium text-accent"
                    >
                      View Research
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {areas.length > 0 && (
        <Section labelledBy="interests-title" className="border-t border-line bg-surface">
          <SectionHeading id="interests-title" eyebrow="Research areas" title="Areas I’m exploring" />
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area, i) => (
              <li key={area} className="bg-surface p-6 transition-colors hover:bg-surface-2/60">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-3 font-display text-lg font-medium">{area}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </>
  );
}
