import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '💞' },
  { to: '/checklist', label: 'Checklist', icon: '✅' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/vendors', label: 'Vendors', icon: '🤝' },
  { to: '/guests', label: 'Guests', icon: '🪑' },
  { to: '/ideas', label: 'Ideas', icon: '💡' },
]

export default function Layout() {
  return (
    <>
      <Outlet />
      <nav className="tabbar">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}>
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
