import type { Guest } from '../data/types'

// Guest-list rollups. "Confirmed" always means invite_status === 'rsvp_yes'.

export interface RsvpTally {
  toInvite: number
  maybe: number
  awaiting: number
  confirmed: number
  declined: number
  adults: number
  kids: number
}

export function rsvpTally(guests: Guest[]): RsvpTally {
  const tally: RsvpTally = { toInvite: 0, maybe: 0, awaiting: 0, confirmed: 0, declined: 0, adults: 0, kids: 0 }
  for (const g of guests) {
    if (g.invite_status === 'to_invite') tally.toInvite++
    else if (g.invite_status === 'maybe') tally.maybe++
    else if (g.invite_status === 'invited') tally.awaiting++
    else if (g.invite_status === 'rsvp_no') tally.declined++
    else {
      tally.confirmed++
      if (g.is_child) tally.kids++
      else tally.adults++
    }
  }
  return tally
}

export interface NeedCount {
  need: string
  count: number
}

function summarise(guests: Guest[], field: 'dietary' | 'meal_choice'): NeedCount[] {
  const counts = new Map<string, number>()
  for (const g of guests) {
    if (g.invite_status !== 'rsvp_yes') continue
    const need = g[field].trim().toLowerCase()
    if (!need) continue
    counts.set(need, (counts.get(need) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([need, count]) => ({ need, count }))
    .sort((a, b) => b.count - a.count)
}

/** Dietary needs of confirmed guests, case-insensitive trim-grouped, most common first. */
export function dietarySummary(guests: Guest[]): NeedCount[] {
  return summarise(guests, 'dietary')
}

/** Meal choices of confirmed guests — the caterer view. */
export function mealSummary(guests: Guest[]): NeedCount[] {
  return summarise(guests, 'meal_choice')
}

export function capacityWarning(confirmedCount: number, venueCapacity: number | null): string | null {
  if (venueCapacity === null || confirmedCount <= venueCapacity) return null
  return `${confirmedCount} confirmed guests — over the venue's capacity of ${venueCapacity}.`
}

export interface HouseholdGroup {
  household: string
  guests: Guest[]
}

/** Household-grouped list; singletons (no household) group under their own name. */
export function groupByHousehold(guests: Guest[]): HouseholdGroup[] {
  const groups = new Map<string, Guest[]>()
  for (const g of guests) {
    const key = g.household.trim() || g.name
    const list = groups.get(key) ?? []
    list.push(g)
    groups.set(key, list)
  }
  return [...groups.entries()]
    .map(([household, members]) => ({ household, guests: members }))
    .sort((a, b) => a.household.localeCompare(b.household))
}
