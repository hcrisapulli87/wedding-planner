import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { EngagementItem, HoneymoonKind } from '../data/types'

export default function EngagementSheet({ item, onClose }: { item: EngagementItem | null; onClose: () => void }) {
  const { insert, update, remove } = useData()

  const [kind, setKind] = useState<HoneymoonKind>(item?.kind ?? 'booking')
  const [title, setTitle] = useState(item?.title ?? '')
  const [startDate, setStartDate] = useState(item?.start_date ?? '')
  const [endDate, setEndDate] = useState(item?.end_date ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
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
      location,
      cost: costValue !== null && Number.isNaN(costValue) ? null : costValue,
      notes,
    }
    if (item) await update('wedding_engagement_items', item.id, fields)
    else await insert('wedding_engagement_items', fields)
    onClose()
  }

  const del = async () => {
    if (!item) return
    await remove('wedding_engagement_items', item.id)
    onClose()
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{item ? 'Edit item' : 'Add item'}</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="e-kind">Type</label>
            <select id="e-kind" value={kind} onChange={(e) => setKind(e.target.value as HoneymoonKind)}>
              <option value="booking">Booking</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-cost">Cost ($)</label>
            <input id="e-cost" type="number" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="e-title">What</label>
          <input id="e-title" placeholder="e.g. Venue hire, celebrant, photo booth" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="e-location">Where</label>
          <input id="e-location" placeholder="Venue / address" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="e-start">Start</label>
            <input id="e-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="e-end">End</label>
            <input id="e-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="e-notes">Notes</label>
          <input id="e-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
