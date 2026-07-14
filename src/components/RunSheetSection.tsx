import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { DayEvent } from '../data/types'

export default function RunSheetSection() {
  const { dayEvents, vendors, partyMembers, settings, insert, update, remove } = useData()
  const [editing, setEditing] = useState<DayEvent | null>(null)
  const [adding, setAdding] = useState(false)

  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [who, setWho] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [notes, setNotes] = useState('')

  const events = [...dayEvents].sort((a, b) => a.sort_order - b.sort_order || a.time.localeCompare(b.time))
  const open = adding || editing !== null

  const startAdd = () => {
    setAdding(true)
    setEditing(null)
    setTime('')
    setTitle('')
    setWho('')
    setVendorId('')
    setNotes('')
  }

  const startEdit = (e: DayEvent) => {
    setEditing(e)
    setAdding(false)
    setTime(e.time)
    setTitle(e.title)
    setWho(e.who)
    setVendorId(e.vendor_id ?? '')
    setNotes(e.notes)
  }

  const close = () => {
    setAdding(false)
    setEditing(null)
  }

  const save = async () => {
    if (!title.trim()) return
    const fields = { time, title: title.trim(), who, vendor_id: vendorId || null, notes }
    if (editing) await update('wedding_day_events', editing.id, fields)
    else await insert('wedding_day_events', { ...fields, sort_order: (events.at(-1)?.sort_order ?? 0) + 10 })
    close()
  }

  const del = async () => {
    if (!editing) return
    await remove('wedding_day_events', editing.id)
    close()
  }

  // Reorder by swapping sort_order with the neighbour.
  const move = (index: number, delta: -1 | 1) => {
    const other = events[index + delta]
    if (!other) return
    const current = events[index]
    void Promise.all([
      update('wedding_day_events', current.id, { sort_order: other.sort_order }),
      update('wedding_day_events', other.id, { sort_order: current.sort_order }),
    ])
  }

  return (
    <section className="card print-runsheet">
      <div className="row" style={{ border: 0, paddingTop: 0 }}>
        <h2 className="card-title grow" style={{ margin: 0 }}>
          Day-of run sheet
        </h2>
        {events.length > 0 && (
          <button className="btn small" onClick={() => window.print()}>
            🖨 Print
          </button>
        )}
      </div>

      {events.length === 0 && !open && <p className="empty">Hour-by-hour plan for the big day.</p>}

      {events.map((e, i) => {
        const vendor = e.vendor_id ? vendors.find((v) => v.id === e.vendor_id) : undefined
        return (
          <div className="row" key={e.id}>
            <button className="grow" onClick={() => startEdit(e)} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
              <div className="row-title">
                {e.time && <strong>{e.time} · </strong>}
                {e.title}
              </div>
              <div className="row-sub">
                {e.who && `${e.who}`}
                {vendor && `${e.who ? ' · ' : ''}${vendor.name}`}
                {e.notes && ` · ${e.notes}`}
              </div>
            </button>
            <span className="row" style={{ border: 0, padding: 0, gap: 2 }} data-noprint>
              <button className="btn small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button className="btn small" onClick={() => move(i, 1)} disabled={i === events.length - 1} aria-label="Move down">
                ↓
              </button>
            </span>
          </div>
        )
      })}

      {open ? (
        <div style={{ marginTop: 10 }}>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="rs-time">Time</label>
              <input id="rs-time" placeholder="e.g. 14:30" value={time} onChange={(e) => setTime(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label htmlFor="rs-who">Who</label>
              <input id="rs-who" list="rs-who-options" placeholder="e.g. wedding party" value={who} onChange={(e) => setWho(e.target.value)} />
              <datalist id="rs-who-options">
                {[settings.partner_a, settings.partner_b, 'Wedding party', ...partyMembers.map((m) => m.name)].map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="field">
            <label htmlFor="rs-title">What</label>
            <input id="rs-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="rs-vendor">Vendor</label>
              <select id="rs-vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">None</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="rs-notes">Notes</label>
              <input id="rs-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
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
            <button className="btn primary" onClick={() => void save()} disabled={!title.trim()}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <button className="btn small" style={{ marginTop: 8 }} onClick={startAdd} data-noprint>
          + Add event
        </button>
      )}
    </section>
  )
}
