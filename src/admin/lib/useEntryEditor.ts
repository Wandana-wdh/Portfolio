import { useCallback, useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { collectUploads } from '@/lib/uploads';
import { AdminError, removeDraftFiles, saveEntry, type Collection } from './api';
import type { Errors } from './validation';

export type SaveState = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

/**
 * Local editing state for one entry, with:
 *  - dirty tracking + a guard against leaving with unsaved changes,
 *  - upload bookkeeping: files replaced or removed are deleted from the private
 *    drafts bucket only after a successful save; files uploaded but never saved
 *    are deleted when the editor is left.
 */
export function useEntryEditor<T extends object>(options: {
  collection: Collection;
  id: string;
  initial: T;
  initialVisible?: boolean;
  isNew?: boolean;
  onSaved?: () => void;
}) {
  const { collection, id, onSaved } = options;
  const [data, setData] = useState<T>(options.initial);
  const [visible, setVisible] = useState(options.initialVisible ?? true);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SaveState>({ kind: 'idle' });
  // Bookkeeping that must survive re-renders without causing them.
  const [book] = useState(() => ({
    saved: { data: JSON.stringify(options.initial), visible: options.initialVisible ?? true, files: collectUploads(options.initial) },
    uploads: new Set<string>(),
  }));
  const [isNew, setIsNew] = useState(Boolean(options.isNew));

  const dirty = isNew || JSON.stringify(data) !== book.saved.data || visible !== book.saved.visible;

  const update = useCallback((patch: Partial<T>) => {
    setData((d) => ({ ...d, ...patch }));
    setState((s) => (s.kind === 'saved' ? { kind: 'idle' } : s));
  }, []);

  const trackUpload = useCallback((path: string) => void book.uploads.add(path), [book]);

  // Leaving without saving: remove uploads that never made it into a saved entry.
  useEffect(
    () => () => {
      const orphans = [...book.uploads].filter((p) => !book.saved.files.includes(p));
      book.uploads.clear();
      if (orphans.length) void removeDraftFiles(orphans).catch(() => undefined);
    },
    [book],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  async function save(validate: (d: T) => Errors, prepare: (d: T) => T = (d) => d, saveId: string = id): Promise<boolean> {
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setState({ kind: 'error', message: 'Please fix the highlighted fields.' });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return false;
    }
    setState({ kind: 'saving' });
    const clean = prepare(data);
    try {
      await saveEntry(collection, saveId, clean, visible);
      const now = collectUploads(clean);
      const unused = [...new Set([...book.saved.files, ...book.uploads])].filter((p) => !now.includes(p));
      if (unused.length) await removeDraftFiles(unused).catch(() => undefined);
      book.saved = { data: JSON.stringify(clean), visible, files: now };
      book.uploads.clear();
      setData(clean);
      setIsNew(false);
      setState({ kind: 'saved' });
      onSaved?.();
      return true;
    } catch (e) {
      setState({ kind: 'error', message: e instanceof AdminError ? e.message : 'Saving failed. Your changes are still here — try again.' });
      return false;
    }
  }

  return { data, setData, update, visible, setVisible, errors, setErrors, state, dirty, save, trackUpload, blocker };
}
