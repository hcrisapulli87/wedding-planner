import { describe, expect, it } from 'vitest'
import { bucketLabel, dueDateFor, recomputeDueDates } from './dueDates'

describe('dueDateFor', () => {
  it('subtracts whole calendar months', () => {
    expect(dueDateFor('2027-03-15', 3)).toBe('2026-12-15')
    expect(dueDateFor('2027-03-15', 12)).toBe('2026-03-15')
  })
  it('clamps when the source day does not exist in the target month', () => {
    expect(dueDateFor('2026-05-31', 3)).toBe('2026-02-28')
  })
  it('maps fractional buckets to weeks', () => {
    expect(dueDateFor('2027-03-15', 0.5)).toBe('2027-03-01')
    expect(dueDateFor('2027-03-15', 0.25)).toBe('2027-03-08')
    expect(dueDateFor('2027-03-15', 0)).toBe('2027-03-15')
    expect(dueDateFor('2027-03-15', -0.25)).toBe('2027-03-22')
  })
})

describe('recomputeDueDates', () => {
  const base = { title: 't', due_date: null as string | null, due_override: false }
  it('recomputes unpinned tasks and skips pinned + dateless ones', () => {
    const tasks = [
      { id: '1', ...base, months_out: 3 },
      { id: '2', ...base, months_out: 3, due_override: true },
      { id: '3', ...base, months_out: null },
    ]
    expect(recomputeDueDates(tasks, '2027-03-15')).toEqual([{ id: '1', due_date: '2026-12-15' }])
  })
})

describe('bucketLabel', () => {
  it('labels buckets', () => {
    expect(bucketLabel(0.5)).toBe('2 weeks out')
    expect(bucketLabel(-0.25)).toBe('After the wedding')
    expect(bucketLabel(null)).toBe('Pinned')
  })
})
