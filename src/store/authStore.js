import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as mockApi from '../services/mockApi'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async ({ identifier, password }) => {
        const res = await mockApi.login({ identifier, password })
        if (!res.success) {
          throw new Error(res.message)
        }
        set({ user: res.data, isAuthenticated: true })
        return res.data
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        mockApi.logout()
      },

      updateProfile: async (updates) => {
        const currentUser = get().user
        const res = await mockApi.updateProfile(currentUser.id, updates)
        if (!res.success) {
          throw new Error(res.message)
        }
        set({ user: res.data })
        return res.data
      },

      hasPermission: (permission) => get().user?.permissions?.includes(permission) ?? false,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.id) mockApi.setSession(state.user.id)
      },
    },
  ),
)
