import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Rings from '../components/Rings'
import { deleteRow, fetchAll, insertRow, insertRows, updateRow } from './api'
import type { AllData } from './api'
import { useRealtime } from './useRealtime'

interface DataContextValue extends AllData {
  refresh: () => Promise<void>
  insert: typeof insertRow
  insertMany: typeof insertRows
  update: typeof updateRow
  remove: typeof deleteRow
  /** Run any async write with the same error toast + refresh as the helpers above. */
  run: <T>(work: () => Promise<T>) => Promise<T>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

const REALTIME_TABLES = [
  'wedding_tasks',
  'wedding_guests',
  'wedding_budget_items',
  'wedding_payments',
  'wedding_vendors',
  'wedding_settings',
  'wedding_gifts',
  'wedding_party_members',
  'wedding_songs',
  'wedding_honeymoon_items',
  'wedding_packing_items',
  'wedding_engagement_items',
  'wedding_tables',
  'wedding_ideas',
  'wedding_key_dates',
  'wedding_day_events',
]

// Realtime bursts (e.g. the other phone moving 90 task dates) collapse into one
// re-fetch after this quiet period.
const REALTIME_DEBOUNCE_MS = 300

// Errors already shown in the toast are tagged so the global
// unhandledrejection listener doesn't also log them as crashes — callers can
// `void save()` and still get a visible failure.
const REPORTED = Symbol('everafter.reported')

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
  return 'Something went wrong'
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState('')
  const loaded = useRef(false)
  const latestRequest = useRef(0)

  const refresh = useCallback(async () => {
    // Only the newest request may write state — an older, slower response
    // must not overwrite fresher data.
    const request = ++latestRequest.current
    try {
      const next = await fetchAll()
      if (request !== latestRequest.current) return
      loaded.current = true
      setData(next)
      setLoadError('')
    } catch (err) {
      if (request !== latestRequest.current) return
      // First load failing has nothing to show → full-screen retry. Later
      // failures keep the last good data on screen and just say so.
      if (loaded.current) setToast(`Couldn't refresh — ${messageOf(err)}`)
      else setLoadError(messageOf(err))
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scheduleRefresh = useCallback(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => void refresh(), REALTIME_DEBOUNCE_MS)
  }, [refresh])
  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  useRealtime(REALTIME_TABLES, scheduleRefresh)

  useEffect(() => {
    const onUnhandled = (e: PromiseRejectionEvent) => {
      if (e.reason && typeof e.reason === 'object' && REPORTED in e.reason) e.preventDefault()
    }
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => window.removeEventListener('unhandledrejection', onUnhandled)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 6000)
    return () => clearTimeout(t)
  }, [toast])

  // Every write: run it, re-fetch so this device updates instantly (realtime
  // covers the *other* device), and on failure show a toast then re-throw so
  // the caller's sheet stays open with the user's input intact.
  const run = useCallback(
    async <T,>(work: () => Promise<T>): Promise<T> => {
      try {
        const result = await work()
        await refresh()
        return result
      } catch (err) {
        setToast(`Couldn't save — ${messageOf(err)}`)
        if (err && typeof err === 'object') (err as Record<symbol, boolean>)[REPORTED] = true
        throw err
      }
    },
    [refresh],
  )

  const insert: typeof insertRow = (table, row) => run(() => insertRow(table, row))
  const insertMany: typeof insertRows = (table, rows) => run(() => insertRows(table, rows))
  const update: typeof updateRow = (table, id, patch) => run(() => updateRow(table, id, patch))
  const remove: typeof deleteRow = (table, id) => run(() => deleteRow(table, id))

  if (loadError) {
    return (
      <main className="login">
        <div className="rings">
          <Rings />
        </div>
        <p className="error">{loadError}</p>
        <button className="btn primary" onClick={() => void refresh()}>
          Retry
        </button>
      </main>
    )
  }
  if (!data) {
    return (
      <main className="login">
        <div className="rings">
          <Rings />
        </div>
        <h1 className="wordmark">Everafter</h1>
        <hr className="rule-ornament" />
        <p className="text-dim">Loading…</p>
      </main>
    )
  }

  return (
    <DataContext.Provider value={{ ...data, refresh, insert, insertMany, update, remove, run }}>
      {children}
      {toast && (
        <div className="toast" role="alert" onClick={() => setToast('')}>
          {toast}
        </div>
      )}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
