import { useState } from 'react'
import { useData } from '../data/DataProvider'
import { seatingSummary } from '../domain/seating'
import type { SeatTable } from '../data/types'

export default function SeatingTab() {
  const { tables, guests, insert, update, remove } = useData()
  const summary = seatingSummary(tables, guests)

  const [assigning, setAssigning] = useState<string | null>(null) // guest id being seated
  const [editing, setEditing] = useState<SeatTable | null>(null)
  const [addingTable, setAddingTable] = useState(false)
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState('10')

  const startEdit = (t: SeatTable) => {
    setEditing(t)
    setTableName(t.name)
    setTableCapacity(String(t.capacity))
    setAddingTable(false)
  }

  const startAdd = () => {
    setAddingTable(true)
    setEditing(null)
    setTableName(`Table ${tables.length + 1}`)
    setTableCapacity('10')
  }

  const saveTable = async () => {
    if (!tableName.trim()) return
    const fields = { name: tableName.trim(), capacity: Number(tableCapacity) || 10 }
    if (editing) await update('wedding_tables', editing.id, fields)
    else await insert('wedding_tables', { ...fields, sort_order: tables.length })
    setEditing(null)
    setAddingTable(false)
  }

  const deleteTable = async () => {
    if (!editing) return
    await remove('wedding_tables', editing.id) // guests' table_id nulls in the DB
    setEditing(null)
  }

  const seat = (guestId: string, tableId: string) => {
    void update('wedding_guests', guestId, { table_id: tableId })
    setAssigning(null)
  }

  const unseat = (guestId: string) => {
    void update('wedding_guests', guestId, { table_id: null })
  }

  return (
    <>
      {summary.unseated.length > 0 && (
        <section className="card">
          <h2 className="card-title">Unseated ({summary.unseated.length})</h2>
          <p className="row-sub" style={{ marginBottom: 8 }}>
            {assigning ? 'Now tap a table below.' : 'Tap a guest, then a table.'}
          </p>
          <div className="chip-row" style={{ flexWrap: 'wrap' }}>
            {summary.unseated.map((g) => (
              <button
                key={g.id}
                className={`chip${assigning === g.id ? ' active' : ''}`}
                onClick={() => setAssigning(assigning === g.id ? null : g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {summary.tables.map(({ table, seated, overBy }) => (
        <section className="card" key={table.id}>
          <div className="row" style={{ border: 0, paddingTop: 0 }}>
            <div className="grow">
              <div className="row-title">{table.name}</div>
              <div className={`row-sub${overBy > 0 ? ' text-red' : ''}`}>
                {seated.length}/{table.capacity} seated
                {overBy > 0 && ` · ${overBy} over capacity`}
              </div>
            </div>
            {assigning && (
              <button className="btn primary small" onClick={() => seat(assigning, table.id)}>
                Seat here
              </button>
            )}
            <button className="btn small" onClick={() => startEdit(table)} aria-label={`Edit ${table.name}`}>
              ✎
            </button>
          </div>
          {seated.length > 0 && (
            <div className="chip-row" style={{ flexWrap: 'wrap' }}>
              {seated.map((g) => (
                <button key={g.id} className="chip" onClick={() => unseat(g.id)} title="Tap to unseat">
                  {g.name} ✕
                </button>
              ))}
            </div>
          )}
        </section>
      ))}

      {(addingTable || editing) && (
        <section className="card">
          <h2 className="card-title">{editing ? `Edit ${editing.name}` : 'New table'}</h2>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="t-name">Name</label>
              <input id="t-name" value={tableName} onChange={(e) => setTableName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="t-capacity">Capacity</label>
              <input id="t-capacity" type="number" inputMode="numeric" value={tableCapacity} onChange={(e) => setTableCapacity(e.target.value)} />
            </div>
          </div>
          <div className="sheet-actions">
            {editing && (
              <button className="btn danger" onClick={() => void deleteTable()}>
                Delete
              </button>
            )}
            <button className="btn" onClick={() => { setEditing(null); setAddingTable(false) }}>
              Cancel
            </button>
            <button className="btn primary" onClick={() => void saveTable()} disabled={!tableName.trim()}>
              Save
            </button>
          </div>
        </section>
      )}

      {!addingTable && !editing && (
        <button className="btn block" onClick={startAdd}>
          + Add table
        </button>
      )}

      {tables.length === 0 && !addingTable && (
        <p className="empty">No tables yet — add one to start seating confirmed guests.</p>
      )}
    </>
  )
}
