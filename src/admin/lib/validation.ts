/** "Hello, World!" → "hello-world" (URL slugs and ids). */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

/** A new stable id derived from the title, unique within the collection. */
export function uniqueId(title: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(title) || 'entry';
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  return id;
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isHttpUrl = (value: string) => /^https?:\/\/[^\s]+\.[^\s]+/i.test(value.trim());
export const isDate = (value: string) => /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(value.trim());

export type Errors = Record<string, string>;

/** Collects field errors: `check(cond, field, message)` records message when cond is false. */
export function validator() {
  const errors: Errors = {};
  return {
    errors,
    check(ok: boolean, field: string, message: string) {
      if (!ok && !errors[field]) errors[field] = message;
    },
    url(value: string | null | undefined, field: string, label = 'Link') {
      if (value && !isHttpUrl(value)) errors[field] ??= `${label} must start with https:// (or leave it empty).`;
    },
    date(value: string | null | undefined, field: string) {
      if (value && !isDate(value)) errors[field] ??= 'Use YYYY, YYYY-MM or YYYY-MM-DD (e.g. 2025-04).';
    },
  };
}
