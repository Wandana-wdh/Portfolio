import { ExternalLink, Target } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { isActiveResearch, researchStatusLabel } from '@/lib/labels';
import { formatMonth } from '@/lib/utils';
import { ResearchPipeline } from '@/components/sections/ResearchPipeline';
import { BackLink, MetaList } from '@/components/ui/BackLink';
import { StatusPill, TechTag } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Media } from '@/components/ui/CoverArt';
import { Reveal } from '@/components/ui/Reveal';
import type { LoaderData, researchDetailLoader } from './loaders';

export default function ResearchDetailPage() {
  const { research: r } = useLoaderData() as LoaderData<typeof researchDetailLoader>;
  useDocumentMeta({ title: r.title, description: r.summary, type: 'article', image: r.cover?.src });

  const meta = [
    { label: 'Status', value: researchStatusLabel[r.status] },
    { label: 'Institution', value: r.institution },
    r.startDate ? { label: 'Started', value: formatMonth(r.startDate) } : null,
    r.supervisor ? { label: 'Supervisor', value: r.supervisor } : null,
  ].filter((m): m is { label: string; value: string } => m !== null);

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
        <Container className="relative pt-10 pb-14 sm:pt-14">
          <BackLink to="/research" label="Undergraduate research" />
          <Reveal className="mt-10 max-w-4xl">
            <StatusPill label={researchStatusLabel[r.status]} active={isActiveResearch(r.status)} />
            <h1 className="mt-6 text-5xl font-semibold tracking-tighter sm:text-6xl">{r.title}</h1>
            <p className="mt-5 max-w-3xl font-display text-xl leading-snug text-fg-muted sm:text-2xl">{r.summary}</p>
          </Reveal>
        </Container>
      </header>

      <Container className="py-14 sm:py-20">
        <Reveal className="aspect-[21/9] overflow-hidden rounded-3xl border border-line">
          <Media image={r.cover} artwork={r.artwork} seed={r.slug} label={r.title} priority />
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0 space-y-14">
            <section aria-labelledby="overview">
              <h2 id="overview" className="text-2xl font-semibold">Overview</h2>
              <div className="mt-5 space-y-5 text-lg leading-relaxed text-fg-muted">
                {r.description.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </section>

            {r.questions.length > 0 && (
              <section aria-labelledby="questions">
                <h2 id="questions" className="text-2xl font-semibold">Questions I’m exploring</h2>
                <ol className="mt-6 space-y-4">
                  {r.questions.map((q, i) => (
                    <li key={q} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs font-semibold text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="leading-relaxed text-fg-muted">{q}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section aria-labelledby="concept">
              <h2 id="concept" className="text-2xl font-semibold">Concept</h2>
              <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <ResearchPipeline />
              </div>
            </section>

            <section aria-labelledby="methodology">
              <h2 id="methodology" className="text-2xl font-semibold">Methodology</h2>
              {r.methodology.length > 0 ? (
                <ul className="mt-5 list-disc space-y-2 pl-5 text-fg-muted marker:text-accent">
                  {r.methodology.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-line-strong p-5 text-fg-muted">
                  <Target className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  This research is at an early stage. Methodology and findings will be shared as the work progresses.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Research details">
            <MetaList items={meta} />

            {r.areas.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">Research areas</h2>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {r.areas.map((a) => (
                    <li key={a}>
                      <TechTag>{a}</TechTag>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.links.length > 0 && (
              <ul className="space-y-2">
                {r.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                      {l.label} <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
