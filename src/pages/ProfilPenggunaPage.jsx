import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { CheckCircle2, AlertCircle, Loader2, Mail, Building2, ShieldCheck, User as UserIcon } from 'lucide-react'
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

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Nama wajib diisi'),
  email: Yup.string().trim().email('Format email tidak valid').required('Email wajib diisi'),
  department: Yup.string().trim().required('OPD/Instansi wajib diisi'),
})

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
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      department: user?.department ?? '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setFormError('')
      setSaved(false)
      try {
        await updateProfile(values)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setFormError(err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

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
          <h3 className="text-[14px] font-bold text-navy-900 dark:text-white">Edit Informasi Profil</h3>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1">
            Perbarui informasi dasar akun Anda. Username dan peran akun tidak dapat diubah sendiri.
          </p>

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-status-redBg dark:bg-status-red/15 border border-status-red/20 dark:border-status-red/30 text-status-red dark:text-red-400 rounded-lg px-3.5 py-2.5 text-[12.5px] mt-5"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {saved && (
            <div
              role="status"
              className="flex items-start gap-2 bg-status-greenBg dark:bg-status-green/15 border border-status-green/20 dark:border-status-green/30 text-status-green dark:text-green-400 rounded-lg px-3.5 py-2.5 text-[12.5px] mt-5"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>Profil berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4 mt-5">
            <div>
              <label htmlFor="name" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={formik.touched.name && !!formik.errors.name}
                className={`w-full rounded-lg border bg-white dark:bg-navy-800 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  formik.touched.name && formik.errors.name
                    ? 'border-status-red focus:ring-status-red/30'
                    : 'border-surface-border dark:border-white/10 focus:ring-brand-blue/40'
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-[11.5px] text-status-red dark:text-red-400 mt-1.5">{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={formik.touched.email && !!formik.errors.email}
                className={`w-full rounded-lg border bg-white dark:bg-navy-800 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  formik.touched.email && formik.errors.email
                    ? 'border-status-red focus:ring-status-red/30'
                    : 'border-surface-border dark:border-white/10 focus:ring-brand-blue/40'
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[11.5px] text-status-red dark:text-red-400 mt-1.5">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5">
                OPD / Instansi
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={formik.touched.department && !!formik.errors.department}
                className={`w-full rounded-lg border bg-white dark:bg-navy-800 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  formik.touched.department && formik.errors.department
                    ? 'border-status-red focus:ring-status-red/30'
                    : 'border-surface-border dark:border-white/10 focus:ring-brand-blue/40'
                }`}
              />
              {formik.touched.department && formik.errors.department && (
                <p className="text-[11.5px] text-status-red dark:text-red-400 mt-1.5">{formik.errors.department}</p>
              )}
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="submit"
                disabled={formik.isSubmitting || !formik.dirty}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
