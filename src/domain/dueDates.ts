// Due-date computation for checklist tasks. Dates are ISO YYYY-MM-DD strings
// end-to-end; Date objects are built from local parts only (no timezone math).
//
// Semantics: integer months_out ≥ 1 subtracts calendar months (day clamped to
// the target month's length); fractional/zero/negative months_out subtracts
// round(months_out × 28) days (0.5 → 14d, 0.25 → 7d, 0 → same day, −0.25 → +7d).

function parse(d: string): [number, number, number] {
  const [y, m, day] = d.split('-').map(Number)
  return [y, m - 1, day]
}

function fmt(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function dueDateFor(weddingDate: string, monthsOut: number): string {
  const [y, m, day] = parse(weddingDate)
  if (Number.isInteger(monthsOut) && monthsOut >= 1) {
    const target = new Date(y, m - monthsOut, 1)
    const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    target.setDate(Math.min(day, daysInMonth))
    return fmt(target)
  }
  return fmt(new Date(y, m, day - Math.round(monthsOut * 28)))
}

export function recomputeDueDates(
  tasks: Array<{ id: string; months_out: number | null; due_override: boolean }>,
  weddingDate: string,
): Array<{ id: string; due_date: string }> {
  return tasks
    .filter((t) => t.months_out !== null && !t.due_override)
    .map((t) => ({ id: t.id, due_date: dueDateFor(weddingDate, t.months_out!) }))
}

export function bucketLabel(monthsOut: number | null): string {
  if (monthsOut === null) return 'Pinned'
  if (monthsOut >= 12) return '12+ months out'
  if (monthsOut >= 2) return `${monthsOut} months out`
  if (monthsOut === 1) return '1 month out'
  if (monthsOut === 0.5) return '2 weeks out'
  if (monthsOut === 0.25) return '1 week out'
  if (monthsOut === 0) return 'Wedding week'
  return 'After the wedding'
}
