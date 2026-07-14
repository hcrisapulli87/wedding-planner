import type { PartyMember } from '../data/types'

export interface OutfitProgress {
  ready: number
  total: number
}

export function outfitProgress(members: PartyMember[]): OutfitProgress {
  return { ready: members.filter((m) => m.outfit_status === 'ready').length, total: members.length }
}

export function bySide(members: PartyMember[]): { a: PartyMember[]; b: PartyMember[] } {
  const sorted = [...members].sort((x, y) => x.sort_order - y.sort_order)
  return { a: sorted.filter((m) => m.side === 'a'), b: sorted.filter((m) => m.side === 'b') }
}
