import { Link } from 'react-router-dom'
import SubscreenHeader from '../components/SubscreenHeader'

const EXPORTS = [
  { to: '/exports/dietary', icon: '🍽️', label: 'Caterer summary', sub: 'Meal counts + dietary needs of confirmed guests' },
  { to: '/exports/guests', icon: '✉️', label: 'Guest & address list', sub: 'Per household, for invitations' },
  { to: '/exports/seating', icon: '🪑', label: 'Seating chart', sub: 'Tables with seated guests' },
  { to: '/exports/music', icon: '🎵', label: 'Music lists', sub: 'DJ handout — moments, must-plays, do-not-plays' },
  { to: '/run-sheet', icon: '📋', label: 'Run sheet', sub: 'Day-of timeline (print from its screen)' },
]

export default function Exports() {
  return (
    <main className="screen">
      <SubscreenHeader title="Exports & prints" />
      <section className="card" style={{ padding: '4px 14px' }}>
        {EXPORTS.map((e) => (
          <Link key={e.to} to={e.to} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>{e.icon}</span>
            <div className="grow">
              <div className="row-title">{e.label}</div>
              <div className="row-sub">{e.sub}</div>
            </div>
            <span className="text-dim">›</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
