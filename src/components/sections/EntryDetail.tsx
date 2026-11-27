import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Credential, GalleryImage, ImageAsset } from '@/types';
import { BackLink, MetaList } from '@/components/ui/BackLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Media } from '@/components/ui/CoverArt';
import { Reveal } from '@/components/ui/Reveal';
import { CredentialLinks } from './CredentialLinks';
import { ProjectGallery } from './ProjectGallery';

/**
 * Detail page for an event or a volunteering role (same layout as a project
 * page). Sections without content — cover, recap, photos, certificates — are
 * left out, so an entry without photos stays clean.
 */
export function EntryDetail({
  back,
  badge,
  title,
  subtitle,
  summary,
  link,
  cover,
  recapTitle,
  recap,
  gallery,
  credentials,
  meta,
  more,
}: {
  back: { to: string; label: string };
  badge: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  link: { href: string; label: string } | null;
  cover: ImageAsset | null;
  recapTitle: string;
  recap: string[];
  gallery: GalleryImage[];
  credentials: Credential[];
  meta: Array<{ label: string; value: string | null }>;
  more: { title: string; content: ReactNode } | null;
}) {
  const facts = meta.filter((m): m is { label: string; value: string } => Boolean(m.value));
  const hasMain = recap.length > 0 || gallery.length > 0 || credentials.length > 0;
  return (
    <article>
      <header className="border-b border-line">
        <Container className="pt-10 pb-14 sm:pt-14">
          <BackLink to={back.to} label={back.label} />
          <Reveal className="mt-10 max-w-3xl">
            <Badge tone="accent">{badge}</Badge>
            <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 text-lg text-fg-muted">{subtitle}</p>}
            {summary && <p className="mt-5 text-lg leading-relaxed text-fg-muted">{summary}</p>}
            {link && (
              <div className="mt-8">
                <Button href={link.href} variant="secondary" trailingIcon={<ExternalLink className="size-4" aria-hidden />}>
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </Button>
              </div>
            )}
          </Reveal>
        </Container>
      </header>

      <Container className="py-14 sm:py-20">
        {cover && (
          <Reveal className="mb-14 aspect-[16/8] overflow-hidden rounded-3xl border border-line">
            <Media image={cover} artwork="lattice" seed={title} priority />
          </Reveal>
        )}

        {!hasMain ? (
          facts.length > 0 && (
            <div className="max-w-md">
              <MetaList items={facts} />
            </div>
          )
        ) : (
          <div className="grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <div className="min-w-0 space-y-14">
              {recap.length > 0 && (
                <section aria-labelledby="recap">
                  <h2 id="recap" className="text-2xl font-semibold">
                    {recapTitle}
                  </h2>
                  <div className="mt-5 space-y-5 text-lg leading-relaxed text-fg-muted">
                    {recap.map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </div>
                </section>
              )}

              {gallery.length > 0 && (
                <section aria-labelledby="photos">
                  <h2 id="photos" className="text-2xl font-semibold">
                    Photos
                  </h2>
                  <div className="mt-6">
                    <ProjectGallery images={gallery} title={title} />
                  </div>
                </section>
              )}

              {credentials.length > 0 && (
                <section aria-labelledby="certificates">
                  <h2 id="certificates" className="text-2xl font-semibold">
                    {credentials.length === 1 ? 'Certificate' : 'Certificates'}
                  </h2>
                  <CredentialLinks credentials={credentials} className="mt-5" />
                </section>
              )}

            </div>

            {facts.length > 0 && (
              <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Details">
                <MetaList items={facts} />
              </aside>
            )}
          </div>
        )}
      </Container>

      {more && (
        <section aria-labelledby="more-entries" className="border-t border-line bg-surface py-16 sm:py-20">
          <Container>
            <h2 id="more-entries" className="text-2xl font-semibold">
              {more.title}
            </h2>
            <div className="mt-8">{more.content}</div>
          </Container>
        </section>
      )}
    </article>
  );
}

