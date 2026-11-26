import type { ReactNode } from 'react';
import { ArrowRight, ExternalLink, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Credential } from '@/types';
import { cn, formatMonth } from '@/lib/utils';

/** The certificate file (PDF first, then image) available in this view, if any. */
const credentialFile = (c: Credential): string | null => c.document?.href || c.image?.src || null;

const linkClass = 'group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent hover:underline';

/**
 * Links for the certificates attached to an Education, Experience or Event entry.
 *  - a file is available → "View certificate" opens it;
 *  - otherwise, unless `requireFile`, a credential listed on Achievements links there;
 *  - otherwise nothing is shown.
 * `extra` adds one more link to the same row (e.g. an event page).
 */
export function CredentialLinks({
  credentials,
  requireFile = false,
  extra,
  className,
}: {
  credentials: Credential[];
  requireFile?: boolean;
  extra?: ReactNode;
  className?: string;
}) {
  const items = credentials
    .map((c) => ({ c, file: credentialFile(c) }))
    .filter(({ c, file }) => file || (!requireFile && c.inAchievements));
  if (items.length === 0 && !extra) return null;
  const many = items.length > 1;

  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-2', className)} aria-label="Certificates and links">
      {items.map(({ c, file }) => (
        <li key={c.id}>
          {file ? (
            <a href={file} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Paperclip className="size-3.5" aria-hidden />
              {c.document?.label || (many ? c.title : 'View certificate')}
              <span className="sr-only">
                {!many && `: ${c.title}`} (opens in a new tab)
              </span>
              <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : (
            <Link to={`/achievements#${c.id}`} className={linkClass}>
              {many ? c.title : 'View credential'}
              {c.issueDate && ` · ${formatMonth(c.issueDate)}`}
              {!many && <span className="sr-only">: {c.title}</span>}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </li>
      ))}
      {extra && <li>{extra}</li>}
    </ul>
  );
}
