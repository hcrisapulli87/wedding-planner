import { useState } from 'react'
import { useData } from '../data/DataProvider'
import { dueDateFor } from '../domain/dueDates'
import type { Assignee, TaskStatus, WeddingTask } from '../data/types'
import ConfirmSheet from './ConfirmSheet'

interface Props {
  task: WeddingTask | null // null = new task
  onClose: () => void
}

export default function TaskSheet({ task, onClose }: Props) {
  const { settings, insert, update, remove } = useData()

  const [title, setTitle] = useState(task?.title ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [assignee, setAssignee] = useState<Assignee>(task?.assignee ?? 'both')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  // Editing the date pins the task to it; "re-link" recomputes from the timeline.
  const [dueOverride, setDueOverride] = useState(task?.due_override ?? false)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const canRelink = task !== null && task.months_out !== null && dueOverride

  const relink = () => {
    setDueOverride(false)
    if (task?.months_out != null && settings.wedding_date) {
      setDueDate(dueDateFor(settings.wedding_date, task.months_out))
    }
  }

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const fields = {
        title: title.trim(),
        notes,
        assignee,
        status,
        due_date: dueDate || null,
        due_override: dueOverride,
      }
      if (task) {
        await update('wedding_tasks', task.id, fields)
      } else {
        await insert('wedding_tasks', { ...fields, months_out: null, from_template: false })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!task) return
    setSaving(true)
    try {
      await remove('wedding_tasks', task.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <h3>{task ? 'Edit task' : 'New task'}</h3>
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!task} />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="task-assignee">Assignee</label>
            <select id="task-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value as Assignee)}>
              <option value="a">{settings.partner_a}</option>
              <option value="b">{settings.partner_b}</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-status">Status</label>
            <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="task-due">Due date</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              setDueOverride(true)
            }}
          />
          {canRelink && (
            <button className="btn small" style={{ marginTop: 6 }} onClick={relink}>
              Re-link to timeline
            </button>
          )}
        </div>
        <div className="field">
          <label htmlFor="task-notes">Notes</label>
          <textarea id="task-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sheet-actions">
          {task && (
            <button className="btn danger" onClick={() => setConfirmingDelete(true)} disabled={saving}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void save()} disabled={saving || !title.trim()}>
            Save
          </button>
        </div>
      </div>
      {confirmingDelete && (
        <ConfirmSheet
          title="Delete this task?"
          message="This can't be undone."
          busy={saving}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => void del()}
        />
      )}
    </>
  )
}
