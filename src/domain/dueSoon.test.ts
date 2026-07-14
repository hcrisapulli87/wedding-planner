import { describe, expect, it } from 'vitest'
import { dueSoonFeed } from './dueSoon'

const today = '2026-08-01'

describe('dueSoonFeed', () => {
  const tasks = [
    { id: 't1', title: 'In window', due_date: '2026-08-10', status: 'todo' },
    { id: 't2', title: 'Overdue', due_date: '2026-07-28', status: 'in_progress' },
    { id: 't3', title: 'Too far', due_date: '2026-09-01', status: 'todo' },
    { id: 't4', title: 'Done', due_date: '2026-08-05', status: 'done' },
    { id: 't5', title: 'Skipped', due_date: '2026-08-05', status: 'skipped' },
    { id: 't6', title: 'No date', due_date: null, status: 'todo' },
  ]
  const budgetItems = [{ id: 'i1', name: 'Venue' }]
  const payments = [
    { id: 'p1', budget_item_id: 'i1', label: 'deposit', due_date: '2026-08-03', paid: false },
    { id: 'p2', budget_item_id: 'i1', label: 'balance', due_date: '2026-08-04', paid: true },
    { id: 'p3', budget_item_id: 'i1', label: 'late', due_date: '2026-09-20', paid: false },
  ]
  const keyDates = [
    { id: 'k1', title: 'Tasting', date: '2026-08-08' },
    { id: 'k2', title: 'Past visit', date: '2026-07-20' },
    { id: 'k3', title: 'Far away', date: '2026-12-01' },
  ]

  it('collects, filters, flags and sorts', () => {
    const feed = dueSoonFeed({ tasks, payments, budgetItems, keyDates }, today)
    expect(feed.map((f) => f.id)).toEqual(['t2', 'p1', 'k1', 't1'])
    expect(feed[0]).toMatchObject({ kind: 'task', overdue: true })
    expect(feed[1]).toMatchObject({ kind: 'payment', title: 'Venue — deposit', overdue: false })
    expect(feed[2]).toMatchObject({ kind: 'key_date', overdue: false })
  })

  it('respects a custom horizon', () => {
    const feed = dueSoonFeed({ tasks, payments, budgetItems, keyDates }, today, 60)
    expect(feed.some((f) => f.id === 't3')).toBe(true)
    expect(feed.some((f) => f.id === 'p3')).toBe(true)
  })
})
