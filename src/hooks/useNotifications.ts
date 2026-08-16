import { useCallback, useEffect, useState } from 'react'
import * as mockApi from '../services/mockApi'
import type { AppNotification, NotificationQueryParams } from '../types/api'

interface UseNotificationsResult {
  data: AppNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refetch: () => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications(params: NotificationQueryParams = {}): UseNotificationsResult {
  const { page, perPage, isRead, type } = params
  const [data, setData] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mockApi
      .getNotifications({ page, perPage, isRead, type })
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError(res.message)
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, perPage, isRead, type, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  const markAsRead = useCallback(async (id: string) => {
    const res = await mockApi.markNotificationAsRead(id)
    if (res.success) {
      setData((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const res = await mockApi.markAllNotificationsAsRead()
    if (res.success) {
      setData((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
  }, [])

  const unreadCount = data.filter((n) => !n.isRead).length

  return { data, unreadCount, loading, error, refetch, markAsRead, markAllAsRead }
}
