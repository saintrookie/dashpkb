import { useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'
import type { CurrentUser } from '../types/api'

interface UseCurrentUserResult {
  data: CurrentUser | null
  loading: boolean
  error: string | null
}

export function useCurrentUser(id?: string): UseCurrentUserResult {
  const [data, setData] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

interface DemoAccount {
  name: string
  username: string
  password: string
  role: string
}

interface UseDemoAccountsResult {
  data: DemoAccount[]
  loading: boolean
}

export function useDemoAccounts(): UseDemoAccountsResult {
  const [data, setData] = useState<DemoAccount[]>([])
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
