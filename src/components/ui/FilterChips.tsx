import { cn } from '@/lib/utils';

interface FilterChipsProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
}

/** Accessible single-select filter (toggle buttons with aria-pressed). */
export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
              active
                ? 'border-transparent bg-fg text-canvas'
                : 'border-line-strong bg-surface text-fg-muted hover:border-accent/50 hover:text-fg',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('font-mono text-xs', active ? 'text-canvas/70' : 'text-fg-subtle')}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
