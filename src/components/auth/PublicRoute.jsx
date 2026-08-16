import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export default function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/tingkat-kepatuhan-opd" replace />
  }

  return children
}
