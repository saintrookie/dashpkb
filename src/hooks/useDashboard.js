import { useCallback, useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'

export function useDashboard(params = {}) {
  const { taxYear, periodId } = params
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mockApi
      .getDashboard({ taxYear, periodId })
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError(res.message)
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [taxYear, periodId, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { data, loading, error, refetch }
}
