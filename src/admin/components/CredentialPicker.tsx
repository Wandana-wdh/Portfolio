import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Attachment, Credential, CredentialType } from '@/types';
import { Button } from '@/components/ui/Button';
import { credentialTypeLabel } from '@/lib/labels';
import { useAdmin } from '../AdminContext';
import { AdminError, removeDraftFiles, saveEntry, type EntryRow } from '../lib/api';
import type { EntryData } from '../lib/collections';
import { uniqueId, validator, type Errors } from '../lib/validation';
import { DocumentField } from './FileFields';
import { CheckboxField, SelectField, TextField } from './fields';

type CredentialRow = EntryRow<EntryData<Credential>>;

const typeOptions = (Object.keys(credentialTypeLabel) as CredentialType[]).map((value) => ({ value, label: credentialTypeLabel[value] }));

/**
 * Choose certificates to attach. The same certificate can be attached to any
 * number of entries — it is one shared record, edited in Certificates, so
 * replacing its file there updates every place it appears.
 * With `create`, a new certificate (with an uploaded PDF or image) can be added
 * from here; it is saved as a draft certificate straight away.
 */
export function CredentialPicker({
  label,
  hint,
  value,
  onChange,
  credentials,
  create,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  credentials: CredentialRow[];
  create?: { type: CredentialType; inAchievements: boolean; issuer?: string };
}) {
  const id = useId();
  const { refreshStatus } = useAdmin();
  const [created, setCreated] = useState<CredentialRow[]>([]);
  const [creating, setCreating] = useState(false);
  const all = [...credentials, ...created.filter((c) => !credentials.some((x) => x.id === c.id))];
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
      {all.length === 0 ? (
        <p className="mt-3 text-sm text-fg-subtle">
          No certificates yet.{' '}
          {!create && (
            <Link to="/admin/credentials/new" className="text-accent underline">
              Add one
            </Link>
          )}
        </p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
          {all.map((c) => (
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
                    {[
                      c.data.issuer,
                      c.data.document || c.data.image ? 'File attached' : 'No file yet',
                      c.data.inAchievements === false ? 'Not on Achievements' : null,
                      !c.visible ? 'Hidden (won’t show until visible)' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {create && (
        <>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setCreating(true)} leadingIcon={<Plus className="size-4" aria-hidden />}>
            New certificate with file
          </Button>
          {creating && (
            <NewCredentialDialog
              defaults={create}
              takenIds={all.map((c) => c.id)}
              onCancel={() => setCreating(false)}
              onCreated={(row) => {
                setCreated((list) => [...list, row]);
                onChange([...value, row.id]);
                setCreating(false);
                refreshStatus();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Creates a certificate (draft) with an uploaded PDF or image, without leaving the current editor. */
function NewCredentialDialog({
  defaults,
  takenIds,
  onCancel,
  onCreated,
}: {
  defaults: { type: CredentialType; inAchievements: boolean; issuer?: string };
  takenIds: string[];
  onCancel: () => void;
  onCreated: (row: CredentialRow) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [folder] = useState(() => `credentials/new-${crypto.randomUUID().slice(0, 8)}`);
  const [uploads] = useState(() => new Set<string>());
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState(defaults.issuer ?? '');
  const [type, setType] = useState<CredentialType>(defaults.type);
  const [issueDate, setIssueDate] = useState('');
  const [document, setDocument] = useState<Attachment | null>(null);
  const [inAchievements, setInAchievements] = useState(defaults.inAchievements);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function cancel() {
    if (busy) return;
    if (uploads.size) void removeDraftFiles([...uploads]).catch(() => undefined);
    onCancel();
  }

  async function save() {
    const v = validator();
    v.check(Boolean(title.trim()), 'title', 'Enter a title.');
    v.check(Boolean(issuer.trim()), 'issuer', 'Enter who issued it.');
    v.date(issueDate, 'issueDate');
    v.check(Boolean(document), 'document', 'Upload the certificate or results document.');
    setErrors(v.errors);
    if (Object.keys(v.errors).length > 0) return;

    const id = uniqueId(title, takenIds);
    const data: EntryData<Credential> = {
      type,
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim() || null,
      credentialId: null,
      verifyUrl: null,
      image: null,
      document,
      courses: [],
      inAchievements,
      note: null,
    };
    setBusy(true);
    setFailure(null);
    try {
      const row = await saveEntry('credentials', id, data, true);
      const unused = [...uploads].filter((p) => p !== document?.href);
      if (unused.length) void removeDraftFiles(unused).catch(() => undefined);
      uploads.clear();
      onCreated(row as CredentialRow);
    } catch (e) {
      setFailure(e instanceof AdminError ? e.message : 'Saving failed — try again.');
      setBusy(false);
    }
  }

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        cancel();
      }}
      className="m-auto max-h-[92vh] w-[min(36rem,94vw)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-navy/60 backdrop:backdrop-blur-sm"
    >
      <form
        noValidate
        className="space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation(); // don't submit the entry editor around this dialog
          void save();
        }}
      >
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            New certificate
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Saved to Certificates as a draft and attached here. Edit or replace its file later in Certificates — every place it’s attached updates.
          </p>
        </div>
        <TextField label="Title" required value={title} onChange={setTitle} error={errors.title} placeholder="e.g. GCE Advanced Level results" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Issuer" required value={issuer} onChange={setIssuer} error={errors.issuer} />
          <SelectField label="Type" value={type} onChange={setType} options={typeOptions} />
        </div>
        <TextField label="Issue date (optional)" value={issueDate} onChange={setIssueDate} error={errors.issueDate} placeholder="2022" hint="YYYY, YYYY-MM or YYYY-MM-DD." />
        <div>
          <DocumentField
            label="Certificate or results file"
            value={document}
            onChange={setDocument}
            folder={folder}
            onUploaded={(path) => uploads.add(path)}
            kinds={['pdf', 'image']}
            defaultLabel="View certificate"
            showLabel={false}
            hint="PDF or image, up to 10 MB. Remove personal details (index or ID numbers, addresses) first."
          />
          {errors.document && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{errors.document}</p>}
        </div>
        <CheckboxField
          label="List on the Achievements page"
          checked={inAchievements}
          onChange={setInAchievements}
          hint="Leave off for school certificates so they only appear where they are attached."
        />
        {failure && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {failure}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={cancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Saving…' : 'Save and attach'}
          </Button>
        </div>
      </form>
    </dialog>,
    window.document.body,
  );
}
