import { ArrowRight, ChevronDown, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CredentialView } from '@/services';
import { credentialIcon } from '@/lib/credentialIcons';
import { credentialTypeLabel } from '@/lib/labels';
import { formatMonth } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const externalLink =
  'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent underline-offset-4 hover:underline';

export function CredentialCard({ item }: { item: CredentialView }) {
  const Icon = credentialIcon[item.type];

  return (
    <article
      id={item.id}
      tabIndex={-1}
      aria-label={item.title}
      className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color] duration-300 hover:border-line-strong hover:shadow-card-hover focus:outline-none"
    >
      <div className="relative aspect-[2/1] shrink-0 overflow-hidden border-b border-line bg-surface-2">
        {item.image ? (
          <img
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            loading="lazy"
            decoding="async"
            className="size-full object-contain p-3"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
            <span className="relative inline-flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent shadow-card">
              <Icon className="size-7" aria-hidden />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <Badge tone="accent">
            <Icon className="size-3.5" aria-hidden />
            {credentialTypeLabel[item.type]}
          </Badge>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug">{item.title}</h3>
        <dl className="mt-3 space-y-1 text-sm">
          <div>
            <dt className="sr-only">Issued by</dt>
            <dd className="text-fg-muted">{item.issuer}</dd>
          </div>
          {item.issueDate && (
            <div className="flex gap-2">
              <dt className="text-fg-subtle">Issued</dt>
              <dd className="text-fg-muted">
                <time dateTime={item.issueDate}>{formatMonth(item.issueDate)}</time>
              </dd>
            </div>
          )}
          {item.credentialId && (
            <div className="flex min-w-0 gap-2">
              <dt className="shrink-0 text-fg-subtle">Credential ID</dt>
              <dd className="truncate font-mono text-xs leading-5 text-fg-muted">{item.credentialId}</dd>
            </div>
          )}
        </dl>
        {item.note && <p className="mt-3 text-sm text-fg-muted">{item.note}</p>}

        {item.courses.length > 0 && (
          <details className="group/details mt-4 rounded-xl border border-line bg-canvas/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {item.courses.length} courses included
              <ChevronDown className="size-4 text-fg-subtle transition-transform group-open/details:rotate-180" aria-hidden />
            </summary>
            <ol className="space-y-2.5 border-t border-line px-4 py-3 text-sm">
              {item.courses.map((course) => (
                <li key={course.title} className="flex items-start justify-between gap-3">
                  <span className="text-fg-muted">{course.title}</span>
                  {course.verifyUrl && (
                    <a
                      href={course.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-accent hover:underline"
                    >
                      Verify
                      <ExternalLink className="size-3" aria-hidden />
                      <span className="sr-only">{course.title} (opens in a new tab)</span>
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}

        {(item.verifyUrl || item.document || item.relatedProjects.length > 0) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
            {item.verifyUrl && (
              <a href={item.verifyUrl} target="_blank" rel="noopener noreferrer" className={externalLink}>
                Verify credential
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            {item.document && (
              <a href={item.document.href} target="_blank" rel="noopener noreferrer" className={externalLink}>
                <FileText className="size-3.5" aria-hidden />
                {item.document.label}
              </a>
            )}
            {item.relatedProjects.map((project) => (
              <Link
                key={project.slug}
                to={`/projects/${project.slug}`}
                className="group/rel inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-fg-muted transition-colors hover:text-accent"
              >
                View project: {project.shortTitle ?? project.title}
                <ArrowRight className="size-3.5 transition-transform group-hover/rel:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
