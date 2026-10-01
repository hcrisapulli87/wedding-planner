import { addDays, daysUntil, toIso } from './dates'

describe('dates', () => {
  it('formats local dates as ISO', () => {
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-25', 14)).toBe('2027-01-08')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('counts whole days, including across a DST change', () => {
    expect(daysUntil('2026-10-14', '2026-10-01')).toBe(13)
    expect(daysUntil('2026-04-10', '2026-04-01')).toBe(9)
    expect(daysUntil('2026-09-30', '2026-10-01')).toBe(-1)
  })
})
