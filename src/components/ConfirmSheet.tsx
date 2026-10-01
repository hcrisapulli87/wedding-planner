interface Props {
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmSheet({ title, message, confirmLabel = 'Delete', busy = false, onCancel, onConfirm }: Props) {
  return (
    <>
      <div className="sheet-backdrop confirm-backdrop" onClick={busy ? undefined : onCancel} />
      <div className="sheet confirm-sheet" role="alertdialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="sheet-actions">
          <button className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
