import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { OutfitStatus, PartyMember, PartyRole } from '../data/types'

export const ROLE_LABEL: Record<PartyRole, string> = {
  maid_of_honour: 'Maid of honour',
  bridesmaid: 'Bridesmaid',
  best_man: 'Best man',
  groomsman: 'Groomsman',
  mc: 'MC',
  flower_girl: 'Flower girl',
  page_boy: 'Page boy',
  other: 'Other',
}

export const OUTFIT_LABEL: Record<OutfitStatus, string> = {
  todo: 'Outfit: to do',
  ordered: 'Outfit ordered',
  fitted: 'Fitted',
  ready: 'Ready',
}

export default function PartySheet({ member, onClose }: { member: PartyMember | null; onClose: () => void }) {
  const { settings, partyMembers, insert, update, remove } = useData()

  const [name, setName] = useState(member?.name ?? '')
  const [side, setSide] = useState<'a' | 'b'>(member?.side ?? 'a')
  const [role, setRole] = useState<PartyRole>(member?.role ?? 'other')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [outfit, setOutfit] = useState<OutfitStatus>(member?.outfit_status ?? 'todo')
  const [notes, setNotes] = useState(member?.notes ?? '')

  const save = async () => {
    if (!name.trim()) return
    const fields = { name: name.trim(), side, role, phone, outfit_status: outfit, notes }
    if (member) await update('wedding_party_members', member.id, fields)
    else
      await insert('wedding_party_members', {
        ...fields,
        sort_order: (partyMembers.at(-1)?.sort_order ?? 0) + 10,
      })
    onClose()
  }

  const del = async () => {
    if (!member) return
    await remove('wedding_party_members', member.id)
    onClose()
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{member ? 'Edit member' : 'Add member'}</h3>
        <div className="field">
          <label htmlFor="p-name">Name</label>
          <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="p-side">Side</label>
            <select id="p-side" value={side} onChange={(e) => setSide(e.target.value as 'a' | 'b')}>
              <option value="a">{settings.partner_a}</option>
              <option value="b">{settings.partner_b}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-role">Role</label>
            <select id="p-role" value={role} onChange={(e) => setRole(e.target.value as PartyRole)}>
              {Object.entries(ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-phone">Phone</label>
            <input id="p-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-outfit">Outfit</label>
            <select id="p-outfit" value={outfit} onChange={(e) => setOutfit(e.target.value as OutfitStatus)}>
              <option value="todo">To do</option>
              <option value="ordered">Ordered</option>
              <option value="fitted">Fitted</option>
              <option value="ready">Ready</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="p-notes">Notes</label>
          <input id="p-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {member && (
            <button className="btn danger" onClick={() => void del()}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={!name.trim()}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}
