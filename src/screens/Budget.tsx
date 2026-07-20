import { useState } from 'react'
import BudgetItemSheet from '../components/BudgetItemSheet'
import { useData } from '../data/DataProvider'
import { CATEGORY_LABELS, committedFor, rollup } from '../domain/budgetMath'
import type { BudgetCategory, BudgetItem } from '../data/types'

function money(n: number): string {
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function Budget() {
  const { settings, budgetItems, payments } = useData()
  const [openCategory, setOpenCategory] = useState<BudgetCategory | null>(null)
  const [sheetItem, setSheetItem] = useState<BudgetItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const r = rollup(budgetItems, payments, settings.total_budget)
  const total = settings.total_budget
  const over = total !== null && r.total.committed > total
  const committedPct = total ? Math.min((r.total.committed / total) * 100, 100) : 0
  const paidPct = total ? Math.min((r.total.paid / total) * 100, 100) : 0

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Budget</h1>
      </header>

      <section className="card">
        <h2 className="card-title">Overall</h2>
        {total === null ? (
          <p className="empty">Set your total budget in More → Wedding to see budget health.</p>
        ) : (
          <>
            <div className={`bar${over ? ' over' : ''}`}>
              <div className="seg-paid" style={{ width: `${paidPct}%` }} />
              <div className="seg-committed" style={{ width: `${Math.max(committedPct - paidPct, 0)}%` }} />
            </div>
            <div className="row" style={{ border: 0, paddingBottom: 0 }}>
              <span className="grow row-sub">
                {money(r.total.committed)} committed · {money(r.total.paid)} paid · of {money(total)}
              </span>
              <span className={`amount${over ? ' text-red' : ' text-green'}`}>
                {r.remainingBudget !== null &&
                  (over ? `${money(-r.remainingBudget)} over` : `${money(r.remainingBudget)} left`)}
              </span>
            </div>
          </>
        )}
      </section>

      {r.categories.map((c) => {
        const items = budgetItems.filter((i) => i.category === c.category)
        const isOpen = openCategory === c.category
        return (
          <section className="card" key={c.category}>
            <button
              className="row"
              style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center' }}
              onClick={() => setOpenCategory(isOpen ? null : c.category)}
            >
              <div className="grow">
                <div className="row-title">{CATEGORY_LABELS[c.category]}</div>
                <div className="row-sub">
                  {c.committed > 0
                    ? `${money(c.committed)} committed · ${money(c.paid)} paid · ${money(c.owing)} owing`
                    : ''}
                  {c.committed === 0 && c.estimated > 0 && (
                    <span className="text-dim">~{money(c.estimated)} estimated</span>
                  )}
                </div>
              </div>
              <span className="text-dim">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen &&
              items.map((i) => {
                const committed = committedFor(i)
                return (
                  <button
                    key={i.id}
                    className="row"
                    style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
                    onClick={() => openItem(i)}
                  >
                    <div className="grow">
                      <div className="row-title">{i.name}</div>
                      <div className="row-sub">
                        {committed !== null
                          ? `${money(committed)}${i.actual !== null ? ' actual' : ' quoted'}`
                          : i.estimated !== null
                            ? `~${money(i.estimated)} estimated`
                            : 'No figures yet'}
                      </div>
                    </div>
                  </button>
                )
              })}
          </section>
        )
      })}

      {budgetItems.length === 0 && (
        <p className="empty">No budget items yet — add one, or book a vendor to create one automatically.</p>
      )}

      <button className="fab" aria-label="New budget item" onClick={() => openItem(null)}>
        +
      </button>

      {sheetOpen && (
        <BudgetItemSheet item={sheetItem} defaultCategory={openCategory ?? undefined} onClose={() => setSheetOpen(false)} />
      )}
    </main>
  )

  function openItem(i: BudgetItem | null) {
    setSheetItem(i)
    setSheetOpen(true)
  }
}
