import { useState } from 'react'
import PartySheet, { OUTFIT_LABEL, ROLE_LABEL } from '../components/PartySheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { PartyMember } from '../data/types'
import { bySide, outfitProgress } from '../domain/partyRollups'

const OUTFIT_PILL: Record<PartyMember['outfit_status'], string> = {
  todo: 'amber',
  ordered: 'gold',
  fitted: 'gold',
  ready: 'green',
}

export default function Party() {
  const { settings, partyMembers } = useData()
  const [editing, setEditing] = useState<PartyMember | null>(null)
  const [adding, setAdding] = useState(false)

  const progress = outfitProgress(partyMembers)
  const sides = bySide(partyMembers)
  const groups = [
    { label: `${settings.partner_a}'s side`, members: sides.a },
    { label: `${settings.partner_b}'s side`, members: sides.b },
  ]

  return (
    <main className="screen">
      <SubscreenHeader title="Wedding party" />

      {partyMembers.length > 0 && (
        <div className="banner" style={{ borderColor: 'var(--line)', color: 'var(--text-dim)', background: 'var(--bg-raised)' }}>
          {progress.ready} of {progress.total} outfits ready
        </div>
      )}

      {groups.map(
        (group) =>
          group.members.length > 0 && (
            <section className="card" key={group.label}>
              <h2 className="card-title">{group.label}</h2>
              {group.members.map((m) => (
                <button
                  key={m.id}
                  className="row"
                  style={{ all: 'unset', display: 'flex', width: '100%', cursor: 'pointer', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg-sunken)' }}
                  onClick={() => setEditing(m)}
                >
                  <div className="grow">
                    <div className="row-title">{m.name}</div>
                    <div className="row-sub">
                      {ROLE_LABEL[m.role]}
                      {m.phone && ` · ${m.phone}`}
                      {m.notes && ` · ${m.notes}`}
                    </div>
                  </div>
                  <span className={`pill ${OUTFIT_PILL[m.outfit_status]}`}>{OUTFIT_LABEL[m.outfit_status]}</span>
                </button>
              ))}
            </section>
          ),
      )}

      {partyMembers.length === 0 && (
        <section className="card">
          <p className="empty">Bridesmaids, groomsmen, MC — add your crew.</p>
        </section>
      )}

      <button className="fab" aria-label="Add member" onClick={() => setAdding(true)}>
        +
      </button>

      {(adding || editing) && (
        <PartySheet
          member={editing}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
        />
      )}
    </main>
  )
}
