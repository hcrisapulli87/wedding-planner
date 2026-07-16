import { useState } from 'react'
import EngagementSheet from '../components/EngagementSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { EngagementItem } from '../data/types'
import { sortItinerary } from '../domain/honeymoon'

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function Engagement() {
  const { engagementItems } = useData()
  const [editing, setEditing] = useState<EngagementItem | null>(null)
  const [adding, setAdding] = useState(false)

  const items = sortItinerary(engagementItems)
  const total = items.reduce((sum, i) => sum + (i.cost !== null ? Number(i.cost) : 0), 0)

  return (
    <main className="screen">
      <SubscreenHeader title="Engagement party" />

      {total > 0 && (
        <div className="banner" style={{ borderColor: 'var(--line)', color: 'var(--text-dim)', background: 'var(--bg-raised)' }}>
          {money(total)} planned so far
        </div>
      )}

      <section className="card">
        {items.length === 0 && <p className="empty">Venue, food, the toast — plan the party that starts it all.</p>}
        {items.map((i) => (
          <button
            key={i.id}
            className="row"
            style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-sunken)' }}
            onClick={() => setEditing(i)}
          >
            <span>{i.kind === 'booking' ? '🎫' : '🥂'}</span>
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
