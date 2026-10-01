import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import ConfirmSheet from '../components/ConfirmSheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import { applyWeddingDate } from '../data/api'
import { recomputeDueDates } from '../domain/dueDates'

export default function Settings() {
  const { signOut } = useAuth()
  const { settings, tasks, update, run } = useData()

  const [budget, setBudget] = useState(settings.total_budget?.toString() ?? '')
  const [partnerA, setPartnerA] = useState(settings.partner_a)
  const [partnerB, setPartnerB] = useState(settings.partner_b)

  // Keep the inputs in step with edits from the other phone (realtime).
  useEffect(() => setBudget(settings.total_budget?.toString() ?? ''), [settings.total_budget])
  useEffect(() => setPartnerA(settings.partner_a), [settings.partner_a])
  useEffect(() => setPartnerB(settings.partner_b), [settings.partner_b])

  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const patches = pendingDate ? recomputeDueDates(tasks, pendingDate) : []

  const applyDate = async () => {
    if (!pendingDate) return
    setApplying(true)
    try {
      await run(() => applyWeddingDate(pendingDate, patches))
      setPendingDate(null)
    } catch {
      // run() already showed the error toast; keep the banner so it can be retried.
    } finally {
      setApplying(false)
    }
  }

  const saveBudget = () => {
    const value = budget.trim() === '' ? null : Number(budget)
    if (value !== null && Number.isNaN(value)) return
    if (value === settings.total_budget) return
    void update('wedding_settings', 1, { total_budget: value })
  }

  // Only write when the value actually changed — blurring an untouched field
  // must not push a stale value over the other partner's edit.
  const saveName = (field: 'partner_a' | 'partner_b', value: string, fallback: string) => {
    const next = value.trim() || fallback
    if (next !== settings[field]) void update('wedding_settings', 1, { [field]: next })
  }

  return (
    <main className="screen">
      <SubscreenHeader title="Settings" />

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
              onBlur={() => saveName('partner_a', partnerA, 'Partner A')}
            />
          </div>
          <div className="field">
            <label htmlFor="partner-b">Partner B</label>
            <input
              id="partner-b"
              value={partnerB}
              onChange={(e) => setPartnerB(e.target.value)}
              onBlur={() => saveName('partner_b', partnerB, 'Partner B')}
            />
          </div>
        </div>
      </section>

      <button className="btn danger block" onClick={() => setConfirmingSignOut(true)}>
        Sign out
      </button>

      {confirmingSignOut && (
        <ConfirmSheet
          title="Sign out?"
          message="You'll need to sign back in to see your wedding plan."
          confirmLabel="Sign out"
          onCancel={() => setConfirmingSignOut(false)}
          onConfirm={() => void signOut()}
        />
      )}
    </main>
  )
}
