import type { Gift } from '../data/types'

export interface GiftRollup {
  total: number
  cashTotal: number
  toThank: number
}

export function giftRollup(gifts: Gift[]): GiftRollup {
  const rollup: GiftRollup = { total: gifts.length, cashTotal: 0, toThank: 0 }
  for (const g of gifts) {
    if ((g.kind === 'cash' || g.kind === 'voucher') && g.amount) rollup.cashTotal += Number(g.amount)
    if (!g.thank_you_sent) rollup.toThank++
  }
  return rollup
}
