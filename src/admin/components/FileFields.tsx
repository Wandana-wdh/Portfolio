import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, FileText, ImagePlus, Link2, Trash2, Upload, X } from 'lucide-react';
import type { Attachment, GalleryImage, ImageAsset } from '@/types';
import { isUploadPath } from '@/lib/supabaseConfig';
import { cn } from '@/lib/utils';
import { ACCEPT, uploadDraftFile, validateFile } from '../lib/api';
import { move } from '../lib/listUtils';
import { useFileUrl } from '../lib/useFileUrl';
import { IconButton, RowControls, TextField } from './fields';

type Kind = keyof typeof ACCEPT;


function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

interface UploadState {
  progress: number | null;
  error: string | null;
  fileName: string | null;
  localUrl: string | null;
}

/** Upload one file with progress, validation and cancel. */
function useUploader(kinds: Kind[], folder: string, onUploaded: (path: string) => void) {
  const [state, setState] = useState<UploadState>({ progress: null, error: null, fileName: null, localUrl: null });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function start(file: File): Promise<{ path: string; size: { width: number; height: number } | null } | null> {
    const problem = validateFile(file, kinds);
    if (problem) {
      setState({ progress: null, error: problem, fileName: file.name, localUrl: null });
      return null;
    }
    const localUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setState({ progress: 0, error: null, fileName: file.name, localUrl });
    abortRef.current = new AbortController();
    try {
      const size = await readImageSize(file);
      const path = await uploadDraftFile(file, folder, (p) => setState((s) => ({ ...s, progress: p })), abortRef.current.signal);
      onUploaded(path);
      setState((s) => ({ ...s, progress: null }));
      return { path, size };
    } catch (e) {
      if (localUrl) URL.revokeObjectURL(localUrl);
      setState({ progress: null, error: e instanceof Error ? e.message : 'Upload failed.', fileName: file.name, localUrl: null });
      return null;
    }
  }

  return { state, start, cancel: () => abortRef.current?.abort(), clearError: () => setState((s) => ({ ...s, error: null })) };
}

function Progress({ value, label, onCancel }: { value: number; label: string; onCancel?: () => void }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right font-mono text-xs text-fg-muted">{pct}%</span>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-xs font-medium text-fg-muted hover:text-red-600">
          Cancel
        </button>
      )}
    </div>
  );
}

function UploadError({ message, previousKept }: { message: string; previousKept: boolean }) {
  return (
    <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      {message}
      {previousKept && ' Your previous file is still in place.'}
    </p>
  );
}

function PickButton({ accept, multiple, onFiles, children, disabled }: { accept: string; multiple?: boolean; onFiles: (files: File[]) => void; children: ReactNode; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50"
      >
        {children}
      </button>
    </>
  );
}

const acceptFor = (kinds: Kind[]) => kinds.flatMap((k) => ACCEPT[k]).join(',');

// ------------------------------------------------------------------ image

