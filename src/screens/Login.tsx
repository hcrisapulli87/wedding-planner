import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'

type Status = 'idle' | 'working' | 'error'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('working')
    setErrorMsg('')
    try {
      // On success, onAuthStateChange flips the app to the signed-in view.
      await signIn(email.trim(), password)
    } catch (err) {
      setErrorMsg(messageFor(err))
      setStatus('error')
    }
  }

  return (
    <main className="login">
      <div className="rings">💍</div>
      <h1 className="wordmark">Everafter</h1>
      <hr className="rule-ornament" />
      <p className="text-dim">Our wedding, planned together.</p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="btn primary block"
          type="submit"
          disabled={status === 'working' || !email || !password}
        >
          {status === 'working' ? 'Signing in…' : 'Sign in'}
        </button>
        {status === 'error' && <p className="error">{errorMsg}</p>}
      </form>
    </main>
  )
}

function messageFor(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Something went wrong'
  if (/invalid login credentials/i.test(msg)) return 'Email or password is incorrect.'
  if (/email not confirmed/i.test(msg))
    return 'That account isn’t confirmed yet — confirm it in the Supabase dashboard.'
  if (/rate/i.test(msg)) return 'Too many attempts for now — wait a moment and try again.'
  return msg
}
