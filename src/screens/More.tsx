import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import KeyDatesSection from '../components/KeyDatesSection'
import RunSheetSection from '../components/RunSheetSection'
import { useData } from '../data/DataProvider'
import { updateRow } from '../data/api'
import { recomputeDueDates } from '../domain/dueDates'

export default function More() {
  const { signOut } = useAuth()
  const { settings, tasks, update, refresh } = useData()

  const [budget, setBudget] = useState(settings.total_budget?.toString() ?? '')
  const [partnerA, setPartnerA] = useState(settings.partner_a)
  const [partnerB, setPartnerB] = useState(settings.partner_b)

  // Wedding-date change is a two-step: pick a date, see how many task dates it
  // moves, then confirm. Pinned (due_override) tasks are never touched.
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const patches = pendingDate ? recomputeDueDates(tasks, pendingDate) : []

  const applyDate = async () => {
    if (!pendingDate) return
    setApplying(true)
    try {
      await updateRow('wedding_settings', 1, { wedding_date: pendingDate })
      await Promise.all(patches.map((p) => updateRow('wedding_tasks', p.id, { due_date: p.due_date })))
      await refresh()
      setPendingDate(null)
    } finally {
      setApplying(false)
    }
  }

  const saveBudget = () => {
    const value = budget.trim() === '' ? null : Number(budget)
    if (value !== null && Number.isNaN(value)) return
    void update('wedding_settings', 1, { total_budget: value })
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">More</h1>
      </header>

      <section className="card">
        <h2 className="card-title">Wedding</h2>
        <div className="field">
          <label htmlFor="wedding-date">Wedding date</label>
          <input
            id="wedding-date"
            type="date"
            value={pendingDate ?? settings.wedding_date ?? ''}
            onChange={(e) => setPendingDate(e.target.value || null)}
          />
        </div>
        {pendingDate && pendingDate !== settings.wedding_date && (
          <div className="banner">
            This moves {patches.length} task date{patches.length === 1 ? '' : 's'} (pinned tasks stay put).
            <div className="sheet-actions">
              <button className="btn small" onClick={() => setPendingDate(null)} disabled={applying}>
                Cancel
              </button>
              <button className="btn primary small" onClick={() => void applyDate()} disabled={applying}>
                {applying ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
        <div className="field">
          <label htmlFor="total-budget">Total budget ($)</label>
          <input
            id="total-budget"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 30000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onBlur={saveBudget}
          />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="partner-a">Partner A</label>
            <input
              id="partner-a"
              value={partnerA}
              onChange={(e) => setPartnerA(e.target.value)}
              onBlur={() => void update('wedding_settings', 1, { partner_a: partnerA.trim() || 'Partner A' })}
            />
          </div>
          <div className="field">
            <label htmlFor="partner-b">Partner B</label>
            <input
              id="partner-b"
              value={partnerB}
              onChange={(e) => setPartnerB(e.target.value)}
              onBlur={() => void update('wedding_settings', 1, { partner_b: partnerB.trim() || 'Partner B' })}
            />
          </div>
        </div>
      </section>

      <KeyDatesSection />

      <RunSheetSection />

      <button className="btn danger block" onClick={() => void signOut()}>
        Sign out
      </button>
    </main>
  )
}
