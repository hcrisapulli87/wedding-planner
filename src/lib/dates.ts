// Shared ISO-date helpers. Dates are YYYY-MM-DD strings end-to-end; Date
// objects are built from local parts only (no timezone math), so a date never
// shifts a day across UTC offsets.

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number)
  return [y, m - 1, d]
}

function local(iso: string): Date {
  const [y, m, d] = parts(iso)
  return new Date(y, m, d)
}

export function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function todayIso(): string {
  return toIso(new Date())
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = parts(iso)
  return toIso(new Date(y, m, d + days))
}

/** Whole days from today to `iso` (negative when past). */
export function daysUntil(iso: string, today = todayIso()): number {
  return Math.round((local(iso).getTime() - local(today).getTime()) / 86_400_000)
}

/** "14 Oct" */
export function shortDate(iso: string): string {
  return local(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** "14 October 2026" */
export function longDate(iso: string): string {
  return local(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** "Wed, 14 Oct 2026" */
export function weekdayDate(iso: string): string {
  return local(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
