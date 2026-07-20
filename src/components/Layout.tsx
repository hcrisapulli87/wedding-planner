import { NavLink, Outlet } from 'react-router-dom'
import { Home as HomeIcon, ListChecks, DollarSign, Users, LayoutGrid } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/checklist', label: 'Checklist', Icon: ListChecks },
  { to: '/budget', label: 'Budget', Icon: DollarSign },
  { to: '/guests', label: 'Guests', Icon: Users },
  { to: '/plan', label: 'Plan', Icon: LayoutGrid },
]

export default function Layout() {
  return (
    <>
      <Outlet />
      <nav className="tabbar">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            <span className="tab-icon">
              <Icon size={16} strokeWidth={2.25} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
