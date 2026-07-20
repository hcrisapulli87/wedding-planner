import { useState } from 'react'
import { useData } from '../data/DataProvider'
import { CATEGORY_LABELS } from '../domain/budgetMath'
import type { BudgetCategory, BudgetItem } from '../data/types'
import ConfirmSheet from './ConfirmSheet'

interface Props {
  item: BudgetItem | null // null = new item
  defaultCategory?: BudgetCategory
  onClose: () => void
}

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

function money(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function BudgetItemSheet({ item, defaultCategory, onClose }: Props) {
  const { payments, vendors, insert, update, remove } = useData()

  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState<BudgetCategory>(item?.category ?? defaultCategory ?? 'other')
  const [estimated, setEstimated] = useState(item?.estimated?.toString() ?? '')
  const [quoted, setQuoted] = useState(item?.quoted?.toString() ?? '')
  const [actual, setActual] = useState(item?.actual?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // Add-payment row state
  const [payLabel, setPayLabel] = useState('deposit')
  const [payAmount, setPayAmount] = useState('')
  const [payDue, setPayDue] = useState('')

  const itemPayments = item ? payments.filter((p) => p.budget_item_id === item.id) : []
  const vendor = item?.vendor_id ? vendors.find((v) => v.id === item.vendor_id) : undefined
  const today = todayIso()

  const num = (s: string) => (s.trim() === '' ? null : Number(s))

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const fields = {
        name: name.trim(),
        category,
        estimated: num(estimated),
        quoted: num(quoted),
        actual: num(actual),
      }
      if (item) await update('wedding_budget_items', item.id, fields)
      else await insert('wedding_budget_items', fields)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!item) return
    setSaving(true)
    try {
      await remove('wedding_budget_items', item.id) // payments cascade in the DB
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const addPayment = async () => {
    if (!item || !payAmount.trim()) return
    await insert('wedding_payments', {
      budget_item_id: item.id,
      label: payLabel.trim() || 'payment',
      amount: Number(payAmount),
      due_date: payDue || null,
    })
    setPayLabel('')
    setPayAmount('')
    setPayDue('')
  }

  const togglePaid = (id: string, paid: boolean) => {
    void update('wedding_payments', id, {
      paid: !paid,
      paid_at: !paid ? new Date().toISOString() : null,
    })
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{item ? 'Edit budget item' : 'New budget item'}</h3>
        <div className="field">
          <label htmlFor="bi-name">Name</label>
          <input id="bi-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!item} />
        </div>
        <div className="field">
          <label htmlFor="bi-cat">Category</label>
          <select id="bi-cat" value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)}>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {vendor && (
          <p>
            <span className="pill gold">🤝 {vendor.name}</span>
          </p>
        )}
        <div className="field-grid-3">
          <div className="field">
            <label htmlFor="bi-est">Estimated</label>
            <input id="bi-est" type="number" inputMode="decimal" value={estimated} onChange={(e) => setEstimated(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="bi-quo">Quoted</label>
            <input id="bi-quo" type="number" inputMode="decimal" value={quoted} onChange={(e) => setQuoted(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="bi-act">Actual</label>
            <input id="bi-act" type="number" inputMode="decimal" value={actual} onChange={(e) => setActual(e.target.value)} />
          </div>
        </div>

        {item && (
          <>
            <h3 style={{ marginTop: 6 }}>Payment schedule</h3>
            {itemPayments.length === 0 && <p className="empty">No payments yet.</p>}
            {itemPayments.map((p) => {
              const overdue = !p.paid && p.due_date !== null && p.due_date < today
              return (
                <div className="row" key={p.id}>
                  <input
                    type="checkbox"
                    checked={p.paid}
                    onChange={() => togglePaid(p.id, p.paid)}
                    style={{ width: 20, height: 20, accentColor: 'var(--green)' }}
                    aria-label={`Mark ${p.label} ${p.paid ? 'unpaid' : 'paid'}`}
                  />
                  <div className="grow">
                    <div className={`row-title${overdue ? ' text-red' : ''}`}>
                      {p.label} — ${money(p.amount)}
                    </div>
                    <div className={`row-sub${overdue ? ' text-red' : ''}`}>
                      {p.due_date ?? 'No due date'}
                      {overdue && ' · overdue'}
                      {p.paid && ' · paid'}
                    </div>
                  </div>
                  <button className="btn small danger" onClick={() => void remove('wedding_payments', p.id)}>
                    ✕
                  </button>
                </div>
              )
            })}
            <div className="field-grid-3">
              <div className="field">
                <label htmlFor="pay-label">Label</label>
                <input id="pay-label" placeholder="deposit" value={payLabel} onChange={(e) => setPayLabel(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pay-amount">Amount</label>
                <input id="pay-amount" type="number" inputMode="decimal" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pay-due">Due</label>
                <input id="pay-due" type="date" value={payDue} onChange={(e) => setPayDue(e.target.value)} />
              </div>
            </div>
            <button className="btn small" onClick={() => void addPayment()} disabled={!payAmount.trim()}>
              + Add payment
            </button>
          </>
        )}

        <div className="sheet-actions">
          {item && (
            <button className="btn danger" onClick={() => setConfirmingDelete(true)} disabled={saving}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={saving || !name.trim()}>
            Save
          </button>
        </div>
      </div>
      {confirmingDelete && (
        <ConfirmSheet
          title="Delete this budget item?"
          message="This can't be undone."
          busy={saving}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
    </>
  )
}
