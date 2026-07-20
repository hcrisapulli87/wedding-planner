import { useState } from 'react'
import { useData } from '../data/DataProvider'
import { bookingCascade } from '../domain/vendorBooking'
import type { BudgetItem, Vendor, VendorStatus, VendorType } from '../data/types'
import ConfirmSheet from './ConfirmSheet'

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  venue: 'Venue',
  photographer: 'Photographer',
  videographer: 'Videographer',
  celebrant: 'Celebrant',
  caterer: 'Caterer',
  florist: 'Florist',
  band_dj: 'Band / DJ',
  cake: 'Cake',
  hair_makeup: 'Hair & makeup',
  transport: 'Transport',
  stationery: 'Stationery',
  other: 'Other',
}

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  idea: 'Idea',
  contacted: 'Contacted',
  quoted: 'Quoted',
  visited: 'Visited',
  booked: 'Booked',
  rejected: 'Rejected',
}

interface Props {
  vendor: Vendor | null // null = new vendor
  defaultType?: VendorType
  onClose: () => void
}

function todayIso(): string {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

export default function VendorSheet({ vendor, defaultType, onClose }: Props) {
  const { insert, update, remove } = useData()

  const [type, setType] = useState<VendorType>(vendor?.type ?? defaultType ?? 'other')
  const [name, setName] = useState(vendor?.name ?? '')
  const [status, setStatus] = useState<VendorStatus>(vendor?.status ?? 'idea')
  const [contactName, setContactName] = useState(vendor?.contact_name ?? '')
  const [phone, setPhone] = useState(vendor?.phone ?? '')
  const [email, setEmail] = useState(vendor?.email ?? '')
  const [website, setWebsite] = useState(vendor?.website ?? '')
  const [quote, setQuote] = useState(vendor?.quote_amount?.toString() ?? '')
  const [availability, setAvailability] = useState(vendor?.available_on_date ?? 'unknown')
  const [capacity, setCapacity] = useState(vendor?.capacity?.toString() ?? '')
  const [rating, setRating] = useState(vendor?.rating ?? 0)
  const [location, setLocation] = useState(vendor?.location ?? '')
  const [pros, setPros] = useState(vendor?.pros ?? '')
  const [cons, setCons] = useState(vendor?.cons ?? '')
  const [links, setLinks] = useState((vendor?.links ?? []).join('\n'))
  const [notes, setNotes] = useState(vendor?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // Book-vendor confirm step (one action → three records, each untickable)
  const [confirming, setConfirming] = useState(false)
  const [wantItem, setWantItem] = useState(true)
  const [wantDeposit, setWantDeposit] = useState(true)
  const [wantTask, setWantTask] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositDue, setDepositDue] = useState('')

  const num = (s: string) => (s.trim() === '' ? null : Number(s))

  const fields = () => ({
    type,
    name: name.trim(),
    status,
    contact_name: contactName,
    phone,
    email,
    website,
    quote_amount: num(quote),
    available_on_date: availability,
    capacity: num(capacity),
    rating: rating || null,
    location,
    pros,
    cons,
    links: links.split('\n').map((l) => l.trim()).filter(Boolean),
    notes,
  })

  const save = async () => {
    if (!name.trim()) return
    const becomingBooked = status === 'booked' && vendor?.status !== 'booked'
    if (becomingBooked && !confirming) {
      // Stage the cascade for confirmation instead of saving straight away.
      const preview = bookingCascade({ ...(vendor ?? blank()), ...fields(), id: vendor?.id ?? '' }, todayIso())
      setDepositAmount(preview.payment?.amount.toString() ?? '')
      setDepositDue(preview.payment?.due_date ?? '')
      setWantDeposit(preview.payment !== null)
      setConfirming(true)
      return
    }
    setSaving(true)
    try {
      let vendorId = vendor?.id
      if (vendor) {
        await update('wedding_vendors', vendor.id, fields())
      } else {
        const created = await insert<Vendor>('wedding_vendors', fields())
        vendorId = created.id
      }
      if (becomingBooked && vendorId) {
        await applyCascade(vendorId)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const applyCascade = async (vendorId: string) => {
    const cascade = bookingCascade({ ...(vendor ?? blank()), ...fields(), id: vendorId }, todayIso())
    if (wantItem) {
      const item = await insert<BudgetItem>('wedding_budget_items', cascade.budgetItem)
      if (wantDeposit && depositAmount.trim()) {
        await insert('wedding_payments', {
          budget_item_id: item.id,
          label: 'deposit',
          amount: Number(depositAmount),
          due_date: depositDue || null,
        })
      }
    }
    if (wantTask) {
      await insert('wedding_tasks', { ...cascade.task, months_out: null, from_template: false })
    }
    if (type === 'venue') {
      await update('wedding_settings', 1, { venue_vendor_id: vendorId })
    }
  }

  const del = async () => {
    if (!vendor) return
    setSaving(true)
    try {
      await remove('wedding_vendors', vendor.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (confirming) {
    return (
      <>
        <div className="sheet-backdrop" onClick={() => setConfirming(false)} />
        <div className="sheet">
          <h3>Book {name}?</h3>
          <p className="text-dim">This sets the vendor to Booked and can create:</p>
          <label className="checkbox-line">
            <input type="checkbox" checked={wantItem} onChange={(e) => setWantItem(e.target.checked)} />
            Budget item “{name}”{quote && ` (quoted $${quote})`}
          </label>
          <label className="checkbox-line" style={{ opacity: wantItem ? 1 : 0.4 }}>
            <input
              type="checkbox"
              checked={wantDeposit && wantItem}
              disabled={!wantItem || !quote}
              onChange={(e) => setWantDeposit(e.target.checked)}
            />
            Deposit payment{!quote && ' (needs a quote)'}
          </label>
          {wantItem && wantDeposit && quote && (
            <div className="field-grid">
              <div className="field">
                <label htmlFor="dep-amount">Deposit amount</label>
                <input id="dep-amount" type="number" inputMode="decimal" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="dep-due">Due</label>
                <input id="dep-due" type="date" value={depositDue} onChange={(e) => setDepositDue(e.target.value)} />
              </div>
            </div>
          )}
          <label className="checkbox-line">
            <input type="checkbox" checked={wantTask} onChange={(e) => setWantTask(e.target.checked)} />
            Task “Sign contract — {name}” due in a week
          </label>
          {type === 'venue' && <p className="text-dim">Also sets this venue as *the* venue (guest capacity warnings).</p>}
          <div className="sheet-actions">
            <button className="btn" onClick={() => setConfirming(false)} disabled={saving}>
              Back
            </button>
            <button className="btn primary" onClick={() => void save()} disabled={saving}>
              {saving ? 'Booking…' : 'Book vendor'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{vendor ? 'Edit vendor' : 'New vendor'}</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="v-type">Type</label>
            <select id="v-type" value={type} onChange={(e) => setType(e.target.value as VendorType)}>
              {Object.entries(VENDOR_TYPE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="v-status">Status</label>
            <select id="v-status" value={status} onChange={(e) => setStatus(e.target.value as VendorStatus)}>
              {Object.entries(VENDOR_STATUS_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="v-name">Name</label>
          <input id="v-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!vendor} />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="v-contact">Contact</label>
            <input id="v-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-phone">Phone</label>
            <input id="v-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-email">Email</label>
            <input id="v-email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-website">Website</label>
            <input id="v-website" inputMode="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-quote">Quote ($)</label>
            <input id="v-quote" type="number" inputMode="decimal" value={quote} onChange={(e) => setQuote(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-avail">Available on our date?</label>
            <select id="v-avail" value={availability} onChange={(e) => setAvailability(e.target.value as 'yes' | 'no' | 'unknown')}>
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="v-capacity">Capacity</label>
            <input id="v-capacity" type="number" inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-location">Location</label>
            <input id="v-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Rating</label>
          <div className="row" style={{ border: 0, padding: 0 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(rating === n ? 0 : n)}
                style={{ all: 'unset', cursor: 'pointer', fontSize: '1.4rem', opacity: n <= rating ? 1 : 0.25 }}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="v-pros">Pros</label>
            <textarea id="v-pros" rows={3} value={pros} onChange={(e) => setPros(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="v-cons">Cons</label>
            <textarea id="v-cons" rows={3} value={cons} onChange={(e) => setCons(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="v-links">Links (one per line)</label>
          <textarea id="v-links" rows={2} value={links} onChange={(e) => setLinks(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="v-notes">Notes</label>
          <textarea id="v-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {vendor && (
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
          title="Delete this vendor?"
          message="This can't be undone."
          busy={saving}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
    </>
  )
}

function blank(): Vendor {
  return {
    id: '',
    type: 'other',
    name: '',
    status: 'idea',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    quote_amount: null,
    available_on_date: 'unknown',
    capacity: null,
    rating: null,
    location: '',
    pros: '',
    cons: '',
    links: [],
    notes: '',
    created_at: '',
  }
}
