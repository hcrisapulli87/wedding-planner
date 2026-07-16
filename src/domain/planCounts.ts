import type { EngagementItem, Gift, HoneymoonItem, Idea, PartyMember, Song, Vendor } from '../data/types'

export function vendorsLine(vendors: Vendor[]): string {
  if (vendors.length === 0) return 'Shortlist + book'
  const booked = vendors.filter((v) => v.status === 'booked').length
  const inPlay = vendors.filter((v) => v.status !== 'booked' && v.status !== 'rejected').length
  return `${booked} booked · ${inPlay} in play`
}

export function ideasLine(ideas: Idea[]): string {
  return ideas.length === 0 ? 'Collect inspiration' : `${ideas.length} saved`
}

export function partyLine(members: PartyMember[]): string {
  if (members.length === 0) return 'Add your crew'
  return `${members.length} ${members.length === 1 ? 'person' : 'people'}`
}

export function giftsLine(gifts: Gift[]): string {
  if (gifts.length === 0) return 'Log as they arrive'
  const toThank = gifts.filter((g) => !g.thank_you_sent).length
  return `${gifts.length} gifts · ${toThank} to thank`
}

export function musicLine(songs: Song[]): string {
  const must = songs.filter((s) => s.list === 'must_play').length
  if (songs.length === 0) return 'Build the playlist'
  return `${must} must-play${must === 1 ? '' : 's'}`
}

export function honeymoonLine(items: HoneymoonItem[]): string {
  if (items.length === 0) return 'Start planning'
  const bookings = items.filter((i) => i.kind === 'booking').length
  return `${bookings} booking${bookings === 1 ? '' : 's'}`
}

export function engagementLine(items: EngagementItem[]): string {
  if (items.length === 0) return 'Plan the party'
  const bookings = items.filter((i) => i.kind === 'booking').length
  return `${bookings} booking${bookings === 1 ? '' : 's'}`
}
