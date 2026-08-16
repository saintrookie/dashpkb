import { Lock } from 'lucide-react'
import PageHeader from '../layout/PageHeader.jsx'
import Card from '../ui/Card.jsx'
import { useAuthStore } from '../../store/authStore.js'

export default function RequirePermission({ permission, children }) {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  if (!hasPermission(permission)) {
    return (
      <>
        <PageHeader title="Akses Ditolak" subtitle="Anda tidak memiliki izin untuk membuka halaman ini" />
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[360px]">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-status-redBg dark:bg-status-red/15 text-status-red dark:text-red-400">
            <Lock size={22} strokeWidth={1.75} />
          </span>
          <h2 className="text-[15px] font-bold text-navy-900 dark:text-white">Akses Terbatas</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm">
            Peran Anda saat ini tidak memiliki izin untuk mengakses halaman ini. Hubungi
            administrator jika Anda memerlukan akses.
          </p>
        </Card>
      </>
    )
  }

  return children
}
