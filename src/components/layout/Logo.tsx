import { Link } from 'react-router-dom';

export function Logo({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('');
  return (
    <Link to="/" className="group flex items-center gap-3 rounded-lg" aria-label={`${name} — home`}>
      <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-navy font-display text-sm font-bold text-offwhite ring-1 ring-line-strong transition-transform duration-300 group-hover:-rotate-6 dark:bg-surface-2">
        {initials}
        <span aria-hidden className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-canvas bg-emerald-brand" />
      </span>
      <span className="hidden font-display text-[0.95rem] font-semibold tracking-tight sm:inline">{name}</span>
    </Link>
  );
}
