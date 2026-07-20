import { useState } from 'react'
import SongSheet from '../components/SongSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { Song, SongList } from '../data/types'

const SEGMENTS: { value: SongList; label: string }[] = [
  { value: 'moment', label: 'Moments' },
  { value: 'must_play', label: 'Must play' },
  { value: 'do_not_play', label: 'Do not play' },
]

const EMPTY_HINT: Record<SongList, string> = {
  moment: 'Aisle, first dance, last song — pin a track to each moment.',
  must_play: 'Songs the DJ must get to.',
  do_not_play: 'The banned list. No exceptions, no requests.',
}

export default function Music() {
  const { songs } = useData()
  const [segment, setSegment] = useState<SongList>('moment')
  const [editing, setEditing] = useState<Song | null>(null)
  const [adding, setAdding] = useState(false)

  const visible = songs
    .filter((s) => s.list === segment)
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))

  return (
    <main className="screen">
      <SubscreenHeader title="Music" />

      <div className="segmented">
        {SEGMENTS.map((s) => (
          <button key={s.value} className={segment === s.value ? 'active' : ''} onClick={() => setSegment(s.value)}>
            {s.label}
          </button>
        ))}
      </div>

      <section className="card">
        {visible.length === 0 && <p className="empty">{EMPTY_HINT[segment]}</p>}
        {visible.map((s) => (
          <button
            key={s.id}
            className="row"
            style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
            onClick={() => setEditing(s)}
          >
            <div className="grow">
              <div className="row-title">{s.title}</div>
              <div className="row-sub">
                {s.artist}
                {s.notes && ` · ${s.notes}`}
              </div>
            </div>
            {segment === 'moment' && s.moment_label && <span className="pill gold">{s.moment_label}</span>}
          </button>
        ))}
      </section>

      <button className="fab" aria-label="Add song" onClick={() => setAdding(true)}>
        +
      </button>

      {(adding || editing) && (
        <SongSheet
          song={editing}
          initialList={segment}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
        />
      )}
    </main>
  )
}
