// Aggregated "due soon" feed for Home: open tasks, unpaid payments and key
// dates inside a horizon window. ISO YYYY-MM-DD strings compared
// lexicographically (valid for ISO dates); addDays mirrors dueDates.ts's
// local-parts pattern.

interface TaskFields {
  id: string
  title: string
  due_date: string | null
  status: string
}

interface PaymentFields {
  id: string
  budget_item_id: string
  label: string
  due_date: string | null
  paid: boolean
}

interface BudgetItemFields {
  id: string
  name: string
}

interface KeyDateFields {
  id: string
  title: string
  date: string
}

export interface DueSoonEntry {
  kind: 'task' | 'payment' | 'key_date'
  id: string
  title: string
  date: string
  overdue: boolean
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y, m - 1, d + days)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

export function dueSoonFeed(
  data: {
    tasks: TaskFields[]
    payments: PaymentFields[]
    budgetItems: BudgetItemFields[]
    keyDates: KeyDateFields[]
  },
  today: string,
  horizonDays = 14,
): DueSoonEntry[] {
  const horizon = addDays(today, horizonDays)
  const feed: DueSoonEntry[] = []

  for (const t of data.tasks) {
    if (t.status === 'done' || t.status === 'skipped') continue
    if (!t.due_date || t.due_date > horizon) continue
    feed.push({ kind: 'task', id: t.id, title: t.title, date: t.due_date, overdue: t.due_date < today })
  }

  const itemNames = new Map(data.budgetItems.map((i) => [i.id, i.name]))
  for (const p of data.payments) {
    if (p.paid || !p.due_date || p.due_date > horizon) continue
    const name = itemNames.get(p.budget_item_id) ?? 'Payment'
    feed.push({
      kind: 'payment',
      id: p.id,
      title: `${name} — ${p.label}`,
      date: p.due_date,
      overdue: p.due_date < today,
    })
  }

  // Key dates are appointments, not obligations: never overdue, gone once past.
  for (const k of data.keyDates) {
    if (k.date < today || k.date > horizon) continue
    feed.push({ kind: 'key_date', id: k.id, title: k.title, date: k.date, overdue: false })
  }

  return feed.sort((a, b) => a.date.localeCompare(b.date))
}
