import { describe, expect, it } from 'vitest'
import { giftRollup } from './giftRollups'
import type { Gift } from '../data/types'

const gift = (over: Partial<Gift>): Gift =>
  ({ kind: 'physical', amount: null, thank_you_sent: false, ...over }) as Gift

describe('giftRollup', () => {
  it('counts totals, cash+voucher sum, outstanding thank-yous', () => {
    const gifts = [
      gift({ kind: 'cash', amount: 200 }),
      gift({ kind: 'voucher', amount: 50, thank_you_sent: true }),
      gift({ kind: 'physical', amount: 999 }),
      gift({}),
    ]
    expect(giftRollup(gifts)).toEqual({ total: 4, cashTotal: 250, toThank: 3 })
  })
  it('empty list', () => {
    expect(giftRollup([])).toEqual({ total: 0, cashTotal: 0, toThank: 0 })
  })
})
