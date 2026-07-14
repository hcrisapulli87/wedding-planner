import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { Gift, GiftKind } from '../data/types'

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

export default function GiftSheet({ gift, onClose }: { gift: Gift | null; onClose: () => void }) {
  const { guests, insert, update, remove } = useData()

  const [giver, setGiver] = useState(gift?.giver ?? '')
  const [description, setDescription] = useState(gift?.description ?? '')
  const [kind, setKind] = useState<GiftKind>(gift?.kind ?? 'physical')
  const [amount, setAmount] = useState(gift?.amount?.toString() ?? '')
  const [receivedDate, setReceivedDate] = useState(gift?.received_date ?? todayIso())
  const [thanked, setThanked] = useState(gift?.thank_you_sent ?? false)
  const [notes, setNotes] = useState(gift?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const households = [...new Set(guests.map((g) => g.household.trim()).filter(Boolean))].sort()

  const save = async () => {
    if (!giver.trim()) return
    setSaving(true)
    try {
      const amountValue = amount.trim() === '' ? null : Number(amount)
      const fields = {
        giver: giver.trim(),
        description: description.trim(),
        kind,
        amount: amountValue !== null && Number.isNaN(amountValue) ? null : amountValue,
        received_date: receivedDate || todayIso(),
        thank_you_sent: thanked,
        thank_you_sent_at: thanked ? (gift?.thank_you_sent_at ?? new Date().toISOString()) : null,
        notes,
      }
      if (gift) await update('wedding_gifts', gift.id, fields)
      else await insert('wedding_gifts', fields)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!gift) return
    await remove('wedding_gifts', gift.id)
    onClose()
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{gift ? 'Edit gift' : 'Add gift'}</h3>
        <div className="field">
          <label htmlFor="g-giver">From</label>
          <input id="g-giver" list="g-households" value={giver} onChange={(e) => setGiver(e.target.value)} autoFocus />
          <datalist id="g-households">
            {households.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="g-desc">Gift</label>
          <input id="g-desc" placeholder="e.g. KitchenAid mixer / card with cash" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field-grid-3">
          <div className="field">
            <label htmlFor="g-kind">Type</label>
            <select id="g-kind" value={kind} onChange={(e) => setKind(e.target.value as GiftKind)}>
              <option value="physical">Physical</option>
              <option value="cash">Cash</option>
              <option value="voucher">Voucher</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="g-amount">Amount ($)</label>
            <input id="g-amount" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={kind === 'physical'} />
          </div>
          <div className="field">
            <label htmlFor="g-date">Received</label>
            <input id="g-date" type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
          </div>
        </div>
        <label className="checkbox-line">
          <input type="checkbox" checked={thanked} onChange={(e) => setThanked(e.target.checked)} />
          Thank-you sent
        </label>
        <div className="field">
          <label htmlFor="g-notes">Notes</label>
          <input id="g-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {gift && (
            <button className="btn danger" onClick={() => void del()}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={saving || !giver.trim()}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}
