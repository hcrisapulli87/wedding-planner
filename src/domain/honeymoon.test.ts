import { describe, expect, it } from 'vitest'
import { sortItinerary } from './honeymoon'
import type { HoneymoonItem } from '../data/types'

const item = (over: Partial<HoneymoonItem>): HoneymoonItem => ({ start_date: null, title: '', ...over }) as HoneymoonItem

describe('sortItinerary', () => {
  it('sorts by start date, undated last, ties by title', () => {
    const sorted = sortItinerary([
      item({ title: 'Snorkel tour', start_date: '2027-03-20' }),
      item({ title: 'Travel insurance', start_date: null }),
      item({ title: 'Flights', start_date: '2027-03-16' }),
      item({ title: 'Resort', start_date: '2027-03-16' }),
    ])
    expect(sorted.map((i) => i.title)).toEqual(['Flights', 'Resort', 'Snorkel tour', 'Travel insurance'])
  })
})
