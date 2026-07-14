import type { Guest, SeatTable } from '../data/types'

// Seating works on confirmed guests only: declined/pending guests neither
// occupy seats nor appear in the unseated pool.

export interface TableSummary {
  table: SeatTable
  seated: Guest[]
  overBy: number
}

export interface SeatingSummary {
  tables: TableSummary[]
  unseated: Guest[]
}

export function seatingSummary(tables: SeatTable[], guests: Guest[]): SeatingSummary {
  const confirmed = guests.filter((g) => g.invite_status === 'rsvp_yes')
  const summaries = tables.map((table) => {
    const seated = confirmed.filter((g) => g.table_id === table.id)
    return { table, seated, overBy: Math.max(0, seated.length - table.capacity) }
  })
  return {
    tables: summaries,
    unseated: confirmed.filter((g) => g.table_id === null),
  }
}
