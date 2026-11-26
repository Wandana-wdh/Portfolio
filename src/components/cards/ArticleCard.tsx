import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '@/types';
import { siteConfig } from '@/data/site';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Media } from '@/components/ui/CoverArt';
import { MediumIcon } from '@/components/ui/SocialIcon';

/** Publication date and reading time — each shown only when known. */
export function ArticleMeta({ article, className }: { article: Article; className?: string }) {
  if (!article.publishedAt && !article.readingMinutes) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-subtle', className)}>
      {article.publishedAt && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </span>
      )}
      {article.readingMinutes && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {article.readingMinutes} min read
        </span>
      )}
    </div>
  );
}

/**
 * "Read on Medium" for a direct story link; "View my Medium profile" when the
 * story URL is not known yet.
 */
export function MediumAction({ article, className }: { article: Article; className?: string }) {
  const direct = Boolean(article.url);
  return (
    <a
      href={article.url ?? siteConfig.mediumProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('group/medium inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent', className)}
    >
      <MediumIcon className="size-4" />
      {direct ? 'Read on Medium' : 'View my Medium profile'}
      <ArrowUpRight className="size-3.5 transition-transform group-hover/medium:translate-x-0.5 group-hover/medium:-translate-y-0.5" aria-hidden />
      <span className="sr-only">{direct ? `: ${article.title}` : ''} (opens in a new tab)</span>
    </a>
  );
}

/** Title/image go straight to Medium for Medium-hosted stories, otherwise to the on-site page. */
function ArticleLink({ article, children, className, decorative }: { article: Article; children: ReactNode; className?: string; decorative?: boolean }) {
  const a11y = decorative ? ({ tabIndex: -1, 'aria-hidden': true } as const) : {};
  if (article.url && article.body.length === 0) {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer" className={className} {...a11y}>
        {children}
      </a>
    );
  }
  return (
    <Link to={`/articles/${article.slug}`} className={className} {...a11y}>
      {children}
    </Link>
  );
}

export function ArticleCard({ article, variant = 'default' }: { article: Article; variant?: 'default' | 'featured' }) {
  const featured = variant === 'featured';
  const onSite = article.body.length > 0;

  return (
    <article
      className={cn(
        'group grid h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color] duration-300 hover:border-line-strong hover:shadow-card-hover',
        featured ? 'md:grid-cols-[1.15fr_1fr]' : 'grid-rows-[auto_1fr]',
      )}
    >
      <ArticleLink
        article={article}
        decorative
        className={cn('relative block overflow-hidden', featured ? 'aspect-[16/9] md:aspect-auto md:min-h-80' : 'aspect-[16/9]')}
      >
        <Media
          image={article.cover}
          artwork={article.artwork}
          seed={article.slug}
          className="absolute inset-0 transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
        />
      </ArticleLink>

      <div className={cn('flex flex-col', featured ? 'p-7 sm:p-9' : 'p-6')}>
        <div>
          <Badge tone="accent">{article.category}</Badge>
        </div>
        <h3 className={cn('mt-4 font-semibold leading-snug', featured ? 'text-2xl sm:text-3xl' : 'text-lg')}>
          <ArticleLink article={article} className="rounded-sm transition-colors hover:text-accent">
            {article.title}
          </ArticleLink>
        </h3>
        <p className={cn('mt-3 leading-relaxed text-fg-muted', featured ? 'text-base' : 'line-clamp-3 text-sm')}>
          {article.excerpt}
        </p>
        <ArticleMeta article={article} className="mt-5" />
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-6">
          {onSite && (
            <Link
              to={`/articles/${article.slug}`}
              aria-label={`Read article: ${article.title}`}
              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent"
            >
              Read Article
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
          {(!onSite || article.url) && <MediumAction article={article} />}
        </div>
      </div>
    </article>
  );
}
