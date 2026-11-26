import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-accent">
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      {label}
    </Link>
  );
}

/** Key/value list used in detail-page sidebars. */
export function MetaList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 px-5 py-4 text-sm">
          <dt className="text-fg-subtle">{item.label}</dt>
          <dd className="text-right font-medium text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
