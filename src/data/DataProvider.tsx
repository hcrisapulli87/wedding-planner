import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { deleteRow, fetchAll, insertRow, updateRow } from './api'
import type { AllData } from './api'
import { useRealtime } from './useRealtime'

interface DataContextValue extends AllData {
  refresh: () => Promise<void>
  insert: typeof insertRow
  update: typeof updateRow
  remove: typeof deleteRow
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

const REALTIME_TABLES = [
  'wedding_tasks',
  'wedding_guests',
  'wedding_budget_items',
  'wedding_payments',
  'wedding_vendors',
  'wedding_settings',
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData | null>(null)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setData(await fetchAll())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useRealtime(REALTIME_TABLES, refresh)

  // Mutations go through the thin api helpers, then re-fetch. Realtime also
  // fires for the *other* device; the explicit refresh keeps this one instant.
  const insert: typeof insertRow = async (table, row) => {
    const created = await insertRow(table, row)
    await refresh()
    return created
  }
  const update: typeof updateRow = async (table, id, patch) => {
    await updateRow(table, id, patch)
    await refresh()
  }
  const remove: typeof deleteRow = async (table, id) => {
    await deleteRow(table, id)
    await refresh()
  }

  if (error) {
    return (
      <main className="login">
        <div className="rings">💍</div>
        <p className="error">{error}</p>
        <button className="btn primary" onClick={() => void refresh()}>
          Retry
        </button>
      </main>
    )
  }
  if (!data) {
    return (
      <main className="login">
        <div className="rings">💍</div>
        <h1 className="wordmark">Everafter</h1>
        <p className="text-dim">Loading…</p>
      </main>
    )
  }

  return (
    <DataContext.Provider value={{ ...data, refresh, insert, update, remove }}>
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
