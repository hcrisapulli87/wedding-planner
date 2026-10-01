/** Whole-dollar amount with a leading "$", e.g. "$12,500". */
export function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
