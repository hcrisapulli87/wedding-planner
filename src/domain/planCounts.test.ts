import { describe, expect, it } from 'vitest'
import { giftsLine, honeymoonLine, ideasLine, musicLine, partyLine, vendorsLine } from './planCounts'
import type { Gift, HoneymoonItem, Idea, PartyMember, Song, Vendor } from '../data/types'

const vendor = (status: Vendor['status']): Vendor => ({ status } as Vendor)
const gift = (thanked: boolean): Gift => ({ thank_you_sent: thanked } as Gift)
const song = (list: Song['list']): Song => ({ list } as Song)
const hm = (kind: HoneymoonItem['kind']): HoneymoonItem => ({ kind } as HoneymoonItem)

describe('plan hub count lines', () => {
  it('vendors: booked vs in play (rejected excluded)', () => {
    expect(vendorsLine([vendor('booked'), vendor('quoted'), vendor('idea'), vendor('rejected')])).toBe(
      '1 booked · 2 in play',
    )
  })
  it('ideas', () => {
    expect(ideasLine([{} as Idea, {} as Idea])).toBe('2 saved')
  })
  it('party', () => {
    expect(partyLine([{} as PartyMember])).toBe('1 person')
    expect(partyLine([{} as PartyMember, {} as PartyMember])).toBe('2 people')
  })
  it('gifts: total + outstanding thank-yous', () => {
    expect(giftsLine([gift(true), gift(false), gift(false)])).toBe('3 gifts · 2 to thank')
    expect(giftsLine([])).toBe('Log as they arrive')
  })
  it('music: must-play count', () => {
    expect(musicLine([song('must_play'), song('do_not_play'), song('must_play')])).toBe('2 must-plays')
  })
  it('honeymoon: bookings count', () => {
    expect(honeymoonLine([hm('booking'), hm('activity')])).toBe('1 booking')
    expect(honeymoonLine([])).toBe('Start planning')
  })
})
