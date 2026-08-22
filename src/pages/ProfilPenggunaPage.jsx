import { Mail, Building2, ShieldCheck, User as UserIcon } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuthStore } from '../store/authStore.js'
import { getInitials } from '../lib/initials.js'

const PERMISSION_LABELS = {
  view: 'Lihat Data',
  export: 'Unduh Laporan',
  'manage-users': 'Kelola Pengguna',
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 shrink-0">
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <span className="block text-[13px] font-medium text-navy-900 dark:text-white truncate">{value}</span>
      </span>
    </div>
  )
}

export default function ProfilPenggunaPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <>
      <PageHeader title="Profil Pengguna" subtitle="Kelola informasi profil akun Anda" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
        <Card className="lg:col-span-1 p-6 flex flex-col items-center text-center">
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-brand-blue text-white text-[22px] font-bold shrink-0">
            {getInitials(user.name)}
          </span>
          <h2 className="mt-4 text-[16px] font-bold text-navy-900 dark:text-white">{user.name}</h2>
          <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-0.5">@{user.username}</p>
          <div className="mt-3">
            <Badge>{user.role}</Badge>
          </div>

          <div className="w-full flex flex-col gap-3.5 mt-6 pt-6 border-t border-surface-border dark:border-white/10 text-left">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Building2} label="OPD / Instansi" value={user.department} />
            <InfoRow icon={UserIcon} label="Peran" value={user.role} />
          </div>

          {user.permissions?.length > 0 && (
            <div className="w-full mt-6 pt-6 border-t border-surface-border dark:border-white/10 text-left">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2.5">
                <ShieldCheck size={13} strokeWidth={2} />
                Hak Akses
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  >
                    {PERMISSION_LABELS[permission] ?? permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h3 className="text-[14px] font-bold text-navy-900 dark:text-white">Informasi Profil</h3>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1">
            Informasi akun ditampilkan sebagai referensi dan tidak dapat diubah sendiri.
          </p>

          <div className="flex flex-col gap-4 mt-5">
            <div>
              <label htmlFor="name" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={user.name}
                disabled
                readOnly
                className="w-full rounded-lg border border-surface-border dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                disabled
                readOnly
                className="w-full rounded-lg border border-surface-border dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                OPD / Instansi
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={user.department}
                disabled
                readOnly
                className="w-full rounded-lg border border-surface-border dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue text-white text-sm font-semibold px-5 py-2.5 opacity-50 cursor-not-allowed"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
