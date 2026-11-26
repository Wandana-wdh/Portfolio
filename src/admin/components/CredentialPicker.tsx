import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { Credential } from '@/types';
import type { EntryRow } from '../lib/api';
import type { EntryData } from '../lib/collections';

/**
 * Choose certificates to attach. The same certificate can be attached to any
 * number of entries — it is one shared record, edited in Certificates.
 */
export function CredentialPicker({
  label,
  hint,
  value,
  onChange,
  credentials,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  credentials: Array<EntryRow<EntryData<Credential>>>;
}) {
  const id = useId();
  const selected = new Set(value);
  // Keep stored order for existing selections, append new ones in list order.
  const toggle = (credentialId: string, on: boolean) =>
    onChange(on ? [...value, credentialId] : value.filter((v) => v !== credentialId));

  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className="text-sm font-medium">
        {label}
      </p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
      {credentials.length === 0 ? (
        <p className="mt-3 text-sm text-fg-subtle">
          No certificates yet. <Link to="/admin/credentials/new" className="text-accent underline">Add one</Link>.
        </p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
          {credentials.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-2/70">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={(e) => toggle(c.id, e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--accent-solid)]"
                />
                <span className="min-w-0 text-sm">
                  <span className="block font-medium">{c.data.title}</span>
                  <span className="block text-xs text-fg-subtle">
                    {c.data.issuer}
                    {!c.visible && ' · Hidden (won’t show until visible)'}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
