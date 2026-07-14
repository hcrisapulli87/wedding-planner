import { useState } from 'react'
import VendorCompare from '../components/VendorCompare'
import VendorSheet, { VENDOR_STATUS_LABELS, VENDOR_TYPE_LABELS } from '../components/VendorSheet'
import { useData } from '../data/DataProvider'
import type { Vendor, VendorStatus, VendorType } from '../data/types'

// Pipeline order — list-style "kanban-ish" sections, rejected collapsed last.
const PIPELINE: VendorStatus[] = ['idea', 'contacted', 'quoted', 'visited', 'booked']

export default function Vendors() {
  const { vendors } = useData()
  const [typeFilter, setTypeFilter] = useState<VendorType | 'all'>('all')
  const [sheetVendor, setSheetVendor] = useState<Vendor | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [showRejected, setShowRejected] = useState(false)

  const filtered = vendors.filter((v) => typeFilter === 'all' || v.type === typeFilter)
  const comparable = filtered.filter((v) => v.status !== 'rejected')
  const canCompare = typeFilter !== 'all' && comparable.length >= 2
  const rejected = filtered.filter((v) => v.status === 'rejected')

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Vendors</h1>
        {canCompare && (
          <button className="btn small" onClick={() => setComparing(true)}>
            Compare
          </button>
        )}
      </header>

      <div className="chip-row">
        <button className={`chip${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>
          All
        </button>
        {Object.entries(VENDOR_TYPE_LABELS).map(([id, label]) => (
          <button
            key={id}
            className={`chip${typeFilter === id ? ' active' : ''}`}
            onClick={() => setTypeFilter(id as VendorType)}
          >
            {label}
          </button>
        ))}
      </div>

      {PIPELINE.map((status) => {
        const group = filtered.filter((v) => v.status === status)
        if (group.length === 0) return null
        return (
          <section key={status}>
            <div className="section-header">
              <h2>{VENDOR_STATUS_LABELS[status]}</h2>
              <span className="count">{group.length}</span>
            </div>
            <div className="card">
              {group.map((v) => (
                <VendorRow key={v.id} vendor={v} showType={typeFilter === 'all'} onOpen={() => openVendor(v)} />
              ))}
            </div>
          </section>
        )
      })}

      {rejected.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="text-dim">Rejected</h2>
            <button className="btn small" onClick={() => setShowRejected(!showRejected)}>
              {showRejected ? 'Hide' : `Show (${rejected.length})`}
            </button>
          </div>
          {showRejected && (
            <div className="card">
              {rejected.map((v) => (
                <VendorRow key={v.id} vendor={v} showType={typeFilter === 'all'} onOpen={() => openVendor(v)} />
              ))}
            </div>
          )}
        </section>
      )}

      {filtered.length === 0 && <p className="empty">No vendors yet — add your first idea.</p>}

      <button className="fab" aria-label="New vendor" onClick={() => openVendor(null)}>
        +
      </button>

      {sheetOpen && (
        <VendorSheet
          vendor={sheetVendor}
          defaultType={typeFilter === 'all' ? undefined : typeFilter}
          onClose={() => setSheetOpen(false)}
        />
      )}
      {comparing && <VendorCompare vendors={comparable} onClose={() => setComparing(false)} />}
    </main>
  )

  function openVendor(v: Vendor | null) {
    setSheetVendor(v)
    setSheetOpen(true)
  }
}

function VendorRow({ vendor, showType, onOpen }: { vendor: Vendor; showType: boolean; onOpen: () => void }) {
  return (
    <div className={`row${vendor.status === 'rejected' ? ' dim' : ''}`}>
      <button className="grow" onClick={onOpen} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div className="row-title">
          {vendor.name}
          {vendor.rating ? ` ${'⭐'.repeat(vendor.rating)}` : ''}
        </div>
        <div className="row-sub">
          {showType && `${VENDOR_TYPE_LABELS[vendor.type]} · `}
          {vendor.quote_amount !== null ? `$${vendor.quote_amount.toLocaleString()}` : 'No quote'}
        </div>
      </button>
      {vendor.available_on_date !== 'unknown' && (
        <span className={`pill ${vendor.available_on_date === 'yes' ? 'green' : 'red'}`}>
          {vendor.available_on_date === 'yes' ? 'Available' : 'Unavailable'}
        </span>
      )}
    </div>
  )
}
