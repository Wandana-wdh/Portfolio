import { ArrowRight, CheckCircle2, Download, ExternalLink, FileText, UserRound, Users } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { credentialTypeLabel, workStatusLabel } from '@/lib/labels';
import { formatMonth } from '@/lib/utils';
import { cardGrid } from '@/lib/layout';
import { credentialIcon } from '@/lib/credentialIcons';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ProjectGallery } from '@/components/sections/ProjectGallery';
import { BackLink, MetaList } from '@/components/ui/BackLink';
import { Badge, StatusBadge, TechTag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Media } from '@/components/ui/CoverArt';
import { Reveal } from '@/components/ui/Reveal';
import { GitHubIcon } from '@/components/ui/SocialIcon';
import type { LoaderData, projectDetailLoader } from './loaders';

/** Supabase Storage sends the file as a download (not a page) when the URL has a "download" parameter. */
function downloadUrl(href: string): string {
  if (!href.includes('/storage/v1/object/')) return href;
  return `${href}${href.includes('?') ? '&' : '?'}download=`;
}

export default function ProjectDetailPage() {
  const { project: p, credentials, others } = useLoaderData() as LoaderData<typeof projectDetailLoader>;
  useDocumentMeta({ title: p.title, description: p.summary, type: 'article', image: p.cover?.src });

  const overview = p.description.length > 0 ? p.description : [p.summary];
  const meta = [
    { label: 'Category', value: p.category },
    p.status ? { label: 'Status', value: workStatusLabel[p.status] } : null,
    p.team ? { label: 'Type', value: 'Team project' } : null,
    p.role ? { label: 'Role', value: p.role } : null,
    p.year ? { label: 'Year', value: p.year } : null,
  ].filter((m): m is { label: string; value: string } => m !== null);

  return (
    <article>
      <header className="border-b border-line">
        <Container className="pt-10 pb-14 sm:pt-14">
          <BackLink to="/projects" label="All projects" />
          <Reveal className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{p.category}</Badge>
              {p.team && (
                <Badge tone="outline">
                  <Users className="size-3.5" aria-hidden />
                  Team project
                </Badge>
              )}
              <StatusBadge status={p.status} />
            </div>
            <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{p.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-fg-muted">{p.summary}</p>
            {(p.repositories.length > 0 || p.liveUrl || p.presentation?.href) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {p.repositories.map((repo) => (
                  <Button key={repo.url} href={repo.url} variant="secondary" leadingIcon={<GitHubIcon className="size-4" />}>
                    {p.repositories.length === 1 ? 'View on GitHub' : `GitHub · ${repo.label}`}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Button>
                ))}
                {p.liveUrl && (
                  <Button href={p.liveUrl} trailingIcon={<ExternalLink className="size-4" aria-hidden />}>
                    Live demo
                  </Button>
                )}
                {/* Only when a presentation is available in this view (published, or a draft in preview). */}
                {p.presentation?.href && (
                  <Button href={downloadUrl(p.presentation.href)} download variant="secondary" leadingIcon={<Download className="size-4" aria-hidden />}>
                    {p.presentation.label || 'Download Project Presentation'}
                    <span className="sr-only"> (PowerPoint file)</span>
                  </Button>
                )}
              </div>
            )}
          </Reveal>
        </Container>
      </header>

      <Container className="py-14 sm:py-20">
        <Reveal className="aspect-[16/8] overflow-hidden rounded-3xl border border-line">
          <Media image={p.cover} artwork={p.artwork} seed={p.slug} label={p.category} priority />
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0 space-y-14">
            <section aria-labelledby="overview">
              <h2 id="overview" className="text-2xl font-semibold">Overview</h2>
              <div className="mt-5 space-y-5 text-lg leading-relaxed text-fg-muted">
                {overview.map((d) => (
                  <p key={d.slice(0, 32)}>{d}</p>
                ))}
              </div>
            </section>

            {p.contribution.length > 0 && (
              <section aria-labelledby="contribution" className="rounded-2xl border border-accent/30 bg-accent-soft p-6 sm:p-7">
                <h2 id="contribution" className="flex items-center gap-2.5 text-2xl font-semibold">
                  <UserRound className="size-5 text-accent" aria-hidden />
                  My contribution
                </h2>
                <ul className="mt-5 space-y-3">
                  {p.contribution.map((c) => (
                    <li key={c} className="flex items-start gap-3 leading-relaxed text-fg">
                      <CheckCircle2 className="mt-1 size-[18px] shrink-0 text-accent" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.highlights.length > 0 && (
              <section aria-labelledby="highlights">
                <h2 id="highlights" className="text-2xl font-semibold">Key features</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                      <span className="text-sm leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.gallery.length > 0 && (
              <section aria-labelledby="gallery">
                <h2 id="gallery" className="text-2xl font-semibold">Screenshots</h2>
                <div className="mt-6">
                  <ProjectGallery images={p.gallery} title={p.title} />
                </div>
              </section>
            )}

            {credentials.length > 0 && (
              <section aria-labelledby="confirmation">
                <h2 id="confirmation" className="text-2xl font-semibold">
                  {credentials.length === 1 ? credentialTypeLabel[credentials[0].type] : 'Related credentials'}
                </h2>
                <ul className="mt-6 space-y-3">
                  {credentials.map((c) => {
                    const Icon = credentialIcon[c.type];
                    return (
                      <li key={c.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
                        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{c.title}</span>
                          <span className="block text-sm text-fg-muted">
                            {c.issuer}
                            {c.issueDate && ` · ${formatMonth(c.issueDate)}`}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                          {c.document && (
                            <a
                              href={c.document.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent hover:underline"
                            >
                              <FileText className="size-4" aria-hidden />
                              {c.document.label}
                            </a>
                          )}
                          <Link
                            to={`/achievements#${c.id}`}
                            className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-fg-muted transition-colors hover:text-accent"
                          >
                            View in credentials
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                          </Link>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Project details">
            <MetaList items={meta} />
            {p.tech.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">Technology</h2>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <li key={t}>
                      <TechTag>{t}</TechTag>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>

      {others.length > 0 && (
        <section aria-labelledby="more-projects" className="border-t border-line bg-surface py-16 sm:py-20">
          <Container>
            <h2 id="more-projects" className="text-2xl font-semibold">More projects</h2>
            <ul className={`mt-8 ${cardGrid}`}>
              {others.map((o) => (
                <li key={o.id}>
                  <ProjectCard project={o} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}
