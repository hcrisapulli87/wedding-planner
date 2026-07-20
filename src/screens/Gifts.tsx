import { useState } from 'react'
import GiftSheet from '../components/GiftSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { Gift } from '../data/types'
import { giftRollup } from '../domain/giftRollups'

type Filter = 'all' | 'to_thank' | 'thanked'

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const KIND_LABEL = { physical: 'Gift', cash: 'Cash', voucher: 'Voucher' } as const

export default function Gifts() {
  const { gifts } = useData()
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Gift | null>(null)
  const [adding, setAdding] = useState(false)

  const rollup = giftRollup(gifts)
  const visible = gifts.filter((g) =>
    filter === 'all' ? true : filter === 'to_thank' ? !g.thank_you_sent : g.thank_you_sent,
  )

  return (
    <main className="screen">
      <SubscreenHeader title="Gifts" />

      <div className="stat-row">
        <div className="stat">
          <div className="num">{rollup.total}</div>
          <div className="lbl">Gifts</div>
        </div>
        <div className="stat">
          <div className="num">{money(rollup.cashTotal)}</div>
          <div className="lbl">Cash & vouchers</div>
        </div>
        <div className="stat">
          <div className="num">{rollup.toThank}</div>
          <div className="lbl">To thank</div>
        </div>
      </div>

      <div className="chip-row">
        {(['all', 'to_thank', 'thanked'] as const).map((f) => (
          <button key={f} className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'to_thank' ? 'To thank' : 'Thanked'}
          </button>
        ))}
      </div>

      <section className="card">
        {visible.length === 0 && <p className="empty">Gifts get logged here as they arrive.</p>}
        {visible.map((g) => (
          <button
            key={g.id}
            className="row"
            style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
            onClick={() => setEditing(g)}
          >
            <div className="grow">
              <div className="row-title">{g.giver}</div>
              <div className="row-sub">
                {KIND_LABEL[g.kind]}
                {g.amount ? ` · ${money(Number(g.amount))}` : ''}
                {g.description && ` · ${g.description}`}
                {` · ${shortDate(g.received_date)}`}
              </div>
            </div>
            <span className={`pill ${g.thank_you_sent ? 'green' : 'amber'}`}>
              {g.thank_you_sent ? 'Thanked' : 'To thank'}
            </span>
          </button>
        ))}
      </section>

      <button className="fab" aria-label="Add gift" onClick={() => setAdding(true)}>
        +
      </button>

      {(adding || editing) && (
        <GiftSheet
          gift={editing}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
        />
      )}
    </main>
  )
}
