import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useProfile } from '@/hooks/useProfile';
import { ArticleCard, ArticleMeta, MediumAction } from '@/components/cards/ArticleCard';
import { ArticleBody } from '@/components/sections/ArticleBody';
import { BackLink } from '@/components/ui/BackLink';
import { Badge, TechTag } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Media } from '@/components/ui/CoverArt';
import { Reveal } from '@/components/ui/Reveal';
import type { articleDetailLoader, LoaderData } from './loaders';

export default function ArticleDetailPage() {
  const profile = useProfile();
  const { article: a, more } = useLoaderData() as LoaderData<typeof articleDetailLoader>;
  useDocumentMeta({ title: a.title, description: a.excerpt, type: 'article', image: a.cover?.src });

  return (
    <>
      <article>
        <header>
          <Container size="narrow" className="pt-10 sm:pt-14">
            <BackLink to="/articles" label="All articles" />
            <Reveal className="mt-10">
              <div>
                <Badge tone="accent">{a.category}</Badge>
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">{a.title}</h1>
              <p className="mt-5 text-xl leading-relaxed text-fg-muted">{a.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
                <p className="text-sm font-medium">By {profile.name}</p>
                <ArticleMeta article={a} />
              </div>
            </Reveal>
          </Container>
          <Container size="wide" className="mt-10">
            <Reveal className="aspect-[2/1] overflow-hidden rounded-3xl border border-line">
              <Media image={a.cover} artwork={a.artwork} seed={a.slug} priority />
            </Reveal>
          </Container>
        </header>

        <Container size="narrow" className="py-14 sm:py-16">
          {a.body.length > 0 && <ArticleBody blocks={a.body} />}

          <div className={a.body.length > 0 ? 'mt-10' : ''}>
            <MediumAction article={a} className="rounded-full border border-line-strong bg-surface px-5 py-3 hover:border-accent/60" />
          </div>

          {a.tags.length > 0 && (
            <ul className="mt-14 flex flex-wrap gap-1.5 border-t border-line pt-8" aria-label="Tags">
              {a.tags.map((t) => (
                <li key={t}>
                  <TechTag>#{t}</TechTag>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-articles" className="border-t border-line bg-surface py-16 sm:py-20">
          <Container>
            <h2 id="more-articles" className="text-2xl font-semibold">More articles</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((m) => (
                <ArticleCard key={m.id} article={m} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
