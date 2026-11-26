import { isUploadPath } from './supabaseConfig';

/** Replaces every uploaded-file reference ("uploads/...") with a URL. */
export function mapUploads<T>(value: T, toUrl: (path: string) => string): T {
  if (isUploadPath(value)) return toUrl(value) as T;
  if (Array.isArray(value)) return value.map((v) => mapUploads(v, toUrl)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapUploads(v, toUrl)])) as T;
  }
  return value;
}

/** Every uploaded-file reference inside a value (deduplicated). */
export function collectUploads(value: unknown, found = new Set<string>()): string[] {
  if (isUploadPath(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectUploads(v, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectUploads(v, found));
  return [...found];
}
