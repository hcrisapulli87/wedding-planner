import { useState } from 'react'
import HouseholdSheet from '../components/HouseholdSheet'
import { ROLE_LABEL } from '../components/PartySheet'
import SeatingTab from '../components/SeatingTab'
import { useData } from '../data/DataProvider'
import {
  capacityWarning,
  dietarySummary,
  groupByHousehold,
  mealSummary,
  rsvpTally,
} from '../domain/guestRollups'
import type { Guest, InviteStatus } from '../data/types'

const STATUS_PILL: Record<InviteStatus, { label: string; cls: string }> = {
  to_invite: { label: 'To invite', cls: '' },
  maybe: { label: 'Maybe', cls: 'gold' },
  invited: { label: 'Invited', cls: 'amber' },
  rsvp_yes: { label: 'Yes', cls: 'green' },
  rsvp_no: { label: 'No', cls: 'red' },
}

export default function Guests() {
  const { settings, guests, vendors, partyMembers, update } = useData()
  const [tab, setTab] = useState<'guests' | 'seating'>('guests')
  const [sheetGuest, setSheetGuest] = useState<Guest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dietaryOpen, setDietaryOpen] = useState(false)
  const [rsvpFor, setRsvpFor] = useState<string | null>(null) // guest id showing yes/no row

  const tally = rsvpTally(guests)
  const venue = settings.venue_vendor_id ? vendors.find((v) => v.id === settings.venue_vendor_id) : undefined
  const warning = capacityWarning(tally.confirmed, venue?.capacity ?? null)
  const diets = dietarySummary(guests)
  const meals = mealSummary(guests)

  // Derived, never stored: a guest linked from the wedding party wears the role badge.
  const partyRole = new Map(partyMembers.filter((m) => m.guest_id).map((m) => [m.guest_id as string, m.role]))

  // Pill tap: to_invite → maybe → invited → mini yes/no row; yes/no → back to invited.
  const cyclePill = (g: Guest) => {
    if (g.invite_status === 'to_invite') void update('wedding_guests', g.id, { invite_status: 'maybe' })
    else if (g.invite_status === 'maybe') void update('wedding_guests', g.id, { invite_status: 'invited' })
    else if (g.invite_status === 'invited') setRsvpFor(rsvpFor === g.id ? null : g.id)
    else void update('wedding_guests', g.id, { invite_status: 'invited' })
  }

  const setRsvp = (g: Guest, status: InviteStatus) => {
    void update('wedding_guests', g.id, { invite_status: status })
    setRsvpFor(null)
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Guests</h1>
      </header>

      <div className="segmented">
        <button className={tab === 'guests' ? 'active' : ''} onClick={() => setTab('guests')}>
          Guests
        </button>
        <button className={tab === 'seating' ? 'active' : ''} onClick={() => setTab('seating')}>
          Seating
        </button>
      </div>

      {tab === 'seating' ? (
        <SeatingTab />
      ) : (
        <>
          <div className="stat-row">
            <div className="stat">
              <div className="num">{tally.toInvite}</div>
              <div className="lbl">To invite</div>
            </div>
            <div className="stat">
              <div className="num">{tally.maybe}</div>
              <div className="lbl">Maybe</div>
            </div>
            <div className="stat">
              <div className="num">{tally.awaiting}</div>
              <div className="lbl">Awaiting</div>
            </div>
            <div className="stat">
              <div className="num text-green">{tally.confirmed}</div>
              <div className="lbl">Confirmed</div>
            </div>
            <div className="stat">
              <div className="num text-dim">{tally.declined}</div>
              <div className="lbl">Declined</div>
            </div>
          </div>
          {tally.confirmed > 0 && (
            <p className="text-dim" style={{ marginTop: -6, fontSize: '0.8rem' }}>
              {tally.adults} adult{tally.adults === 1 ? '' : 's'} · {tally.kids} kid{tally.kids === 1 ? '' : 's'}
            </p>
          )}

          {warning && <div className="banner red">{warning}</div>}

          {(diets.length > 0 || meals.length > 0) && (
            <section className="card">
              <button
                style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', justifyContent: 'space-between' }}
                onClick={() => setDietaryOpen(!dietaryOpen)}
              >
                <span className="card-title" style={{ margin: 0 }}>
                  Dietary summary
                </span>
                <span className="text-dim">{dietaryOpen ? '▾' : '▸'}</span>
              </button>
              {dietaryOpen && (
                <div style={{ marginTop: 10 }}>
                  {diets.map((d) => (
                    <div className="row" key={d.need}>
                      <span className="grow">{d.need}</span>
                      <span className="amount">{d.count}</span>
                    </div>
                  ))}
                  {meals.length > 0 && (
                    <>
                      <h2 className="card-title" style={{ marginTop: 12 }}>
                        Meals
                      </h2>
                      {meals.map((m) => (
                        <div className="row" key={m.need}>
                          <span className="grow">{m.need}</span>
                          <span className="amount">{m.count}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {groupByHousehold(guests).map((group) => (
            <section className="card" key={group.household}>
              {(group.guests.length > 1 || group.guests[0].household) && (
                <h2 className="card-title">{group.household}</h2>
              )}
              {group.guests.map((g) => (
                <div className="row" key={g.id}>
                  <button className="grow" onClick={() => openGuest(g)} style={{ all: 'unset', flex: 1, minWidth: 0, cursor: 'pointer' }}>
                    <div className="row-title">{g.name}</div>
                    <div className="row-sub">
                      {partyRole.has(g.id) && <span className="badge">💐 {ROLE_LABEL[partyRole.get(g.id)!]}</span>}
                      {g.is_child && <span className="badge">child</span>}
                      {g.is_plus_one && <span className="badge">+1</span>}
                      {g.dietary && <span className="badge">{g.dietary}</span>}
                    </div>
                  </button>
                  {rsvpFor === g.id && g.invite_status === 'invited' ? (
                    <span className="row" style={{ border: 0, padding: 0, gap: 4 }}>
                      <button className="pill green" onClick={() => setRsvp(g, 'rsvp_yes')}>
                        Yes
                      </button>
                      <button className="pill red" onClick={() => setRsvp(g, 'rsvp_no')}>
                        No
                      </button>
                    </span>
                  ) : (
                    <button className={`pill ${STATUS_PILL[g.invite_status].cls}`} onClick={() => cyclePill(g)}>
                      {STATUS_PILL[g.invite_status].label}
                    </button>
                  )}
                </div>
              ))}
            </section>
          ))}

          {guests.length === 0 && <p className="empty">No guests yet — add your first household.</p>}

          <button className="fab" aria-label="New household" onClick={() => openGuest(null)}>
            +
          </button>
        </>
      )}

      {sheetOpen && <HouseholdSheet guest={sheetGuest} onClose={() => setSheetOpen(false)} />}
    </main>
  )

  function openGuest(g: Guest | null) {
    setSheetGuest(g)
    setSheetOpen(true)
  }
}
