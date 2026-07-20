import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import TaskSheet from '../components/TaskSheet'
import { useData } from '../data/DataProvider'
import { bucketLabel } from '../domain/dueDates'
import { dueSoonFeed } from '../domain/dueSoon'
import type { WeddingTask } from '../data/types'

// Timeline buckets, furthest-out first, then the after-wedding tail; user
// tasks pinned to explicit dates group under "Pinned" at the end.
const BUCKET_ORDER = [12, 9, 6, 3, 1, 0.5, 0.25, 0, -0.25]

type Filter = 'all' | 'a' | 'b' | 'todo' | 'done'

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function Checklist() {
  const { settings, tasks, update } = useData()
  const [filter, setFilter] = useState<Filter>('all')
  const [sheetTask, setSheetTask] = useState<WeddingTask | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const dueSoonCount = useMemo(
    () => dueSoonFeed({ tasks, payments: [], budgetItems: [], keyDates: [] }, todayIso()).length,
    [tasks],
  )

  const visible = tasks.filter((t) => {
    if (filter === 'a' || filter === 'b') return t.assignee === filter || t.assignee === 'both'
    if (filter === 'todo') return t.status === 'todo' || t.status === 'in_progress'
    if (filter === 'done') return t.status === 'done' || t.status === 'skipped'
    return true
  })

  const buckets = BUCKET_ORDER.map((m) => ({
    monthsOut: m as number | null,
    label: bucketLabel(m),
    tasks: visible.filter((t) => t.months_out === m).sort((a, b) => a.sort_order - b.sort_order),
    all: tasks.filter((t) => t.months_out === m),
  }))
  const pinned = visible
    .filter((t) => t.months_out === null)
    .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))
  if (pinned.length > 0 || tasks.some((t) => t.months_out === null)) {
    buckets.push({
      monthsOut: null,
      label: bucketLabel(null),
      tasks: pinned,
      all: tasks.filter((t) => t.months_out === null),
    })
  }

  const toggle = (t: WeddingTask) => {
    void update('wedding_tasks', t.id, { status: t.status === 'done' ? 'todo' : 'done' })
  }

  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'a', label: settings.partner_a },
    { id: 'b', label: settings.partner_b },
    { id: 'todo', label: 'To do' },
    { id: 'done', label: 'Done' },
  ]

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Checklist</h1>
        {dueSoonCount > 0 && <span className="pill amber">{dueSoonCount} due soon</span>}
      </header>

      {!settings.wedding_date && (
        <div className="banner">
          <Link to="/more" style={{ color: 'inherit' }}>
            Set your wedding date to get real dates →
          </Link>
        </div>
      )}

      <div className="chip-row">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`chip${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {buckets.map(
        (bucket) =>
          bucket.tasks.length > 0 && (
            <section key={String(bucket.monthsOut)}>
              <div className="section-header">
                <h2>{bucket.label}</h2>
                <span className="count">
                  {bucket.all.filter((t) => t.status === 'done').length} done / {bucket.all.length}
                </span>
              </div>
              <div className="card">
                {bucket.tasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={() => toggle(t)} onOpen={() => openTask(t)} />
                ))}
              </div>
            </section>
          ),
      )}

      <button className="fab" aria-label="New task" onClick={() => openTask(null)}>
        +
      </button>

      {sheetOpen && <TaskSheet task={sheetTask} onClose={() => setSheetOpen(false)} />}
    </main>
  )

  function openTask(t: WeddingTask | null) {
    setSheetTask(t)
    setSheetOpen(true)
  }
}

function TaskRow({ task, onToggle, onOpen }: { task: WeddingTask; onToggle: () => void; onOpen: () => void }) {
  const { settings } = useData()
  const initials = { a: settings.partner_a[0] ?? 'A', b: settings.partner_b[0] ?? 'B', both: 'Both' }
  const done = task.status === 'done'
  return (
    <div className={`row${done ? ' done' : ''}${task.status === 'skipped' ? ' dim' : ''}`}>
      <button
        onClick={onToggle}
        aria-label={`Mark ${task.title} ${done ? 'not done' : 'done'}`}
        style={{
          all: 'unset',
          width: 19,
          height: 19,
          borderRadius: 6,
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'var(--gold)' : 'transparent',
          border: done ? 'none' : '1.5px solid rgba(242,239,233,.3)',
        }}
      >
        {done && <Check size={11} strokeWidth={2.5} color="var(--ink)" />}
      </button>
      <button className="grow" onClick={onOpen} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div className="row-title">{task.title}</div>
        <div className="row-sub">
          {task.due_date ? shortDate(task.due_date) : 'No date'}
          {task.status === 'in_progress' && ' · in progress'}
          {task.status === 'skipped' && ' · skipped'}
          {task.due_override && ' · pinned'}
        </div>
      </button>
      <span className={`pill ${task.assignee === 'both' ? 'gold' : 'blush'}`}>{initials[task.assignee]}</span>
    </div>
  )
}
