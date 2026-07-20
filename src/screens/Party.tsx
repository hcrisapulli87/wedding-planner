import { useState } from 'react'
import PartySheet, { OUTFIT_LABEL, ROLE_LABEL } from '../components/PartySheet'
import SubscreenHeader from '../components/SubscreenHeader'
import { useData } from '../data/DataProvider'
import type { PartyMember } from '../data/types'
import { byRole, outfitProgress } from '../domain/partyRollups'

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
  const groups = byRole(partyMembers)
  const sideName: Record<'a' | 'b', string> = { a: settings.partner_a, b: settings.partner_b }

  return (
    <main className="screen">
      <SubscreenHeader title="Wedding party" />

      {partyMembers.length > 0 && (
        <div className="banner" style={{ borderColor: 'var(--line)', color: 'var(--text-dim)', background: 'var(--bg-raised)' }}>
          {progress.ready} of {progress.total} outfits ready
        </div>
      )}

      {groups.map((group) => (
        <section key={group.role}>
          <div className="section-header">
            <h2>{ROLE_LABEL[group.role]}</h2>
            <span className="count">{group.members.length}</span>
          </div>
          <div className="card">
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
                    {sideName[m.side]}&rsquo;s side
                    {m.phone && ` · ${m.phone}`}
                    {m.notes && ` · ${m.notes}`}
                  </div>
                </div>
                <span className={`pill ${OUTFIT_PILL[m.outfit_status]}`}>{OUTFIT_LABEL[m.outfit_status]}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

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
