import SubscreenHeader from '../../components/SubscreenHeader'
import { useData } from '../../data/DataProvider'
import { groupByHousehold } from '../../domain/guestRollups'

const STATUS_LABEL = { to_invite: 'To invite', maybe: 'Maybe', invited: 'Invited', rsvp_yes: 'Yes', rsvp_no: 'No' } as const

export default function GuestListPrint() {
  const { guests } = useData()
  const households = groupByHousehold(guests)

  return (
    <main className="screen">
      <SubscreenHeader
        title="Guest list"
        action={
          <button className="btn small" onClick={() => window.print()}>
            🖨 Print
          </button>
        }
      />
      <section className="card print-view">
        {households.length === 0 && <p className="empty">No guests yet.</p>}
        {households.map((h) => (
          <div className="row" key={h.household}>
            <div className="grow">
              <div className="row-title">{h.household}</div>
              <div className="row-sub">
                {h.guests.map((g) => `${g.name} (${STATUS_LABEL[g.invite_status]})`).join(', ')}
                {h.guests[0].address && ` — ${h.guests[0].address}`}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
