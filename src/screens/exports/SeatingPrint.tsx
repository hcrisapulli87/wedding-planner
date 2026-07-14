import SubscreenHeader from '../../components/SubscreenHeader'
import { useData } from '../../data/DataProvider'

export default function SeatingPrint() {
  const { tables, guests } = useData()
  const sorted = [...tables].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <main className="screen">
      <SubscreenHeader
        title="Seating chart"
        action={
          <button className="btn small" onClick={() => window.print()}>
            🖨 Print
          </button>
        }
      />
      <section className="card print-view">
        {sorted.length === 0 && <p className="empty">No tables yet — set them up in Guests → Seating.</p>}
        {sorted.map((t) => {
          const seated = guests.filter((g) => g.table_id === t.id)
          return (
            <div className="row" key={t.id}>
              <div className="grow">
                <div className="row-title">
                  {t.name} ({seated.length}/{t.capacity})
                </div>
                <div className="row-sub">{seated.map((g) => g.name).join(', ') || 'Empty'}</div>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
