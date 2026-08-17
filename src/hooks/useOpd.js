import { useCallback, useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'

export function useOpd(params = {}) {
  const { page, perPage, search, sortBy, sortDirection, status, reportingStatus, kecamatan } = params
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mockApi
      .getOpd({ page, perPage, search, sortBy, sortDirection, status, reportingStatus, kecamatan })
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError(res.message)
          setData([])
          setMeta(null)
          return
        }
        setData(res.data)
        setMeta(res.meta)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data OPD')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, perPage, search, sortBy, sortDirection, status, reportingStatus, kecamatan, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { data, meta, loading, error, refetch }
}
