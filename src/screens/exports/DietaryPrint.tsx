import SubscreenHeader from '../../components/SubscreenHeader'
import { useData } from '../../data/DataProvider'
import { dietarySummary, mealSummary, rsvpTally } from '../../domain/guestRollups'

export default function DietaryPrint() {
  const { guests } = useData()
  const tally = rsvpTally(guests)
  const meals = mealSummary(guests)
  const dietary = dietarySummary(guests)

  return (
    <main className="screen">
      <SubscreenHeader
        title="Caterer summary"
        action={
          <button className="btn small" onClick={() => window.print()}>
            🖨 Print
          </button>
        }
      />
      <section className="card print-view">
        <h2 className="card-title">Headcount (confirmed)</h2>
        <div className="row">
          <div className="grow row-title">
            {tally.confirmed} guests — {tally.adults} adults · {tally.kids} kids
          </div>
        </div>

        <h2 className="card-title" style={{ marginTop: 16 }}>
          Meal choices
        </h2>
        {meals.length === 0 && <p className="empty">No meal choices recorded yet.</p>}
        {meals.map((m) => (
          <div className="row" key={m.need}>
            <div className="grow row-title">{m.need}</div>
            <span className="row-sub">× {m.count}</span>
          </div>
        ))}

        <h2 className="card-title" style={{ marginTop: 16 }}>
          Dietary needs
        </h2>
        {dietary.length === 0 && <p className="empty">No dietary needs recorded.</p>}
        {dietary.map((d) => (
          <div className="row" key={d.need}>
            <div className="grow row-title">{d.need}</div>
            <span className="row-sub">× {d.count}</span>
          </div>
        ))}
      </section>
    </main>
  )
}
