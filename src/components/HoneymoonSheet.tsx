import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { HoneymoonItem, HoneymoonKind } from '../data/types'

export default function HoneymoonSheet({ item, onClose }: { item: HoneymoonItem | null; onClose: () => void }) {
  const { insert, update, remove } = useData()

  const [kind, setKind] = useState<HoneymoonKind>(item?.kind ?? 'booking')
  const [title, setTitle] = useState(item?.title ?? '')
  const [startDate, setStartDate] = useState(item?.start_date ?? '')
  const [endDate, setEndDate] = useState(item?.end_date ?? '')
  const [ref, setRef] = useState(item?.confirmation_ref ?? '')
  const [cost, setCost] = useState(item?.cost?.toString() ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')

  const save = async () => {
    if (!title.trim()) return
    const costValue = cost.trim() === '' ? null : Number(cost)
    const fields = {
      kind,
      title: title.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
      confirmation_ref: ref,
      cost: costValue !== null && Number.isNaN(costValue) ? null : costValue,
      notes,
    }
    if (item) await update('wedding_honeymoon_items', item.id, fields)
    else await insert('wedding_honeymoon_items', fields)
    onClose()
  }

  const del = async () => {
    if (!item) return
    await remove('wedding_honeymoon_items', item.id)
    onClose()
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{item ? 'Edit item' : 'Add item'}</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="h-kind">Type</label>
            <select id="h-kind" value={kind} onChange={(e) => setKind(e.target.value as HoneymoonKind)}>
              <option value="booking">Booking</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="h-cost">Cost ($)</label>
            <input id="h-cost" type="number" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="h-title">What</label>
          <input id="h-title" placeholder="e.g. Flights SYD → Nadi" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="h-start">Start</label>
            <input id="h-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="h-end">End</label>
            <input id="h-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="h-ref">Confirmation #</label>
          <input id="h-ref" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="h-notes">Notes</label>
          <input id="h-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {item && (
            <button className="btn danger" onClick={() => void del()}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}
