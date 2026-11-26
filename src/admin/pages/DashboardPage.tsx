import { useState } from 'react';
import { ArrowRight, Eye, Trash2, UserRound } from 'lucide-react';
import { Link, useLoaderData, useRevalidator } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useAdmin } from '../AdminContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { listEntries, removeDraftFiles, unusedDraftFiles, AdminError } from '../lib/api';
import { collectionOrder, collections } from '../lib/collections';

export async function loader() {
  const [rows, unused] = await Promise.all([listEntries(), unusedDraftFiles().catch(() => [] as string[])]);
  const counts = Object.fromEntries(
    collectionOrder.map((c) => {
      const items = rows.filter((r) => r.collection === c);
      return [c, { total: items.length, hidden: items.filter((r) => !r.visible).length }];
    }),
  );
  return { counts, unused };
}

export function Component() {
  const { counts, unused } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { email, status } = useAdmin();
  const revalidator = useRevalidator();
  const [cleaning, setCleaning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function cleanUp() {
    setBusy(true);
    try {
      await removeDraftFiles(unused);
      setMessage(`Removed ${unused.length} unused upload${unused.length === 1 ? '' : 's'}.`);
      revalidator.revalidate();
    } catch (e) {
      setMessage(e instanceof AdminError ? e.message : 'Clean-up failed.');
    } finally {
      setBusy(false);
      setCleaning(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-fg-muted">Signed in as {email}.</p>
      </div>

      <section aria-labelledby="publish-heading" className="rounded-2xl border border-line bg-surface p-6">
        <h2 id="publish-heading" className="text-lg font-semibold">
          Publishing
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Edits are saved as private drafts. <strong className="text-fg">Preview</strong> shows the whole site with your drafts (only you can see it);{' '}
          <strong className="text-fg">Publish</strong> makes them public — no redeploy needed.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2/60 p-4">
            <dt className="text-xs text-fg-subtle">Public site</dt>
            <dd className="mt-1 text-sm font-medium">
              {status?.published
                ? `Version ${status.published.version} · published ${formatDate(status.published.publishedAt.slice(0, 10))}`
                : status
                  ? 'Not published yet'
                  : 'Checking…'}
            </dd>
          </div>
          <div className="rounded-xl bg-surface-2/60 p-4">
            <dt className="text-xs text-fg-subtle">Drafts</dt>
            <dd className="mt-1 text-sm font-medium">{status ? (status.hasChanges ? 'Unpublished changes waiting' : 'Everything is published') : 'Checking…'}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/?preview=1" target="_blank" variant="secondary" size="sm" leadingIcon={<Eye className="size-4" aria-hidden />}>
            Preview drafts
          </Button>
          <p className="self-center text-xs text-fg-subtle">Use the Publish button at the top when you’re ready.</p>
        </div>
      </section>

      <section aria-labelledby="content-heading">
        <h2 id="content-heading" className="text-lg font-semibold">
          Content
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <Link to="/admin/profile" className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50">
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <UserRound className="size-4 text-accent" aria-hidden />
                  Profile
                </span>
                <span className="mt-1 block text-sm text-fg-muted">Photo, hero and About text, links, CV</span>
              </span>
              <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
            </Link>
          </li>
          {collectionOrder.map((c) => (
            <li key={c}>
              <Link to={`/admin/${c}`} className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50">
                <span>
                  <span className="block font-semibold">{collections[c].label}</span>
                  <span className="mt-1 block text-sm text-fg-muted">
                    {counts[c].total} {counts[c].total === 1 ? 'entry' : 'entries'}
                    {counts[c].hidden > 0 && ` · ${counts[c].hidden} hidden`}
                  </span>
                </span>
                <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="files-heading" className="rounded-2xl border border-line bg-surface p-6">
        <h2 id="files-heading" className="text-lg font-semibold">
          Uploaded files
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          {unused.length > 0
            ? `${unused.length} uploaded file${unused.length === 1 ? ' is' : 's are'} no longer used by any entry.`
            : 'No unused uploads.'}
        </p>
        {message && (
          <p role="status" className="mt-3 text-sm text-accent">
            {message}
          </p>
        )}
        {unused.length > 0 && (
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setCleaning(true)} leadingIcon={<Trash2 className="size-4" aria-hidden />}>
            Clean up unused uploads
          </Button>
        )}
      </section>

      <ConfirmDialog
        open={cleaning}
        title="Delete unused uploads?"
        confirmLabel={`Delete ${unused.length} file${unused.length === 1 ? '' : 's'}`}
        danger
        busy={busy}
        onConfirm={cleanUp}
        onCancel={() => setCleaning(false)}
      >
        <p>These private draft files aren’t used by any entry. Published files are not affected.</p>
      </ConfirmDialog>
    </div>
  );
}
