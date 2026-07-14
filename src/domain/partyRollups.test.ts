import { describe, expect, it } from 'vitest'
import { bySide, outfitProgress } from './partyRollups'
import type { PartyMember } from '../data/types'

const member = (over: Partial<PartyMember>): PartyMember =>
  ({ side: 'a', outfit_status: 'todo', sort_order: 0, ...over }) as PartyMember

describe('party rollups', () => {
  it('outfitProgress counts ready over total', () => {
    expect(outfitProgress([member({ outfit_status: 'ready' }), member({}), member({ outfit_status: 'fitted' })])).toEqual({ ready: 1, total: 3 })
  })
  it('bySide splits and sorts by sort_order', () => {
    const list = [member({ side: 'b', sort_order: 2, name: 'Y' }), member({ side: 'a' }), member({ side: 'b', sort_order: 1, name: 'X' })]
    const split = bySide(list)
    expect(split.a).toHaveLength(1)
    expect(split.b.map((m) => m.name)).toEqual(['X', 'Y'])
  })
})
