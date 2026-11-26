import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useLoaderData, useRevalidator, type LoaderFunctionArgs } from 'react-router-dom';
import type { ContentCollection } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { collectUploads } from '@/lib/uploads';
import { useAdmin } from '../AdminContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IconButton } from '../components/fields';
import {
  AdminError,
  credentialUsages,
  deleteEntry,
  listCollection,
  reorderEntries,
  setVisibility,
  type EntryRow,
  type Usage,
} from '../lib/api';
import { collections, isCollection } from '../lib/collections';

export async function loader({ params }: LoaderFunctionArgs) {
  if (!isCollection(params.collection)) throw new Response('Not Found', { status: 404 });
  const collection = params.collection;
  return { collection, rows: await listCollection<Record<string, unknown>>(collection) };
}

const usageLabel: Record<string, string> = {
  projects: 'Project',
  timeline: 'Education',
  volunteering: 'Volunteering & Experience',
  events: 'Event',
  articles: 'Article',
  research: 'Research',
  credentials: 'Certificate',
  skills: 'Skills',
};

export function Component() {
  const { collection, rows: loaded } = useLoaderData() as { collection: ContentCollection; rows: EntryRow[] };
  const config = collections[collection];
  const { refreshStatus } = useAdmin();
  const revalidator = useRevalidator();
  const [rows, setRows] = useState(loaded);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState<{ row: EntryRow; usages: Usage[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setRows(loaded), [loaded]);

  const fail = (e: unknown) => setMessage({ tone: 'error', text: e instanceof AdminError ? e.message : 'Something went wrong. Reload and try again.' });

  async function moveRow(index: number, to: number) {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    const previous = rows;
    setRows(next);
    try {
      await reorderEntries(collection, next.map((r) => r.id));
      const title = config.describe(item.data as never).title;
      setMessage({ tone: 'ok', text: `Moved “${title}” to position ${to + 1}. Publish to update the site.` });
      refreshStatus();
    } catch (e) {
      setRows(previous);
      fail(e);
    }
  }

  async function toggle(row: EntryRow) {
    const title = config.describe(row.data as never).title;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
    try {
      await setVisibility(collection, row.id, !row.visible);
      setMessage({ tone: 'ok', text: `“${title}” is now ${row.visible ? 'hidden' : 'visible'}. Publish to update the site.` });
      refreshStatus();
    } catch (e) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? row : r)));
      fail(e);
    }
  }

  async function askDelete(row: EntryRow) {
    try {
      const usages = collection === 'credentials' ? await credentialUsages(row.id) : [];
      setPending({ row, usages });
    } catch (e) {
      fail(e);
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const title = config.describe(pending.row.data as never).title;
    try {
      await deleteEntry(collection, pending.row.id, collectUploads(pending.row.data));
      setMessage({ tone: 'ok', text: `Deleted “${title}”. Publish to remove it from the public site.` });
      setPending(null);
      refreshStatus();
      revalidator.revalidate();
    } catch (e) {
      fail(e);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Content</p>
          <h1 className="mt-2 text-3xl font-semibold">{config.label}</h1>
          <p className="mt-2 text-sm text-fg-muted">{config.description}</p>
        </div>
        <Button to={`/admin/${collection}/new`} size="sm" leadingIcon={<Plus className="size-4" aria-hidden />}>
          Add {config.singular}
        </Button>
      </div>

      <div aria-live="polite" className="mt-5 min-h-6">
        {message && (
          <p className={message.tone === 'ok' ? 'text-sm text-accent' : 'text-sm font-medium text-red-600 dark:text-red-400'} role={message.tone === 'error' ? 'alert' : undefined}>
            {message.text}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-fg-muted">Nothing here yet.</p>
      ) : (
        <ol className="mt-3 space-y-2" aria-label={`${config.label} in display order`}>
          {rows.map((row, i) => {
            const { title, subtitle } = config.describe(row.data as never);
            return (
              <li
                key={row.id}
                data-entry-id={row.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
              >
                <span className="hidden w-6 shrink-0 text-center font-mono text-xs text-fg-subtle sm:block">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/${collection}/${row.id}`} className="font-semibold hover:text-accent">
                      {title || '(untitled)'}
                    </Link>
                    {!row.visible && <Badge tone="warning">Hidden</Badge>}
                  </div>
                  {subtitle && <p className="mt-0.5 truncate text-sm text-fg-muted">{subtitle}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <IconButton label={`Move “${title}” up`} onClick={() => moveRow(i, i - 1)} disabled={i === 0}>
                    <ArrowUp className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton label={`Move “${title}” down`} onClick={() => moveRow(i, i + 1)} disabled={i === rows.length - 1}>
                    <ArrowDown className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton label={row.visible ? `Hide “${title}”` : `Show “${title}”`} onClick={() => toggle(row)}>
                    {row.visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </IconButton>
                  <Link
                    to={`/admin/${collection}/${row.id}`}
                    aria-label={`Edit “${title}”`}
                    title="Edit"
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-fg-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <IconButton label={`Delete “${title}”`} onClick={() => askDelete(row)} tone="danger">
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={`Delete “${pending ? config.describe(pending.row.data as never).title : ''}” permanently?`}
        confirmLabel="Delete permanently"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      >
        <p>This removes the entry and its uploaded files from your drafts. It can’t be undone. It disappears from the public site the next time you publish.</p>
        {pending && pending.usages.length > 0 && (
          <div>
            <p className="font-medium text-fg">It is currently used in:</p>
            <ul className="mt-1 list-disc pl-5">
              {pending.usages.map((u) => (
                <li key={`${u.collection}/${u.id}`}>
                  {usageLabel[u.collection] ?? u.collection} — {u.title}
                  {!u.visible && ' (hidden)'}
                </li>
              ))}
            </ul>
            <p className="mt-2">Those entries will keep working; the certificate is simply removed from them.</p>
          </div>
        )}
        {pending && pending.usages.length === 0 && collection === 'credentials' && <p>It isn’t used anywhere else.</p>}
        <p>Tip: use Hide instead if you might want it back.</p>
      </ConfirmDialog>
    </div>
  );
}
