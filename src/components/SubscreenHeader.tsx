import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function SubscreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="subscreen-header">
      <Link to="/plan" className="back-link" aria-label="Back to Plan">
        ‹
      </Link>
      <h1 className="screen-title">{title}</h1>
      {action}
    </header>
  )
}