export function ImageField({
  label,
  value,
  onChange,
  folder,
  onUploaded,
  hint,
  altError,
  allowUrl = true,
  aspect = 'aspect-[16/10]',
}: {
  label: string;
  value: ImageAsset | null;
  onChange: (value: ImageAsset | null) => void;
  folder: string;
  onUploaded: (path: string) => void;
  hint?: ReactNode;
  altError?: string;
  allowUrl?: boolean;
  aspect?: string;
}) {
  const id = useId();
  const [urlMode, setUrlMode] = useState(false);
  const uploader = useUploader(['image'], folder, onUploaded);
  const resolved = useFileUrl(value?.src);
  const shown = uploader.state.localUrl ?? resolved;
  const uploading = uploader.state.progress !== null;

  async function onFiles([file]: File[]) {
    const result = await uploader.start(file);
    if (result) onChange({ src: result.path, alt: value?.alt ?? '', width: result.size?.width, height: result.size?.height });
  }

  return (
    <div role="group" aria-labelledby={`${id}-label`} className="space-y-3">
      <p id={`${id}-label`} className="text-sm font-medium">
        {label}
      </p>
      {hint && <p className="-mt-2 text-xs text-fg-subtle">{hint}</p>}
      <div className={cn('relative max-w-md overflow-hidden rounded-xl border border-line bg-surface-2', aspect)}>
        {shown ? (
          <img src={shown} alt="" className="size-full object-contain" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-fg-subtle">
            <ImagePlus className="size-7" aria-hidden />
            <span className="text-xs">{value?.src ? 'Loading preview…' : 'No image'}</span>
          </div>
        )}
        {uploader.state.localUrl && !uploading && (
          <span className="absolute top-2 left-2 rounded-full bg-navy/75 px-2.5 py-1 text-[0.7rem] font-medium text-offwhite">New — save to keep</span>
        )}
      </div>
      {uploading && <Progress value={uploader.state.progress ?? 0} label={`Uploading ${uploader.state.fileName}`} onCancel={uploader.cancel} />}
      {uploader.state.error && <UploadError message={uploader.state.error} previousKept={Boolean(value)} />}
      <div className="flex flex-wrap gap-2">
        <PickButton accept={acceptFor(['image'])} onFiles={onFiles} disabled={uploading}>
          <Upload className="size-4" aria-hidden />
          {value ? 'Replace image' : 'Upload image'}
        </PickButton>
        {allowUrl && (
          <button
            type="button"
            onClick={() => setUrlMode((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:text-accent"
            aria-expanded={urlMode}
          >
            <Link2 className="size-4" aria-hidden />
            Use a link instead
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:text-red-600"
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </button>
        )}
      </div>
      {urlMode && (
        <TextField
          label="Image link"
          type="url"
          value={value && !isUploadPath(value.src) ? value.src : ''}
          onChange={(src) => onChange(src ? { src, alt: value?.alt ?? '', width: undefined, height: undefined } : null)}
          placeholder="https://…"
          hint="A public image URL. Uploading is recommended for anything you control."
        />
      )}
      {value && (
        <TextField
          label="Alt text"
          required
          value={value.alt}
          onChange={(alt) => onChange({ ...value, alt })}
          error={altError}
          hint="Describe what the image shows, for screen-reader users."
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ document

export function DocumentField({
  label,
  value,
  onChange,
  folder,
  onUploaded,
  kinds = ['pdf'],
  defaultLabel = 'View document (PDF)',
  hint,
  labelError,
  showLabel = true,
}: {
  label: string;
  showLabel?: boolean;
  value: Attachment | null;
  onChange: (value: Attachment | null) => void;
  folder: string;
  onUploaded: (path: string) => void;
  kinds?: Kind[];
  defaultLabel?: string;
  hint?: ReactNode;
  labelError?: string;
}) {
  const id = useId();
  const uploader = useUploader(kinds, folder, onUploaded);
  const url = useFileUrl(value?.href);
  const uploading = uploader.state.progress !== null;
  const fileName = value?.href ? decodeURIComponent(value.href.split('/').pop() ?? '').replace(/^[0-9a-f-]{36}-/, '') : null;

  async function onFiles([file]: File[]) {
    const result = await uploader.start(file);
    if (result) onChange({ label: value?.label || defaultLabel, href: result.path });
  }

  return (
    <div role="group" aria-labelledby={`${id}-label`} className="space-y-3">
      <p id={`${id}-label`} className="text-sm font-medium">
        {label}
      </p>
      {hint && <p className="-mt-2 text-xs text-fg-subtle">{hint}</p>}
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-4 py-3">
          <FileText className="size-5 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm">{fileName}</span>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Preview
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">{fileName} (opens in a new tab)</span>
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-fg-subtle">No file attached.</p>
      )}
      {uploading && <Progress value={uploader.state.progress ?? 0} label={`Uploading ${uploader.state.fileName}`} onCancel={uploader.cancel} />}
      {uploader.state.error && <UploadError message={uploader.state.error} previousKept={Boolean(value)} />}
      <div className="flex flex-wrap gap-2">
        <PickButton accept={acceptFor(kinds)} onFiles={onFiles} disabled={uploading}>
          <Upload className="size-4" aria-hidden />
          {value ? 'Replace file' : kinds.includes('image') ? 'Upload PDF or image' : 'Upload PDF'}
        </PickButton>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:text-red-600">
            <Trash2 className="size-4" aria-hidden />
            Remove
          </button>
        )}
      </div>
      {value && showLabel && (
        <TextField label="Link text" required value={value.label} onChange={(l) => onChange({ ...value, label: l })} error={labelError} hint="Shown on the site, e.g. “View letter (PDF)”." />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ gallery

function GalleryItem({
  image,
  index,
  count,
  onChange,
  onMove,
  onRemove,
  altError,
}: {
  image: GalleryImage;
  index: number;
  count: number;
  onChange: (image: GalleryImage) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  altError?: string;
}) {
  const url = useFileUrl(image.src);
  return (
    <li className="grid gap-4 rounded-xl border border-line bg-surface-2/40 p-4 sm:grid-cols-[10rem_1fr]">
      <div className="aspect-[16/10] overflow-hidden rounded-lg border border-line bg-surface-2">
        {url ? <img src={url} alt="" className="size-full object-cover" /> : null}
      </div>
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-fg-subtle">Photo {index + 1}</span>
          <RowControls index={index} count={count} itemLabel={`photo ${index + 1}`} onMove={onMove} onRemove={onRemove} />
        </div>
        <TextField label="Alt text" required value={image.alt} onChange={(alt) => onChange({ ...image, alt })} error={altError} hint="What the screenshot shows." />
        <TextField label="Caption (optional)" value={image.caption ?? ''} onChange={(caption) => onChange({ ...image, caption: caption || undefined })} />
        <TextField label="Description (optional)" value={image.description ?? ''} onChange={(description) => onChange({ ...image, description: description || undefined })} />
      </div>
    </li>
  );
}

export function GalleryField({
  images,
  onChange,
  folder,
  onUploaded,
  errors,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  folder: string;
  onUploaded: (path: string) => void;
  errors?: Record<string, string>;
}) {
  const [queue, setQueue] = useState<Array<{ name: string; progress: number | null; error: string | null }>>([]);
  const latest = useRef(images);
  latest.current = images;

  async function onFiles(files: File[]) {
    setQueue(files.map((f) => ({ name: f.name, progress: 0, error: validateFile(f, ['image']) })));
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validateFile(file, ['image'])) continue;
      try {
        const size = await readImageSize(file);
        const path = await uploadDraftFile(file, folder, (p) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, progress: p } : x))));
        onUploaded(path);
        const next = [...latest.current, { src: path, alt: '', width: size?.width, height: size?.height }];
        latest.current = next;
        onChange(next);
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, progress: null } : x)));
      } catch (e) {
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, progress: null, error: e instanceof Error ? e.message : 'Upload failed.' } : x)));
      }
    }
    setQueue((q) => q.filter((x) => x.error));
  }

  return (
    <div className="space-y-4">
      {images.length === 0 && <p className="text-sm text-fg-subtle">No photos yet. Projects without photos show a generated cover.</p>}
      <ol className="space-y-3">
        {images.map((img, i) => (
          <GalleryItem
            key={img.src}
            image={img}
            index={i}
            count={images.length}
            altError={errors?.[`gallery.${i}.alt`]}
            onChange={(updated) => onChange(images.map((x, j) => (j === i ? updated : x)))}
            onMove={(to) => onChange(move(images, i, to))}
            onRemove={() => onChange(images.filter((_, j) => j !== i))}
          />
        ))}
      </ol>
      {queue.length > 0 && (
        <ul className="space-y-2" aria-label="Uploads">
          {queue.map((q, i) => (
            <li key={`${q.name}-${i}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-fg-muted">
                <span className="truncate">{q.name}</span>
                {q.error && (
                  <IconButton label={`Dismiss error for ${q.name}`} onClick={() => setQueue((all) => all.filter((_, j) => j !== i))}>
                    <X className="size-3.5" aria-hidden />
                  </IconButton>
                )}
              </div>
              {q.progress !== null && !q.error && <Progress value={q.progress} label={`Uploading ${q.name}`} />}
              {q.error && <UploadError message={q.error} previousKept={false} />}
            </li>
          ))}
        </ul>
      )}
      <PickButton accept={acceptFor(['image'])} multiple onFiles={onFiles} disabled={queue.some((q) => q.progress !== null && !q.error)}>
        <ImagePlus className="size-4" aria-hidden />
        Add photos
      </PickButton>
    </div>
  );
}

