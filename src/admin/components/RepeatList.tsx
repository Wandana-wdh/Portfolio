import type { ReactNode } from 'react';
import { AddButton, RowControls } from './fields';
import { move } from '../lib/listUtils';

/** A list of small structured items (links, courses...) with add / reorder / remove. */
export function RepeatList<T>({
  label,
  hint,
  items,
  onChange,
  create,
  itemLabel,
  addLabel,
  render,
}: {
  label: string;
  hint?: ReactNode;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  itemLabel: string;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
      <ol className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-xl border border-line bg-surface-2/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-fg-subtle">
                {itemLabel} {i + 1}
              </span>
              <RowControls
                index={i}
                count={items.length}
                itemLabel={`${itemLabel.toLowerCase()} ${i + 1}`}
                onMove={(to) => onChange(move(items, i, to))}
                onRemove={() => onChange(items.filter((_, j) => j !== i))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">{render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>
          </li>
        ))}
      </ol>
      <div className="mt-3">
        <AddButton onClick={() => onChange([...items, create()])}>{addLabel}</AddButton>
      </div>
    </div>
  );
}
