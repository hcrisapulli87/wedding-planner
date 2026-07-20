import { describe, expect, it } from 'vitest'
import {
  capacityWarning,
  dietarySummary,
  groupByHousehold,
  mealSummary,
  rsvpTally,
} from './guestRollups'
import type { Guest } from '../data/types'

function guest(over: Partial<Guest>): Guest {
  return {
    id: Math.random().toString(36).slice(2),
    household: '',
    name: 'Guest',
    side: 'both',
    grp: 'friends',
    invite_status: 'to_invite',
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

describe('rsvpTally', () => {
  it('tallies statuses and splits confirmed adults/kids', () => {
    const guests = [
      guest({ invite_status: 'to_invite' }),
      guest({ invite_status: 'maybe' }),
      guest({ invite_status: 'invited' }),
      guest({ invite_status: 'invited' }),
      guest({ invite_status: 'rsvp_yes' }),
      guest({ invite_status: 'rsvp_yes', is_child: true }),
      guest({ invite_status: 'rsvp_no' }),
    ]
    expect(rsvpTally(guests)).toEqual({
      toInvite: 1,
      maybe: 1,
      awaiting: 2,
      confirmed: 2,
      declined: 1,
      adults: 1,
      kids: 1,
    })
  })
})

describe('dietarySummary', () => {
  it('groups confirmed dietary needs case-insensitively, sorted by count', () => {
    const guests = [
      guest({ invite_status: 'rsvp_yes', dietary: 'Gluten free' }),
      guest({ invite_status: 'rsvp_yes', dietary: 'gluten free ' }),
      guest({ invite_status: 'rsvp_yes', dietary: 'Vegan' }),
      guest({ invite_status: 'invited', dietary: 'Nut allergy' }), // not confirmed
      guest({ invite_status: 'rsvp_yes', dietary: '' }), // empty
    ]
    expect(dietarySummary(guests)).toEqual([
      { need: 'gluten free', count: 2 },
      { need: 'vegan', count: 1 },
    ])
  })
})

describe('mealSummary', () => {
  it('groups confirmed meal choices', () => {
    const guests = [
      guest({ invite_status: 'rsvp_yes', meal_choice: 'Beef' }),
      guest({ invite_status: 'rsvp_yes', meal_choice: 'beef' }),
      guest({ invite_status: 'rsvp_yes', meal_choice: 'Fish' }),
    ]
    expect(mealSummary(guests)).toEqual([
      { need: 'beef', count: 2 },
      { need: 'fish', count: 1 },
    ])
  })
})

describe('capacityWarning', () => {
  it('warns only when confirmed exceeds capacity', () => {
    expect(capacityWarning(120, 100)).toMatch(/120.*100/)
    expect(capacityWarning(80, 100)).toBeNull()
    expect(capacityWarning(80, null)).toBeNull()
  })
})

describe('groupByHousehold', () => {
  it('groups by household, singletons under their own name, sorted', () => {
    const a = guest({ name: 'Zoe', household: '' })
    const b = guest({ name: 'Amy Smith', household: 'Smith family' })
    const c = guest({ name: 'Bob Smith', household: 'Smith family' })
    const groups = groupByHousehold([a, b, c])
    expect(groups.map((g) => g.household)).toEqual(['Smith family', 'Zoe'])
    expect(groups[0].guests).toHaveLength(2)
    expect(groups[1].guests).toEqual([a])
  })
})
