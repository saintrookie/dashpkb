import { create } from 'zustand'

// Lets PageHeader (which knows the real, page-specific title) inform the
// mobile sticky top bar in DashboardLayout, instead of DashboardLayout
// guessing the title from a route lookup that misses any page outside the
// main nav (profile, settings, notifications, help, ...).
export const usePageTitleStore = create((set) => ({
  title: '',
  setTitle: (title) => set({ title }),
}))
