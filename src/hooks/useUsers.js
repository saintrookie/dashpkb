import { useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'

export function useCurrentUser(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mockApi
      .getCurrentUser(id)
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError(res.message)
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data pengguna')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

export function useDemoAccounts() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    mockApi.getDemoAccounts().then((res) => {
      if (cancelled) return
      if (res.success) setData(res.data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}
