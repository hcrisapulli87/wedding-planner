import { describe, expect, it } from 'vitest'
import { bookingCascade, CATEGORY_FOR_VENDOR_TYPE } from './vendorBooking'
import type { Vendor } from '../data/types'

function vendor(over: Partial<Vendor>): Vendor {
  return {
    id: 'v1',
    type: 'photographer',
    name: 'Snaps Co',
    status: 'quoted',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    quote_amount: null,
    available_on_date: 'unknown',
    capacity: null,
    rating: null,
    location: '',
    pros: '',
    cons: '',
    links: [],
    notes: '',
    created_at: '2026-01-01T00:00:00Z',
    ...over,
  }
}

describe('bookingCascade', () => {
  it('builds budget item + 20% deposit + contract task from a quoted vendor', () => {
    const c = bookingCascade(vendor({ quote_amount: 4000 }), '2026-08-01')
    expect(c.budgetItem).toEqual({
      category: 'photography_video',
      name: 'Snaps Co',
      quoted: 4000,
      vendor_id: 'v1',
    })
    expect(c.payment).toEqual({
      label: 'deposit',
      amount: 800,
      due_date: '2026-08-15',
    })
    expect(c.task).toEqual({
      title: 'Sign contract — Snaps Co',
      due_date: '2026-08-08',
      due_override: true,
      assignee: 'both',
    })
  })

  it('skips the deposit when there is no quote', () => {
    const c = bookingCascade(vendor({ quote_amount: null }), '2026-08-01')
    expect(c.payment).toBeNull()
    expect(c.budgetItem.quoted).toBeNull()
  })

  it('rounds the deposit', () => {
    const c = bookingCascade(vendor({ quote_amount: 333 }), '2026-08-01')
    expect(c.payment!.amount).toBe(67)
  })

  it('maps every vendor type to a budget category', () => {
    expect(CATEGORY_FOR_VENDOR_TYPE.venue).toBe('venue')
    expect(CATEGORY_FOR_VENDOR_TYPE.videographer).toBe('photography_video')
    expect(CATEGORY_FOR_VENDOR_TYPE.celebrant).toBe('celebrant_ceremony')
    expect(CATEGORY_FOR_VENDOR_TYPE.cake).toBe('catering_drinks')
    expect(CATEGORY_FOR_VENDOR_TYPE.hair_makeup).toBe('attire_beauty')
    expect(Object.keys(CATEGORY_FOR_VENDOR_TYPE)).toHaveLength(12)
  })
})
