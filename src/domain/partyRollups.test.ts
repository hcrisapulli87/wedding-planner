import { describe, expect, it } from 'vitest'
import { byRole, outfitProgress } from './partyRollups'
import type { PartyMember } from '../data/types'

const member = (over: Partial<PartyMember>): PartyMember =>
  ({ side: 'a', role: 'other', outfit_status: 'todo', sort_order: 0, ...over }) as PartyMember

describe('party rollups', () => {
  it('outfitProgress counts ready over total', () => {
    expect(outfitProgress([member({ outfit_status: 'ready' }), member({}), member({ outfit_status: 'fitted' })])).toEqual({ ready: 1, total: 3 })
  })
  it('byRole buckets members by role in canonical order, sorted by sort_order within each', () => {
    const list = [
      member({ role: 'groomsman', name: 'Y', sort_order: 2 }),
      member({ role: 'bridesmaid', name: 'A' }),
      member({ role: 'groomsman', name: 'X', sort_order: 1 }),
    ]
    const groups = byRole(list)
    expect(groups.map((g) => g.role)).toEqual(['bridesmaid', 'groomsman'])
    expect(groups.find((g) => g.role === 'groomsman')?.members.map((m) => m.name)).toEqual(['X', 'Y'])
  })
  it('byRole omits roles with no members', () => {
    const groups = byRole([member({ role: 'mc' })])
    expect(groups).toHaveLength(1)
    expect(groups[0].role).toBe('mc')
  })
})
