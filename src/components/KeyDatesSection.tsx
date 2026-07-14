import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { KeyDate } from '../data/types'

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function KeyDatesSection() {
  const { keyDates, vendors, insert, update, remove } = useData()
  const [editing, setEditing] = useState<KeyDate | null>(null)
  const [adding, setAdding] = useState(false)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [notes, setNotes] = useState('')

  const today = todayIso()
  const open = adding || editing !== null

  const startAdd = () => {
    setAdding(true)
    setEditing(null)
    setTitle('')
    setDate('')
    setTime('')
    setLocation('')
    setVendorId('')
    setNotes('')
  }

  const startEdit = (k: KeyDate) => {
    setEditing(k)
    setAdding(false)
    setTitle(k.title)
    setDate(k.date)
    setTime(k.time)
    setLocation(k.location)
    setVendorId(k.related_vendor_id ?? '')
    setNotes(k.notes)
  }

  const close = () => {
    setAdding(false)
    setEditing(null)
  }

  const save = async () => {
    if (!title.trim() || !date) return
    const fields = {
      title: title.trim(),
      date,
      time,
      location,
      related_vendor_id: vendorId || null,
      notes,
    }
    if (editing) await update('wedding_key_dates', editing.id, fields)
    else await insert('wedding_key_dates', fields)
    close()
  }

  const del = async () => {
    if (!editing) return
    await remove('wedding_key_dates', editing.id)
    close()
  }

  return (
    <section className="card">
      <h2 className="card-title">Key dates</h2>
      {keyDates.length === 0 && !open && <p className="empty">Tastings, fittings, rehearsals — add the first one.</p>}
      {keyDates.map((k) => {
        const vendor = k.related_vendor_id ? vendors.find((v) => v.id === k.related_vendor_id) : undefined
        return (
          <div className={`row${k.date < today ? ' dim' : ''}`} key={k.id}>
            <button className="grow" onClick={() => startEdit(k)} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
              <div className="row-title">{k.title}</div>
              <div className="row-sub">
                {longDate(k.date)}
                {k.time && ` · ${k.time}`}
                {k.location && ` · ${k.location}`}
                {k.notes && ` · ${k.notes}`}
              </div>
            </button>
            {vendor && <span className="pill gold">{vendor.name}</span>}
          </div>
        )
      })}

      {open ? (
        <div style={{ marginTop: 10 }}>
          <div className="field">
            <label htmlFor="kd-title">Title</label>
            <input id="kd-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="kd-date">Date</label>
              <input id="kd-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="kd-time">Time</label>
              <input id="kd-time" placeholder="e.g. 2pm" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="kd-location">Location</label>
              <input id="kd-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="kd-vendor">Vendor</label>
              <select id="kd-vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">None</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="kd-notes">Notes</label>
            <input id="kd-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="sheet-actions">
            {editing && (
              <button className="btn danger" onClick={() => void del()}>
                Delete
              </button>
            )}
            <button className="btn" onClick={close}>
              Cancel
            </button>
            <button className="btn primary" onClick={() => void save()} disabled={!title.trim() || !date}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <button className="btn small" style={{ marginTop: 8 }} onClick={startAdd}>
          + Add key date
        </button>
      )}
    </section>
  )
}
