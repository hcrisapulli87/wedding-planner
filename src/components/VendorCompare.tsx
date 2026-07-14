import type { Vendor } from '../data/types'
import { VENDOR_STATUS_LABELS } from './VendorSheet'

interface Props {
  vendors: Vendor[]
  onClose: () => void
}

const AVAILABILITY: Record<Vendor['available_on_date'], string> = {
  yes: '✅ Yes',
  no: '❌ No',
  unknown: '— Unknown',
}

export default function VendorCompare({ vendors, onClose }: Props) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>Compare</h3>
        <div className="compare-scroll">
          <table className="compare">
            <thead>
              <tr>
                <th />
                {vendors.map((v) => (
                  <th key={v.id}>{v.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Status" values={vendors.map((v) => VENDOR_STATUS_LABELS[v.status])} />
              <CompareRow
                label="Quote"
                values={vendors.map((v) => (v.quote_amount !== null ? `$${v.quote_amount.toLocaleString()}` : '—'))}
              />
              <CompareRow label="Capacity" values={vendors.map((v) => v.capacity?.toString() ?? '—')} />
              <CompareRow label="Location" values={vendors.map((v) => v.location || '—')} />
              <CompareRow label="Rating" values={vendors.map((v) => (v.rating ? '⭐'.repeat(v.rating) : '—'))} />
              <CompareRow label="Available" values={vendors.map((v) => AVAILABILITY[v.available_on_date])} />
              <CompareRow label="Pros" values={vendors.map((v) => v.pros || '—')} />
              <CompareRow label="Cons" values={vendors.map((v) => v.cons || '—')} />
            </tbody>
          </table>
        </div>
        <div className="sheet-actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td>{label}</td>
      {values.map((v, i) => (
        <td key={i}>{v}</td>
      ))}
    </tr>
  )
}
