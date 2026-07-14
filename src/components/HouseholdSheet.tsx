import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { Assignee, Guest, InviteStatus } from '../data/types'

// Two modes: a new *household* (name + address + several members in one save)
// or editing a single existing guest (all fields incl. meal/dietary/thank-you).

interface MemberDraft {
  name: string
  side: Assignee
  grp: Guest['grp']
  is_child: boolean
  is_plus_one: boolean
}

function blankMember(): MemberDraft {
  return { name: '', side: 'both', grp: 'friends', is_child: false, is_plus_one: false }
}

interface Props {
  guest: Guest | null // null = new household
  onClose: () => void
}

export default function HouseholdSheet({ guest, onClose }: Props) {
  const { settings, insert, update, remove } = useData()
  const [saving, setSaving] = useState(false)

  // New-household state
  const [household, setHousehold] = useState('')
  const [address, setAddress] = useState('')
  const [members, setMembers] = useState<MemberDraft[]>([blankMember()])

  // Single-guest state
  const [name, setName] = useState(guest?.name ?? '')
  const [gHousehold, setGHousehold] = useState(guest?.household ?? '')
  const [gAddress, setGAddress] = useState(guest?.address ?? '')
  const [side, setSide] = useState<Assignee>(guest?.side ?? 'both')
  const [grp, setGrp] = useState<Guest['grp']>(guest?.grp ?? 'friends')
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>(guest?.invite_status ?? 'to_invite')
  const [meal, setMeal] = useState(guest?.meal_choice ?? '')
  const [dietary, setDietary] = useState(guest?.dietary ?? '')
  const [isChild, setIsChild] = useState(guest?.is_child ?? false)
  const [isPlusOne, setIsPlusOne] = useState(guest?.is_plus_one ?? false)
  const [thankYou, setThankYou] = useState(guest?.thank_you_sent ?? false)

  const setMember = (i: number, patch: Partial<MemberDraft>) => {
    setMembers(members.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  }

  const saveHousehold = async () => {
    const filled = members.filter((m) => m.name.trim())
    if (filled.length === 0) return
    setSaving(true)
    try {
      for (const m of filled) {
        await insert('wedding_guests', {
          name: m.name.trim(),
          household: household.trim(),
          address: address.trim(),
          side: m.side,
          grp: m.grp,
          is_child: m.is_child,
          is_plus_one: m.is_plus_one,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const saveGuest = async () => {
    if (!guest || !name.trim()) return
    setSaving(true)
    try {
      await update('wedding_guests', guest.id, {
        name: name.trim(),
        household: gHousehold.trim(),
        address: gAddress.trim(),
        side,
        grp,
        invite_status: inviteStatus,
        meal_choice: meal,
        dietary,
        is_child: isChild,
        is_plus_one: isPlusOne,
        thank_you_sent: thankYou,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!guest) return
    setSaving(true)
    try {
      await remove('wedding_guests', guest.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (guest) {
    return (
      <>
        <div className="sheet-backdrop" onClick={onClose} />
        <div className="sheet">
          <h3>Edit guest</h3>
          <div className="field">
            <label htmlFor="g-name">Name</label>
            <input id="g-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="g-household">Household</label>
              <input id="g-household" value={gHousehold} onChange={(e) => setGHousehold(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="g-address">Address</label>
              <input id="g-address" value={gAddress} onChange={(e) => setGAddress(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="g-side">Side</label>
              <select id="g-side" value={side} onChange={(e) => setSide(e.target.value as Assignee)}>
                <option value="a">{settings.partner_a}</option>
                <option value="b">{settings.partner_b}</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-grp">Group</label>
              <select id="g-grp" value={grp} onChange={(e) => setGrp(e.target.value as Guest['grp'])}>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-status">Invite status</label>
              <select id="g-status" value={inviteStatus} onChange={(e) => setInviteStatus(e.target.value as InviteStatus)}>
                <option value="to_invite">To invite</option>
                <option value="invited">Invited</option>
                <option value="rsvp_yes">RSVP yes</option>
                <option value="rsvp_no">RSVP no</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-meal">Meal choice</label>
              <input id="g-meal" value={meal} onChange={(e) => setMeal(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="g-dietary">Dietary needs</label>
            <input id="g-dietary" placeholder="e.g. gluten free" value={dietary} onChange={(e) => setDietary(e.target.value)} />
          </div>
          <label className="checkbox-line">
            <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} /> Child
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={isPlusOne} onChange={(e) => setIsPlusOne(e.target.checked)} /> Plus-one
          </label>
          <label className="checkbox-line">
            <input type="checkbox" checked={thankYou} onChange={(e) => setThankYou(e.target.checked)} /> Thank-you sent
          </label>
          <div className="sheet-actions">
            <button className="btn danger" onClick={() => void del()} disabled={saving}>
              Delete
            </button>
            <button className="btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn primary" onClick={() => void saveGuest()} disabled={saving || !name.trim()}>
              Save
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
        <h3>New household</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="h-name">Household (optional)</label>
            <input id="h-name" placeholder="e.g. Smith family" value={household} onChange={(e) => setHousehold(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="h-address">Address</label>
            <input id="h-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        {members.map((m, i) => (
          <div className="card" key={i} style={{ marginBottom: 8 }}>
            <div className="field">
              <label htmlFor={`m-name-${i}`}>Name</label>
              <input id={`m-name-${i}`} value={m.name} onChange={(e) => setMember(i, { name: e.target.value })} autoFocus={i === 0} />
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor={`m-side-${i}`}>Side</label>
                <select id={`m-side-${i}`} value={m.side} onChange={(e) => setMember(i, { side: e.target.value as Assignee })}>
                  <option value="a">{settings.partner_a}</option>
                  <option value="b">{settings.partner_b}</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor={`m-grp-${i}`}>Group</label>
                <select id={`m-grp-${i}`} value={m.grp} onChange={(e) => setMember(i, { grp: e.target.value as Guest['grp'] })}>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <label className="checkbox-line">
              <input type="checkbox" checked={m.is_child} onChange={(e) => setMember(i, { is_child: e.target.checked })} /> Child
            </label>
            <label className="checkbox-line">
              <input type="checkbox" checked={m.is_plus_one} onChange={(e) => setMember(i, { is_plus_one: e.target.checked })} /> Plus-one
            </label>
          </div>
        ))}
        <button className="btn small" onClick={() => setMembers([...members, blankMember()])}>
          + Add member
        </button>
        <div className="sheet-actions">
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => void saveHousehold()}
            disabled={saving || !members.some((m) => m.name.trim())}
          >
            Save {members.filter((m) => m.name.trim()).length || ''}
          </button>
        </div>
      </div>
    </>
  )
}
