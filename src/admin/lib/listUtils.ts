export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Trims every string and drops empty ones (used when saving lists). */
export const cleanList = (values: string[]) => values.map((v) => v.trim()).filter(Boolean);
/** Empty string → null. */
export const orNull = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);
