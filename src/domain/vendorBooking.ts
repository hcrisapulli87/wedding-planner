import type { Assignee, BudgetCategory, Vendor, VendorType } from '../data/types'

// One action → three records: marking a vendor booked proposes a budget item,
// a 20% deposit due in two weeks (only when a quote exists — editable before
// saving), and a "sign contract" task pinned a week out. Setting
// wedding_settings.venue_vendor_id for venues is the caller's job.

export const CATEGORY_FOR_VENDOR_TYPE: Record<VendorType, BudgetCategory> = {
  venue: 'venue',
  photographer: 'photography_video',
  videographer: 'photography_video',
  celebrant: 'celebrant_ceremony',
  caterer: 'catering_drinks',
  florist: 'flowers_styling',
  band_dj: 'music_entertainment',
  cake: 'catering_drinks',
  hair_makeup: 'attire_beauty',
  transport: 'transport',
  stationery: 'stationery',
  other: 'other',
}

export interface BookingCascade {
  budgetItem: {
    category: BudgetCategory
    name: string
    quoted: number | null
    vendor_id: string
  }
  payment: {
    label: string
    amount: number
    due_date: string
  } | null
  task: {
    title: string
    due_date: string
    due_override: boolean
    assignee: Assignee
  }
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y, m - 1, d + days)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

export function bookingCascade(vendor: Vendor, today: string): BookingCascade {
  return {
    budgetItem: {
      category: CATEGORY_FOR_VENDOR_TYPE[vendor.type],
      name: vendor.name,
      quoted: vendor.quote_amount,
      vendor_id: vendor.id,
    },
    payment:
      vendor.quote_amount === null
        ? null
        : {
            label: 'deposit',
            amount: Math.round(vendor.quote_amount * 0.2),
            due_date: addDays(today, 14),
          },
    task: {
      title: `Sign contract — ${vendor.name}`,
      due_date: addDays(today, 7),
      due_override: true,
      assignee: 'both',
    },
  }
}
