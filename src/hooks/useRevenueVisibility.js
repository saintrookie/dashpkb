import { useAuthStore } from '../store/authStore.js'

// User role (any non-Admin login) only ever sees the Opsen PKB slice of
// revenue — PKB and SWDKLLJ figures/charts/columns are hidden app-wide.
// Collection Rate and vehicle-count figures aren't "pendapatan" (revenue),
// so they stay visible for everyone regardless of this flag.
export function useRevenueVisibility() {
  const role = useAuthStore((s) => s.user?.role)
  return { opsenOnly: role != null && role !== 'Admin', role }
}
