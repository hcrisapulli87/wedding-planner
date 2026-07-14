import { useState } from 'react'
import type { FormEvent } from 'react'
import HoneymoonSheet from '../components/HoneymoonSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { HoneymoonItem } from '../data/types'
import { sortItinerary } from '../domain/honeymoon'

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function Honeymoon() {
  const { honeymoonItems, packingItems, insert, update, remove } = useData()
  const [segment, setSegment] = useState<'itinerary' | 'packing'>('itinerary')
  const [editing, setEditing] = useState<HoneymoonItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState('')

  const itinerary = sortItinerary(honeymoonItems)
  const packing = [...packingItems].sort((a, b) => a.sort_order - b.sort_order)
  const packed = packing.filter((p) => p.packed).length

  const addPacking = async (e: FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    await insert('wedding_packing_items', {
      item: newItem.trim(),
      sort_order: (packing.at(-1)?.sort_order ?? 0) + 10,
    })
    setNewItem('')
  }

  return (
    <main className="screen">
      <SubscreenHeader title="Honeymoon" />

      <div className="segmented">
        <button className={segment === 'itinerary' ? 'active' : ''} onClick={() => setSegment('itinerary')}>
          Itinerary
        </button>
        <button className={segment === 'packing' ? 'active' : ''} onClick={() => setSegment('packing')}>
          Packing {packing.length > 0 && `(${packed}/${packing.length})`}
        </button>
      </div>

      {segment === 'itinerary' ? (
        <section className="card">
          {itinerary.length === 0 && <p className="empty">Flights, resort, adventures — build the escape.</p>}
          {itinerary.map((i) => (
            <button
              key={i.id}
              className="row"
              style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-sunken)' }}
              onClick={() => setEditing(i)}
            >
              <span>{i.kind === 'booking' ? '🎫' : '🌊'}</span>
              <div className="grow">
                <div className="row-title">{i.title}</div>
                <div className="row-sub">
                  {i.start_date && shortDate(i.start_date)}
                  {i.end_date && ` – ${shortDate(i.end_date)}`}
                  {i.cost !== null && ` · ${money(Number(i.cost))}`}
                  {i.confirmation_ref && ` · #${i.confirmation_ref}`}
                  {i.notes && ` · ${i.notes}`}
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section className="card">
          {packing.map((p) => (
            <div className={`row${p.packed ? ' done' : ''}`} key={p.id}>
              <input
                type="checkbox"
                checked={p.packed}
                style={{ width: 18, height: 18, accentColor: 'var(--gold)' }}
                onChange={(e) => void update('wedding_packing_items', p.id, { packed: e.target.checked })}
              />
              <div className="grow row-title">{p.item}</div>
              <button className="btn small" aria-label="Remove" onClick={() => void remove('wedding_packing_items', p.id)}>
                ✕
              </button>
            </div>
          ))}
          <form onSubmit={(e) => void addPacking(e)} className="row" style={{ borderBottom: 'none' }}>
            <input
              placeholder="Add packing item…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={{ flex: 1, background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--text)', padding: '9px 12px', fontSize: '0.9rem' }}
            />
            <button className="btn small" type="submit" disabled={!newItem.trim()}>
              Add
            </button>
          </form>
        </section>
      )}

      {segment === 'itinerary' && (
        <button className="fab" aria-label="Add itinerary item" onClick={() => setAdding(true)}>
          +
        </button>
      )}

      {(adding || editing) && (
        <HoneymoonSheet
          item={editing}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
        />
      )}
    </main>
  )
}
