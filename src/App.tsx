import { Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import Layout from './components/Layout'
import { DataProvider } from './data/DataProvider'
import Budget from './screens/Budget'
import Checklist from './screens/Checklist'
import Gifts from './screens/Gifts'
import Guests from './screens/Guests'
import Party from './screens/Party'
import Home from './screens/Home'
import Ideas from './screens/Ideas'
import KeyDates from './screens/KeyDates'
import Login from './screens/Login'
import Plan from './screens/Plan'
import RunSheet from './screens/RunSheet'
import Settings from './screens/Settings'
import Vendors from './screens/Vendors'

function Shell() {
  const { loading, session } = useAuth()
  if (loading) {
    return (
      <main className="login">
        <div className="rings">💍</div>
        <h1 className="wordmark">Everafter</h1>
        <hr className="rule-ornament" />
      </main>
    )
  }
  if (!session) return <Login />
  return (
    <DataProvider>
      <AppRoutes />
    </DataProvider>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/party" element={<Party />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/key-dates" element={<KeyDates />} />
        <Route path="/run-sheet" element={<RunSheet />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
