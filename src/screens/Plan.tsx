import { Link } from 'react-router-dom'
import { Handshake, Lightbulb, Shirt, Wine, Gift, Music2, Palmtree } from 'lucide-react'
import { useData } from '../data/DataProvider'
import { engagementLine, giftsLine, honeymoonLine, ideasLine, musicLine, partyLine, vendorsLine } from '../domain/planCounts'

const LIST_LINKS = [
  { to: '/key-dates', label: 'Key dates' },
  { to: '/run-sheet', label: 'Run sheet' },
  { to: '/exports', label: 'Exports & prints' },
  { to: '/settings', label: 'Settings' },
]

export default function Plan() {
  const { vendors, ideas, partyMembers, gifts, songs, honeymoonItems, engagementItems } = useData()

  const tiles = [
    { to: '/vendors', Icon: Handshake, label: 'Vendors', line: vendorsLine(vendors) },
    { to: '/ideas', Icon: Lightbulb, label: 'Ideas', line: ideasLine(ideas) },
    { to: '/party', Icon: Shirt, label: 'Wedding party', line: partyLine(partyMembers) },
    { to: '/engagement', Icon: Wine, label: 'Engagement party', line: engagementLine(engagementItems) },
    { to: '/gifts', Icon: Gift, label: 'Gifts', line: giftsLine(gifts) },
    { to: '/music', Icon: Music2, label: 'Music', line: musicLine(songs) },
    { to: '/honeymoon', Icon: Palmtree, label: 'Honeymoon', line: honeymoonLine(honeymoonItems) },
  ]

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Plan</h1>
      </header>

      <div className="hub-grid">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="hub-tile">
            <div className="ic">
              <t.Icon size={20} strokeWidth={1.8} />
            </div>
            <div className="nm">{t.label}</div>
            <div className="ct">{t.line}</div>
          </Link>
        ))}
      </div>

      <section className="card" style={{ padding: '4px 18px' }}>
        {LIST_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="grow row-title">{l.label}</span>
            <span className="text-gold">›</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
