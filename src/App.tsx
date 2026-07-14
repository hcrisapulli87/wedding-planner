import { Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import Layout from './components/Layout'
import Login from './screens/Login'

function Stub({ name }: { name: string }) {
  return <main className="screen">{name}</main>
}

function Shell() {
  const { loading, session } = useAuth()
  if (loading) {
    return (
      <main className="login">
        <div className="rings">💍</div>
        <h1 className="wordmark">Everafter</h1>
      </main>
    )
  }
  if (!session) return <Login />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Stub name="Home" />} />
        <Route path="/checklist" element={<Stub name="Checklist" />} />
        <Route path="/budget" element={<Stub name="Budget" />} />
        <Route path="/vendors" element={<Stub name="Vendors" />} />
        <Route path="/guests" element={<Stub name="Guests" />} />
        <Route path="/ideas" element={<Stub name="Ideas" />} />
        <Route path="/more" element={<Stub name="More" />} />
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
