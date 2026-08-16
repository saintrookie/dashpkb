import { create } from 'zustand'
import * as mockApi from '../services/mockApi'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    if (get().loading || get().notifications.length > 0) return
    set({ loading: true, error: null })
    const res = await mockApi.getNotifications()
    if (!res.success) {
      set({ loading: false, error: res.message })
      return
    }
    set({ notifications: res.data, loading: false })
  },

  markAsRead: async (id) => {
    const res = await mockApi.markNotificationAsRead(id)
    if (res.success) {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }))
    }
  },

  markAllAsRead: async () => {
    const res = await mockApi.markAllNotificationsAsRead()
    if (res.success) {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }))
    }
  },
}))
