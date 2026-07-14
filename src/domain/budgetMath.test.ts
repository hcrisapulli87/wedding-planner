import { describe, expect, it } from 'vitest'
import { CATEGORY_LABELS, rollup } from './budgetMath'
import type { BudgetItem, Payment } from '../data/types'

function item(over: Partial<BudgetItem>): BudgetItem {
  return {
    id: 'i1',
    category: 'venue',
    name: 'Item',
    estimated: null,
    quoted: null,
    actual: null,
    vendor_id: null,
    ...over,
  }
}

function payment(over: Partial<Payment>): Payment {
  return {
    id: 'p1',
    budget_item_id: 'i1',
    label: 'deposit',
    amount: 0,
    due_date: null,
    paid: false,
    paid_at: null,
    ...over,
  }
}

describe('rollup', () => {
  const items = [
    // actual wins over quoted
    item({ id: 'i1', category: 'venue', estimated: 10000, quoted: 12000, actual: 11500 }),
    // quoted commits when no actual
    item({ id: 'i2', category: 'venue', estimated: 2000, quoted: 1800 }),
    // estimate only — contributes 0 committed
    item({ id: 'i3', category: 'flowers_styling', estimated: 900 }),
  ]
  const payments = [
    payment({ id: 'p1', budget_item_id: 'i1', amount: 3000, paid: true }),
    payment({ id: 'p2', budget_item_id: 'i1', amount: 8500, paid: false }),
    payment({ id: 'p3', budget_item_id: 'i2', amount: 500, paid: true }),
  ]

  it('rolls up per category', () => {
    const r = rollup(items, payments, 20000)
    const venue = r.categories.find((c) => c.category === 'venue')!
    expect(venue.estimated).toBe(12000)
    expect(venue.committed).toBe(13300) // 11500 actual + 1800 quoted
    expect(venue.paid).toBe(3500)
    expect(venue.owing).toBe(9800)

    const flowers = r.categories.find((c) => c.category === 'flowers_styling')!
    expect(flowers.estimated).toBe(900)
    expect(flowers.committed).toBe(0)
    expect(flowers.paid).toBe(0)
    expect(flowers.owing).toBe(0)
  })

  it('rolls up overall + remaining budget', () => {
    const r = rollup(items, payments, 20000)
    expect(r.total.estimated).toBe(12900)
    expect(r.total.committed).toBe(13300)
    expect(r.total.paid).toBe(3500)
    expect(r.total.owing).toBe(9800)
    expect(r.remainingBudget).toBe(6700)
  })

  it('is null-safe on total budget', () => {
    expect(rollup(items, payments, null).remainingBudget).toBeNull()
  })

  it('owing never goes negative', () => {
    const r = rollup(
      [item({ id: 'i1', quoted: 100 })],
      [payment({ id: 'p1', amount: 150, paid: true })],
      null,
    )
    expect(r.total.owing).toBe(0)
  })

  it('has a label for every category', () => {
    expect(CATEGORY_LABELS.venue).toBeTruthy()
    expect(CATEGORY_LABELS.catering_drinks).toBeTruthy()
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(12)
  })
})
