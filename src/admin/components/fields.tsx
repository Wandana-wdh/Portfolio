import { useId, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { move } from '../lib/listUtils';

export const inputClass =
  'block w-full rounded-xl border border-line-strong bg-canvas px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle ' +
  'transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none ' +
  'aria-invalid:border-red-500/70 disabled:opacity-60';

export function FieldShell({
  label,
  hint,
  error,
  required,
  children,
  id,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-fg-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

interface TextProps {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'number' | 'password';
  className?: string;
  autoComplete?: string;
  name?: string;
}

export function TextField({ label, value, onChange, hint, error, required, placeholder, type = 'text', className, autoComplete, name }: TextProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextAreaField({ label, value, onChange, hint, error, required, placeholder, rows = 4, className }: Omit<TextProps, 'type'> & { rows?: number }) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputClass, 'resize-y leading-relaxed')}
      />
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  hint?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass} aria-describedby={describedBy(id, hint)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 size-4 shrink-0 rounded border-line-strong accent-[var(--accent-solid)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="mt-0.5 text-xs text-fg-subtle">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fieldset grouping with a heading. */
export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-lg font-semibold" aria-hidden>
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </fieldset>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
  tone = 'default',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors disabled:pointer-events-none disabled:opacity-35',
        tone === 'danger' ? 'hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400' : 'hover:border-accent/50 hover:text-accent',
      )}
    >
      {children}
    </button>
  );
}


/** Up / down / remove controls for one row of an editable list. */
export function RowControls({ index, count, onMove, onRemove, itemLabel }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; itemLabel: string }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <IconButton label={`Move ${itemLabel} up`} onClick={() => onMove(index - 1)} disabled={index === 0}>
        <ArrowUp className="size-4" aria-hidden />
      </IconButton>
      <IconButton label={`Move ${itemLabel} down`} onClick={() => onMove(index + 1)} disabled={index === count - 1}>
        <ArrowDown className="size-4" aria-hidden />
      </IconButton>
      <IconButton label={`Remove ${itemLabel}`} onClick={onRemove} tone="danger">
        <Trash2 className="size-4" aria-hidden />
      </IconButton>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-line-strong px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:border-accent/60 hover:text-accent"
    >
      <Plus className="size-4" aria-hidden />
      {children}
    </button>
  );
}

/** Editable list of short texts (technologies, highlights, paragraphs...). */
export function StringListField({
  label,
  values,
  onChange,
  hint,
  itemLabel = 'item',
  multiline = false,
  addLabel = 'Add',
  error,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: ReactNode;
  itemLabel?: string;
  multiline?: boolean;
  addLabel?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-medium">
        {label}
      </p>
      {hint && <p className="mb-2 text-xs text-fg-subtle">{hint}</p>}
      <ol className="space-y-2">
        {values.map((value, i) => (
          <li key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                aria-label={`${label} ${i + 1}`}
                rows={3}
                value={value}
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
                className={cn(inputClass, 'resize-y')}
              />
            ) : (
              <input
                aria-label={`${label} ${i + 1}`}
                value={value}
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
                className={inputClass}
              />
            )}
            <RowControls
              index={i}
              count={values.length}
              itemLabel={`${itemLabel} ${i + 1}`}
              onMove={(to) => onChange(move(values, i, to))}
              onRemove={() => onChange(values.filter((_, j) => j !== i))}
            />
          </li>
        ))}
      </ol>
      <div className="mt-2">
        <AddButton onClick={() => onChange([...values, ''])}>{addLabel}</AddButton>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

