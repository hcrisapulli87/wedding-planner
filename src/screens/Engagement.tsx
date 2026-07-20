import { useState } from 'react'
import EngagementSheet, { CATEGORY_ICON, STATUS_LABEL } from '../components/EngagementSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { EngagementItem, EngagementStatus } from '../data/types'
import { sortItinerary } from '../domain/honeymoon'

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const STATUS_PILL: Record<EngagementStatus, string> = {
  todo: 'amber',
  quoted: 'gold',
  booked: 'green',
}

type Filter = 'all' | 'todo' | 'booked'
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'booked', label: 'Booked' },
]

export default function Engagement() {
  const { engagementItems } = useData()
  const [editing, setEditing] = useState<EngagementItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const items = sortItinerary(engagementItems)
  const total = items.reduce((sum, i) => sum + (i.cost !== null ? Number(i.cost) : 0), 0)
  const bookedCount = items.filter((i) => i.status === 'booked').length
  const visible = items.filter((i) => {
    if (filter === 'todo') return i.status !== 'booked'
    if (filter === 'booked') return i.status === 'booked'
    return true
  })

  return (
    <main className="screen">
      <SubscreenHeader title="Engagement party" />

      {total > 0 && (
        <div className="banner" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-dim)', background: 'var(--glass-bg-soft)' }}>
          {money(total)} planned · {bookedCount} of {items.length} booked
        </div>
      )}

      <div className="chip-row">
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <section className="card">
        {visible.length === 0 && <p className="empty">Venue, food, the toast — plan the party that starts it all.</p>}
        {visible.map((i) => (
          <button
            key={i.id}
            className="row"
            style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
            onClick={() => setEditing(i)}
          >
            <span>{CATEGORY_ICON[i.category]}</span>
            <div className="grow">
              <div className="row-title">{i.title}</div>
              <div className="row-sub">
                {i.start_date && shortDate(i.start_date)}
                {i.end_date && ` – ${shortDate(i.end_date)}`}
                {i.location && ` · ${i.location}`}
                {i.cost !== null && ` · ${money(Number(i.cost))}`}
                {i.notes && ` · ${i.notes}`}
              </div>
            </div>
            <span className={`pill ${STATUS_PILL[i.status]}`}>{STATUS_LABEL[i.status]}</span>
          </button>
        ))}
      </section>

      <button className="fab" aria-label="Add engagement item" onClick={() => setAdding(true)}>
        +
      </button>

      {(adding || editing) && (
        <EngagementSheet
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
