import { Link } from 'react-router-dom'
import { useData } from '../data/DataProvider'
import { giftsLine, honeymoonLine, ideasLine, musicLine, partyLine, vendorsLine } from '../domain/planCounts'

const LIST_LINKS = [
  { to: '/key-dates', icon: '📅', label: 'Key dates' },
  { to: '/run-sheet', icon: '📋', label: 'Run sheet' },
  { to: '/exports', icon: '🖨️', label: 'Exports & prints' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function Plan() {
  const { vendors, ideas, partyMembers, gifts, songs, honeymoonItems } = useData()

  const tiles = [
    { to: '/vendors', icon: '🤝', label: 'Vendors', line: vendorsLine(vendors) },
    { to: '/ideas', icon: '💡', label: 'Ideas', line: ideasLine(ideas) },
    { to: '/party', icon: '👗', label: 'Wedding party', line: partyLine(partyMembers) },
    { to: '/gifts', icon: '🎁', label: 'Gifts', line: giftsLine(gifts) },
    { to: '/music', icon: '🎵', label: 'Music', line: musicLine(songs) },
    { to: '/honeymoon', icon: '🏝️', label: 'Honeymoon', line: honeymoonLine(honeymoonItems) },
  ]

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Plan</h1>
      </header>

      <div className="hub-grid">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="hub-tile">
            <div className="ic">{t.icon}</div>
            <div className="nm">{t.label}</div>
            <div className="ct">{t.line}</div>
          </Link>
        ))}
      </div>

      <section className="card" style={{ padding: '4px 14px' }}>
        {LIST_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>{l.icon}</span>
            <span className="grow row-title">{l.label}</span>
            <span className="text-dim">›</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
