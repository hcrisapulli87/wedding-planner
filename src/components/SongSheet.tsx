import { useState } from 'react'
import { useData } from '../data/DataProvider'
import type { Song, SongList } from '../data/types'
import ConfirmSheet from './ConfirmSheet'

export const MOMENT_OPTIONS = ['Aisle', 'Entrance', 'First dance', 'Cake cut', 'Bouquet toss', 'Last song', 'Other']

export default function SongSheet({ song, initialList, onClose }: { song: Song | null; initialList: SongList; onClose: () => void }) {
  const { songs, insert, update, remove } = useData()

  const [list, setList] = useState<SongList>(song?.list ?? initialList)
  const [momentLabel, setMomentLabel] = useState(song?.moment_label ?? 'First dance')
  const [title, setTitle] = useState(song?.title ?? '')
  const [artist, setArtist] = useState(song?.artist ?? '')
  const [notes, setNotes] = useState(song?.notes ?? '')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const save = async () => {
    if (!title.trim()) return
    const fields = {
      list,
      moment_label: list === 'moment' ? momentLabel : '',
      title: title.trim(),
      artist: artist.trim(),
      notes,
    }
    if (song) await update('wedding_songs', song.id, fields)
    else await insert('wedding_songs', { ...fields, sort_order: (songs.at(-1)?.sort_order ?? 0) + 10 })
    onClose()
  }

  const del = async () => {
    if (!song) return
    await remove('wedding_songs', song.id)
    onClose()
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{song ? 'Edit song' : 'Add song'}</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="s-list">List</label>
            <select id="s-list" value={list} onChange={(e) => setList(e.target.value as SongList)}>
              <option value="moment">Moment</option>
              <option value="must_play">Must play</option>
              <option value="do_not_play">Do not play</option>
            </select>
          </div>
          {list === 'moment' && (
            <div className="field">
              <label htmlFor="s-moment">Moment</label>
              <select id="s-moment" value={momentLabel} onChange={(e) => setMomentLabel(e.target.value)}>
                {MOMENT_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="s-title">Song</label>
          <input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="s-artist">Artist</label>
          <input id="s-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="s-notes">Notes</label>
          <input id="s-notes" placeholder="e.g. acoustic version" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {song && (
            <button className="btn danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
      {confirmingDelete && (
        <ConfirmSheet
          title="Delete this song?"
          message="This can't be undone."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
    </>
  )
}
