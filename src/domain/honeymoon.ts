import type { HoneymoonItem } from '../data/types'

export function sortItinerary(items: HoneymoonItem[]): HoneymoonItem[] {
  return [...items].sort((a, b) => {
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date) || a.title.localeCompare(b.title)
    if (a.start_date) return -1
    if (b.start_date) return 1
    return a.title.localeCompare(b.title)
  })
}
