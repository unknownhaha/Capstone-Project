export function toIsoString(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function datesConflict(expected: string, actual: unknown): boolean {
  const actualIso = toIsoString(actual);
  if (!actualIso) return false;
  return new Date(expected).getTime() !== new Date(actualIso).getTime();
}
