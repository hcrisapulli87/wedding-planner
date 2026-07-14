import { describe, expect, it } from 'vitest'
import { seatingSummary } from './seating'
import type { Guest, SeatTable } from '../data/types'

function guest(over: Partial<Guest>): Guest {
  return {
    id: Math.random().toString(36).slice(2),
    household: '',
    name: 'Guest',
    side: 'both',
    grp: 'friends',
    invite_status: 'rsvp_yes',
    meal_choice: '',
    dietary: '',
    is_plus_one: false,
    is_child: false,
    address: '',
    thank_you_sent: false,
    table_id: null,
    ...over,
  }
}

const tables: SeatTable[] = [
  { id: 'T1', name: 'Table 1', capacity: 2, sort_order: 0 },
  { id: 'T2', name: 'Table 2', capacity: 8, sort_order: 1 },
]

describe('seatingSummary', () => {
  it('summarises per table, flags over-capacity, pools unseated confirmed', () => {
    const g1 = guest({ table_id: 'T1' })
    const g2 = guest({ table_id: 'T1' })
    const g3 = guest({ table_id: 'T1' }) // over capacity 2
    const g4 = guest({ table_id: null }) // unseated confirmed
    const g5 = guest({ table_id: null, invite_status: 'invited' }) // not confirmed — not pooled
    const g6 = guest({ table_id: 'T2', invite_status: 'rsvp_no' }) // declined — doesn't count

    const s = seatingSummary(tables, [g1, g2, g3, g4, g5, g6])
    expect(s.tables[0].seated).toHaveLength(3)
    expect(s.tables[0].overBy).toBe(1)
    expect(s.tables[1].seated).toHaveLength(0)
    expect(s.tables[1].overBy).toBe(0)
    expect(s.unseated).toEqual([g4])
  })
})
