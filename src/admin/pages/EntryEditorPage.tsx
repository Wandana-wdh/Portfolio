import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';
import type { ContentCollection, Credential } from '@/types';
import { Button } from '@/components/ui/Button';
import { useAdmin } from '../AdminContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CheckboxField } from '../components/fields';
import { forms } from '../forms';
import { listEntries, type EntryRow } from '../lib/api';
import { collections, isCollection, type EntryData } from '../lib/collections';
import { useEntryEditor, type SaveState } from '../lib/useEntryEditor';
import { uniqueId } from '../lib/validation';

export async function loader({ params }: LoaderFunctionArgs) {
  if (!isCollection(params.collection)) throw new Response('Not Found', { status: 404 });
  const collection = params.collection;
  const rows = await listEntries();
  const own = rows.filter((r) => r.collection === collection);
  const isNew = params.id === 'new';
  const row = isNew ? null : (own.find((r) => r.id === params.id) ?? null);
  if (!isNew && !row) throw new Response('Not Found', { status: 404 });
  return {
    collection,
    row,
    takenIds: own.map((r) => r.id),
    takenSlugs: own.filter((r) => r.id !== params.id).map((r) => String((r.data as { slug?: string }).slug ?? '')),
    credentials: rows.filter((r) => r.collection === 'credentials') as Array<EntryRow<EntryData<Credential>>>,
  };
}

export type EditorLoaderData = Awaited<ReturnType<typeof loader>>;

export function SaveStatus({ state, dirty }: { state: SaveState; dirty: boolean }) {
  return (
    <p className="text-sm" aria-live="polite" role={state.kind === 'error' ? 'alert' : undefined}>
      {state.kind === 'saving' && (
        <span className="inline-flex items-center gap-1.5 text-fg-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Saving…
        </span>
      )}
      {state.kind === 'saved' && !dirty && (
        <span className="inline-flex items-center gap-1.5 text-accent">
          <CheckCircle2 className="size-4" aria-hidden /> Saved as draft — publish to make it live.
        </span>
      )}
      {state.kind === 'error' && <span className="font-medium text-red-600 dark:text-red-400">{state.message}</span>}
      {state.kind === 'idle' && dirty && <span className="text-fg-muted">Unsaved changes</span>}
    </p>
  );
}

export function UnsavedChangesDialog({ blocker }: { blocker: ReturnType<typeof useEntryEditor>['blocker'] }) {
  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title="Leave without saving?"
      confirmLabel="Discard changes"
      cancelLabel="Keep editing"
      danger
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      <p>Your unsaved changes (including files uploaded since your last save) will be discarded.</p>
    </ConfirmDialog>
  );
}

export function Component() {
  const data = useLoaderData() as EditorLoaderData;
  // Remount the editor when moving between entries.
  return <Editor key={`${data.collection}/${data.row?.id ?? 'new'}`} {...data} />;
}

function Editor({ collection, row, takenIds, takenSlugs, credentials }: EditorLoaderData) {
  const config = collections[collection as ContentCollection];
  const form = forms[collection as ContentCollection];
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshStatus } = useAdmin();
  const isNew = !row;
  const [draftKey] = useState(() => (isNew ? `new-${crypto.randomUUID().slice(0, 8)}` : row.id));
  const [id, setId] = useState(row?.id ?? '');

  const editor = useEntryEditor<Record<string, unknown>>({
    collection,
    id: id || draftKey,
    // Defaults first, so entries saved before a field existed still get it.
    initial: { ...(config.create() as Record<string, unknown>), ...(row?.data ?? {}) },
    initialVisible: row?.visible ?? true,
    isNew,
    onSaved: refreshStatus,
    // Arriving from the first save of a new entry: keep showing "Saved".
    justSaved: Boolean((location.state as { saved?: boolean } | null)?.saved),
  });

  // After the first save of a new entry, move to its permanent URL.
  useEffect(() => {
    if (isNew && editor.state.kind === 'saved' && id) navigate(`/admin/${collection}/${id}`, { replace: true, state: { saved: true } });
  }, [isNew, editor.state.kind, id, collection, navigate]);

  const title = config.describe(editor.data as never).title;
  const publicPath = !isNew && config.publicPath ? config.publicPath(editor.data as never) : null;

  async function onSave() {
    let saveId = id;
    if (isNew && !saveId && title.trim()) {
      // The id is permanent: derive it from the first saved title.
      saveId = uniqueId(title, takenIds);
      setId(saveId);
    }
    saveId ||= draftKey; // only reached when validation is about to fail anyway
    await editor.save(
      (d) => form.validate(d as never, { takenSlugs }),
      (d) => form.prepare(d as never) as Record<string, unknown>,
      saveId,
    );
  }

  return (
    <div>
      <Link to={`/admin/${collection}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-accent">
        <ArrowLeft className="size-4" aria-hidden />
        {config.label}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{isNew ? `New ${config.singular}` : `Edit ${config.singular}`}</p>
          <h1 className="mt-2 text-3xl font-semibold break-words">{title || `Untitled ${config.singular}`}</h1>
        </div>
        {publicPath && (
          <a href={`${publicPath}?preview=1`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            Preview on site
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>

      <form
        className="mt-8 space-y-6 pb-28"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void onSave();
        }}
      >
        <div className="rounded-2xl border border-line bg-surface p-5">
          <CheckboxField
            label="Visible on the site"
            checked={editor.visible}
            onChange={editor.setVisible}
            hint="Hidden entries (and their files) are not public after you publish, but stay here so you can show them again."
          />
        </div>

        <form.Form
          data={editor.data as never}
          update={editor.update as never}
          errors={editor.errors}
          folder={`${collection}/${id || draftKey}`}
          onUploaded={editor.trackUpload}
          credentials={credentials}
          isNew={isNew}
        />

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-4 px-4 py-3 sm:px-6">
            <SaveStatus state={editor.state} dirty={editor.dirty} />
            <Button type="submit" size="sm" disabled={editor.state.kind === 'saving' || !editor.dirty}>
              {isNew ? `Save ${config.singular}` : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
      <UnsavedChangesDialog blocker={editor.blocker} />
    </div>
  );
}
