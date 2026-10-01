import { useRef, useState } from 'react'

/**
 * Double-submit guard for async handlers. `guard(fn)` returns a handler that
 * ignores calls while a previous one is still running — checked via a ref, so
 * a fast double-tap is blocked even before React re-renders the disabled
 * button. `busy` drives the disabled/"Working…" UI. Errors propagate (the
 * DataProvider has already toasted them), leaving the sheet open for a retry.
 */
export function useBusy() {
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  const guard =
    <A extends unknown[]>(fn: (...args: A) => Promise<void>) =>
    async (...args: A): Promise<void> => {
      if (running.current) return
      running.current = true
      setBusy(true)
      try {
        await fn(...args)
      } finally {
        running.current = false
        setBusy(false)
      }
    }

  return { busy, guard }
}
