import { useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'

export function useFilters() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    mockApi
      .getFilters()
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError(res.message)
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data filter')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
