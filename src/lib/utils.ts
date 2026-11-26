export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function parseIso(iso: string): Date | null {
  const [y, m = 1, d = 1] = iso.split('-').map(Number);
  if (!y || Number.isNaN(y)) return null;
  return new Date(y, m - 1, d);
}

/** "2025-06" → "Jun 2025"; "2025" → "2025". */
export function formatMonth(iso: string | null | undefined, fallback = ''): string {
  if (!iso) return fallback;
  if (/^\d{4}$/.test(iso)) return iso;
  const date = parseIso(iso);
  return date ? monthYear.format(date) : fallback;
}

/** "2025-06-14" → "14 Jun 2025". Month-only strings fall back to "Jun 2025". */
export function formatDate(iso: string | null | undefined, fallback = ''): string {
  if (!iso) return fallback;
  if (iso.length <= 7) return formatMonth(iso, fallback);
  const date = parseIso(iso);
  return date ? fullDate.format(date) : fallback;
}

/**
 * "2023" + null → "2023 – Present"; "2025-04" + "2026-01" → "Apr 2025 – Jan 2026";
 * end only → "Jan 2026"; no dates → null (callers hide the date line).
 */
export function formatRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  if (!start) return formatMonth(end);
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
}

/** Order-preserving unique values. */
export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
