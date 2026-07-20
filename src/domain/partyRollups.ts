import type { PartyMember, PartyRole } from '../data/types'

export interface OutfitProgress {
  ready: number
  total: number
}

export function outfitProgress(members: PartyMember[]): OutfitProgress {
  return { ready: members.filter((m) => m.outfit_status === 'ready').length, total: members.length }
}

// Display order for role sections — matches the PartyRole declaration order in data/types.ts.
const ROLE_ORDER: PartyRole[] = [
  'maid_of_honour',
  'bridesmaid',
  'best_man',
  'groomsman',
  'mc',
  'flower_girl',
  'page_boy',
  'other',
]

export interface RoleGroup {
  role: PartyRole
  members: PartyMember[]
}

/** Members bucketed by role in a fixed display order, sorted by sort_order within each bucket; empty roles omitted. */
export function byRole(members: PartyMember[]): RoleGroup[] {
  const sorted = [...members].sort((x, y) => x.sort_order - y.sort_order)
  return ROLE_ORDER.map((role) => ({ role, members: sorted.filter((m) => m.role === role) })).filter(
    (g) => g.members.length > 0,
  )
}
