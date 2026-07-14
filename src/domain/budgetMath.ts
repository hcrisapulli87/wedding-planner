import type { BudgetCategory } from '../data/types'

// Rollup semantics: per item, committed = actual ?? quoted ?? null — estimates
// are guesses, not commitments. paid = Σ paid payment amounts for that item.

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: 'Venue',
  catering_drinks: 'Catering & drinks',
  attire_beauty: 'Attire & beauty',
  photography_video: 'Photography & video',
  flowers_styling: 'Flowers & styling',
  music_entertainment: 'Music & entertainment',
  rings: 'Rings',
  stationery: 'Stationery',
  transport: 'Transport',
  celebrant_ceremony: 'Celebrant & ceremony',
  honeymoon: 'Honeymoon',
  other: 'Other',
}

interface ItemFields {
  id: string
  category: BudgetCategory
  estimated: number | null
  quoted: number | null
  actual: number | null
}

interface PaymentFields {
  budget_item_id: string
  amount: number
  paid: boolean
}

export interface RollupLine {
  estimated: number
  committed: number
  paid: number
  owing: number
}

export interface CategoryRollup extends RollupLine {
  category: BudgetCategory
}

export interface BudgetRollup {
  categories: CategoryRollup[]
  total: RollupLine
  remainingBudget: number | null
}

function emptyLine(): RollupLine {
  return { estimated: 0, committed: 0, paid: 0, owing: 0 }
}

export function committedFor(item: { quoted: number | null; actual: number | null }): number | null {
  return item.actual ?? item.quoted ?? null
}

export function rollup(
  items: ItemFields[],
  payments: PaymentFields[],
  totalBudget: number | null,
): BudgetRollup {
  const paidByItem = new Map<string, number>()
  for (const p of payments) {
    if (p.paid) paidByItem.set(p.budget_item_id, (paidByItem.get(p.budget_item_id) ?? 0) + p.amount)
  }

  const byCategory = new Map<BudgetCategory, RollupLine>()
  const total = emptyLine()

  for (const item of items) {
    const line = byCategory.get(item.category) ?? emptyLine()
    const committed = committedFor(item) ?? 0
    const paid = paidByItem.get(item.id) ?? 0
    line.estimated += item.estimated ?? 0
    line.committed += committed
    line.paid += paid
    byCategory.set(item.category, line)
    total.estimated += item.estimated ?? 0
    total.committed += committed
    total.paid += paid
  }

  const categories: CategoryRollup[] = [...byCategory.entries()].map(([category, line]) => ({
    category,
    ...line,
    owing: Math.max(line.committed - line.paid, 0),
  }))
  total.owing = Math.max(total.committed - total.paid, 0)

  return {
    categories,
    total,
    remainingBudget: totalBudget === null ? null : totalBudget - total.committed,
  }
}
