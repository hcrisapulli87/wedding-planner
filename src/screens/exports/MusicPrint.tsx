import SubscreenHeader from '../../components/SubscreenHeader'
import { useData } from '../../data/DataProvider'
import type { SongList } from '../../data/types'

const SECTIONS: { list: SongList; heading: string }[] = [
  { list: 'moment', heading: 'Moments' },
  { list: 'must_play', heading: 'Must play' },
  { list: 'do_not_play', heading: 'Do not play' },
]

export default function MusicPrint() {
  const { songs } = useData()

  return (
    <main className="screen">
      <SubscreenHeader
        title="Music lists"
        action={
          <button className="btn small" onClick={() => window.print()}>
            🖨 Print
          </button>
        }
      />
      <section className="card print-view">
        {SECTIONS.map((section) => {
          const items = songs
            .filter((s) => s.list === section.list)
            .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
          if (items.length === 0) return null
          return (
            <div key={section.list}>
              <h2 className="card-title" style={{ marginTop: 12 }}>
                {section.heading}
              </h2>
              {items.map((s) => (
                <div className="row" key={s.id}>
                  <div className="grow">
                    <div className="row-title">
                      {s.moment_label && `${s.moment_label}: `}
                      {s.title}
                    </div>
                    <div className="row-sub">
                      {s.artist}
                      {s.notes && ` · ${s.notes}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
        {songs.length === 0 && <p className="empty">No songs yet.</p>}
      </section>
    </main>
  )
}
