import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../data/DataProvider'
import { rollup } from '../domain/budgetMath'
import { dueSoonFeed } from '../domain/dueSoon'
import { rsvpTally } from '../domain/guestRollups'

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const [ty, tm, td] = todayIso().split('-').map(Number)
  return Math.ceil((new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86_400_000)
}

function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

const KIND_META = {
  task: { icon: '✅', to: '/checklist' },
  payment: { icon: '💰', to: '/budget' },
  key_date: { icon: '📅', to: '/more' },
} as const

export default function Home() {
  const { settings, tasks, payments, budgetItems, keyDates, guests, vendors } = useData()
  const navigate = useNavigate()

  const today = todayIso()
  const feed = dueSoonFeed({ tasks, payments, budgetItems, keyDates }, today).slice(0, 6)
  const r = rollup(budgetItems, payments, settings.total_budget)
  const tally = rsvpTally(guests)
  const total = settings.total_budget
  const over = total !== null && r.total.committed > total
  const committedPct = total ? Math.min((r.total.committed / total) * 100, 100) : 0
  const paidPct = total ? Math.min((r.total.paid / total) * 100, 100) : 0
  const days = settings.wedding_date ? daysUntil(settings.wedding_date) : null
  const venue = settings.venue_vendor_id ? vendors.find((v) => v.id === settings.venue_vendor_id) : undefined

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="wordmark">Everafter</h1>
        <Link to="/settings" className="gear" aria-label="Settings">
          ⚙️
        </Link>
      </header>

      {settings.wedding_date && days !== null ? (
        <section className="card countdown">
          <div className="kicker">{settings.partner_a} & {settings.partner_b}</div>
          <div className="days">{days > 0 ? days : days === 0 ? '💍' : '💞'}</div>
          <div className="tagline">
            {days > 0 ? 'days until we say I do' : days === 0 ? "it's today — get married!" : 'married!'}
          </div>
          <div className="sub">
            {longDate(settings.wedding_date)}
            {venue && ` · ${venue.name}${venue.location ? ` · ${venue.location}` : ''}`}
          </div>
        </section>
      ) : (
        <section className="card countdown">
          <div className="days">💍</div>
          <div className="sub">
            No date yet — <Link to="/settings">set your wedding date</Link> or work through the{' '}
            <Link to="/checklist">first checklist steps</Link>.
          </div>
        </section>
      )}

      {feed.length > 0 && (
        <section className="card">
          <h2 className="card-title">Due soon</h2>
          {feed.map((entry) => (
            <button
              key={`${entry.kind}-${entry.id}`}
              className="row"
              style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              onClick={() => navigate(KIND_META[entry.kind].to)}
            >
              <span>{KIND_META[entry.kind].icon}</span>
              <div className="grow">
                <div className={`row-title${entry.overdue ? ' text-red' : ''}`}>{entry.title}</div>
                <div className={`row-sub${entry.overdue ? ' text-red' : ''}`}>
                  {shortDate(entry.date)}
                  {entry.overdue && ' · overdue'}
                </div>
              </div>
            </button>
          ))}
        </section>
      )}

      {total !== null && (
        <button className="card card--tap" style={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }} onClick={() => navigate('/budget')}>
          <h2 className="card-title">Budget health</h2>
          <div className={`bar${over ? ' over' : ''}`}>
            <div className="seg-paid" style={{ width: `${paidPct}%` }} />
            <div className="seg-committed" style={{ width: `${Math.max(committedPct - paidPct, 0)}%` }} />
          </div>
          <div className="row-sub" style={{ marginTop: 6 }}>
            {money(r.total.committed)} committed · {money(r.total.paid)} paid ·{' '}
            <span className={over ? 'text-red' : 'text-green'}>
              {r.remainingBudget !== null && (over ? `${money(-r.remainingBudget)} over` : `${money(r.remainingBudget)} left`)}
            </span>
          </div>
        </button>
      )}

      {guests.length > 0 && (
        <button className="card card--tap" style={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }} onClick={() => navigate('/guests')}>
          <h2 className="card-title">RSVPs</h2>
          <div className="row" style={{ border: 0, padding: 0, flexWrap: 'wrap' }}>
            <span className="pill green">{tally.confirmed} confirmed</span>
            <span className="pill amber">{tally.awaiting} awaiting</span>
            <span className="pill red">{tally.declined} declined</span>
            {tally.confirmed > 0 && (
              <span className="row-sub">
                {tally.adults} adult{tally.adults === 1 ? '' : 's'} · {tally.kids} kid{tally.kids === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </button>
      )}
    </main>
  )
}
