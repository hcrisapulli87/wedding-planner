import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useData } from '../data/DataProvider'
import { deleteIdeaImage, uploadIdeaImage } from '../data/ideaImages'
import type { Idea, IdeaArea } from '../data/types'
import ConfirmSheet from './ConfirmSheet'

export const IDEA_AREA_LABELS: Record<IdeaArea, string> = {
  dress: 'Dress',
  suits: 'Suits',
  theme_colours: 'Theme & colours',
  flowers: 'Flowers',
  hair: 'Hair',
  cake: 'Cake',
  decor: 'Decor',
  music: 'Music',
  other: 'Other',
}

interface Props {
  idea: Idea | null // null = new idea
  defaultArea?: IdeaArea
  onClose: () => void
}

export default function IdeaSheet({ idea, defaultArea, onClose }: Props) {
  const { insert, update, remove } = useData()
  const { user } = useAuth()

  const [area, setArea] = useState<IdeaArea>(idea?.area ?? defaultArea ?? 'other')
  const [title, setTitle] = useState(idea?.title ?? '')
  const [url, setUrl] = useState(idea?.url ?? '')
  const [notes, setNotes] = useState(idea?.notes ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const hasContent = title.trim() || url.trim() || file || idea?.image_path

  const save = async () => {
    if (!hasContent) return
    setSaving(true)
    setError('')
    const oldPath = idea?.image_path ?? ''
    let uploaded = ''
    try {
      // Upload first, point the row at it, and only then drop the old photo —
      // a failed upload or save must never leave the idea pointing at nothing.
      if (file) uploaded = await uploadIdeaImage(file)
      const fields = { area, title: title.trim(), url: url.trim(), notes, image_path: uploaded || oldPath }
      if (idea) await update('wedding_ideas', idea.id, fields)
      else await insert('wedding_ideas', { ...fields, created_by: user?.id ?? null })
      if (uploaded && oldPath) await deleteIdeaImage(oldPath).catch(() => {})
      onClose()
    } catch (err) {
      // The row save failed after a successful upload: don't orphan the new photo.
      if (uploaded) void deleteIdeaImage(uploaded).catch(() => {})
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!idea) return
    setSaving(true)
    try {
      if (idea.image_path) await deleteIdeaImage(idea.image_path).catch(() => {})
      await remove('wedding_ideas', idea.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{idea ? 'Edit idea' : 'New idea'}</h3>
        <div className="field">
          <label htmlFor="i-area">Area</label>
          <select id="i-area" value={area} onChange={(e) => setArea(e.target.value as IdeaArea)}>
            {Object.entries(IDEA_AREA_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="i-title">Title</label>
          <input id="i-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="i-url">Link</label>
          <input id="i-url" inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="i-photo">Photo</label>
          {/* accept="image/*" offers the camera roll on iOS — the mobile flow */}
          <input id="i-photo" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {idea?.image_path && !file && <p className="row-sub">Has a photo — pick a new one to replace it.</p>}
        </div>
        <div className="field">
          <label htmlFor="i-notes">Notes</label>
          <textarea id="i-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="sheet-actions">
          {idea && (
            <button className="btn danger" onClick={() => setConfirmingDelete(true)} disabled={saving}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={saving || !hasContent}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {confirmingDelete && (
        <ConfirmSheet
          title="Delete this idea?"
          message="This can't be undone."
          busy={saving}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
    </>
  )
}
