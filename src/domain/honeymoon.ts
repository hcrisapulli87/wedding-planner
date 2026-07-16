/** Dated items first (chronological), undated after, ties by title. Shared by the honeymoon + engagement itineraries. */
export function sortItinerary<T extends { start_date: string | null; title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date) || a.title.localeCompare(b.title)
    if (a.start_date) return -1
    if (b.start_date) return 1
    return a.title.localeCompare(b.title)
  })
}
