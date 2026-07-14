import { useEffect, useState } from 'react'
import IdeaSheet, { IDEA_AREA_LABELS } from '../components/IdeaSheet'
import { useData } from '../data/DataProvider'
import { ideaImageUrl } from '../data/ideaImages'
import type { Idea, IdeaArea } from '../data/types'

export default function Ideas() {
  const { ideas } = useData()
  const [areaFilter, setAreaFilter] = useState<IdeaArea | 'all'>('all')
  const [sheetIdea, setSheetIdea] = useState<Idea | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = [...ideas]
    .filter((i) => areaFilter === 'all' || i.area === areaFilter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Ideas</h1>
      </header>

      <div className="chip-row">
        <button className={`chip${areaFilter === 'all' ? ' active' : ''}`} onClick={() => setAreaFilter('all')}>
          All
        </button>
        {Object.entries(IDEA_AREA_LABELS).map(([id, label]) => (
          <button
            key={id}
            className={`chip${areaFilter === id ? ' active' : ''}`}
            onClick={() => setAreaFilter(id as IdeaArea)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="empty">Nothing here yet — save a photo or a link.</p>}

      <div className="idea-grid">
        {filtered.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onOpen={() => openIdea(idea)} />
        ))}
      </div>

      <button className="fab" aria-label="New idea" onClick={() => openIdea(null)}>
        +
      </button>

      {sheetOpen && (
        <IdeaSheet
          idea={sheetIdea}
          defaultArea={areaFilter === 'all' ? undefined : areaFilter}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </main>
  )

  function openIdea(i: Idea | null) {
    setSheetIdea(i)
    setSheetOpen(true)
  }
}

function IdeaCard({ idea, onOpen }: { idea: Idea; onOpen: () => void }) {
  const [imgUrl, setImgUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    if (idea.image_path) {
      void ideaImageUrl(idea.image_path).then((url) => {
        if (!cancelled) setImgUrl(url)
      })
    } else {
      setImgUrl('')
    }
    return () => {
      cancelled = true
    }
  }, [idea.image_path])

  return (
    <button className="idea-card" onClick={onOpen} style={{ border: '1px solid var(--line)', font: 'inherit', color: 'inherit', textAlign: 'left', padding: 0 }}>
      {imgUrl ? (
        <img src={imgUrl} alt={idea.title || 'Inspiration'} loading="lazy" />
      ) : (
        idea.url && <div style={{ padding: '18px 10px 0', fontSize: '1.6rem', textAlign: 'center' }}>🔗</div>
      )}
      <div className="idea-body">
        {idea.title && <div className="idea-title">{idea.title}</div>}
        {idea.url && (
          <div className="row-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hostOf(idea.url)}
          </div>
        )}
        <span className="badge">{IDEA_AREA_LABELS[idea.area]}</span>
      </div>
    </button>
  )
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
