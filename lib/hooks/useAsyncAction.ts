// lib/hooks/useAsyncAction.ts
import { useState, useCallback } from 'react'

export function useAsyncAction<T extends any[]>(
  action: (...args: T) => Promise<void>
) {
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (...args: T) => {
    setLoading(true)
    try {
      await action(...args)
    } finally {
      setLoading(false)
    }
  }, [action])

  return { run, loading }
}