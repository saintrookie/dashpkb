import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react'
import CityEmblem from '../components/brand/CityEmblem.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useDemoAccounts } from '../hooks/useUsers'

const validationSchema = Yup.object({
  identifier: Yup.string().trim().required('Username atau email wajib diisi'),
  password: Yup.string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
})

function SkylineIllustration() {
  return (
    <svg
      viewBox="0 0 238 140"
      className="w-full h-auto opacity-[0.16]"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <rect x="0" y="70" width="18" height="70" fill="#fff" />
      <rect x="20" y="50" width="14" height="90" fill="#fff" />
      <rect x="36" y="85" width="16" height="55" fill="#fff" />
      <rect x="56" y="35" width="12" height="105" fill="#fff" />
      <polygon points="62,15 68,35 56,35" fill="#fff" />
      <rect x="72" y="60" width="20" height="80" fill="#fff" />
      <rect x="96" y="20" width="10" height="120" fill="#fff" />
      <circle cx="101" cy="10" r="6" fill="#fff" />
      <rect x="110" y="75" width="18" height="65" fill="#fff" />
      <rect x="132" y="45" width="14" height="95" fill="#fff" />
      <rect x="150" y="65" width="22" height="75" fill="#fff" />
      <rect x="176" y="30" width="12" height="110" fill="#fff" />
      <polygon points="182,10 188,30 176,30" fill="#fff" />
      <rect x="192" y="80" width="16" height="60" fill="#fff" />
      <rect x="212" y="55" width="14" height="85" fill="#fff" />
      <rect x="228" y="90" width="10" height="50" fill="#fff" />
    </svg>
  )
}

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showDemoCreds, setShowDemoCreds] = useState(false)
  const { data: demoAccounts } = useDemoAccounts()

  const redirectTo = location.state?.from?.pathname ?? '/tingkat-kepatuhan-opd'

  const formik = useFormik({
    initialValues: { identifier: '', password: '', remember: true },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('')
      try {
        await login(values)
        navigate(redirectTo, { replace: true })
      } catch (err) {
        setAuthError(err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  function fillDemoUser(user) {
    formik.setValues({ identifier: user.username, password: user.password, remember: true })
    setAuthError('')
  }

  return (
    <div className="min-h-screen flex bg-surface-canvas dark:bg-navy-950">
      <div className="hidden lg:flex lg:w-[440px] shrink-0 bg-gradient-to-b from-navy-950 to-navy-900 text-white flex-col justify-between relative overflow-hidden">
        <div className="px-10 pt-12">
          <div className="flex items-center gap-3">
            <CityEmblem size={48} />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold tracking-wide text-slate-300">
                PEMERINTAH KOTA
              </div>
              <div className="text-[18px] font-bold tracking-wide text-white">
                PANGKALPINANG
              </div>
            </div>
          </div>

          <h1 className="text-[26px] font-extrabold leading-tight mt-14">
            Dashboard Kepatuhan
            <br />
            Pajak Kendaraan
          </h1>
          <p className="text-[13.5px] text-slate-400 mt-3 leading-relaxed max-w-xs">
            Monitoring kepatuhan pembayaran PKB, Opsen PKB &amp; SWDKLLJ secara
            terpusat untuk optimalisasi Pendapatan Asli Daerah.
          </p>

          <div className="flex items-center gap-2 mt-8 text-[12px] text-slate-300">
            <ShieldCheck size={16} className="text-brand-blue" />
            Akses aman &mdash; khusus pengguna terverifikasi
          </div>
        </div>

        <div className="relative">
          <SkylineIllustration />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <CityEmblem size={40} />
            <div className="leading-tight">
              <div className="text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                PEMERINTAH KOTA
              </div>
              <div className="text-[15px] font-bold tracking-wide text-navy-900 dark:text-white">
                PANGKALPINANG
              </div>
            </div>
          </div>

          <h2 className="text-[22px] font-extrabold text-navy-900 dark:text-white">Masuk</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 mb-7">
            Silakan masuk untuk mengakses Dashboard Kepatuhan OPD.
          </p>

          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-status-redBg dark:bg-status-red/15 border border-status-red/20 dark:border-status-red/30 text-status-red dark:text-red-400 rounded-lg px-3.5 py-2.5 text-[12.5px] mb-5"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5"
              >
                Username atau Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="admin atau admin@pangkalpinangkota.go.id"
                value={formik.values.identifier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={formik.touched.identifier && !!formik.errors.identifier}
                aria-describedby="identifier-error"
                className={`w-full rounded-lg border bg-white dark:bg-navy-800 px-3.5 py-2.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  formik.touched.identifier && formik.errors.identifier
                    ? 'border-status-red focus:ring-status-red/30'
                    : 'border-surface-border dark:border-white/10 focus:ring-brand-blue/40'
                }`}
              />
              {formik.touched.identifier && formik.errors.identifier && (
                <p id="identifier-error" className="text-[11.5px] text-status-red dark:text-red-400 mt-1.5">
                  {formik.errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12.5px] font-semibold text-navy-900 dark:text-slate-200 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.password && !!formik.errors.password}
                  aria-describedby="password-error"
                  className={`w-full rounded-lg border bg-white dark:bg-navy-800 px-3.5 py-2.5 pr-10 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                    formik.touched.password && formik.errors.password
                      ? 'border-status-red focus:ring-status-red/30'
                      : 'border-surface-border dark:border-white/10 focus:ring-brand-blue/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p id="password-error" className="text-[11.5px] text-status-red dark:text-red-400 mt-1.5">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-[12.5px] text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                name="remember"
                checked={formik.values.remember}
                onChange={formik.handleChange}
                className="w-3.5 h-3.5 rounded border-surface-border dark:border-white/20 text-brand-blue focus:ring-brand-blue/40"
              />
              Ingat saya
            </label>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue hover:bg-blue-700 text-white text-sm font-semibold py-2.5 mt-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-surface-border dark:border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowDemoCreds((v) => !v)}
              className="text-[12px] font-semibold text-brand-blue dark:text-blue-400 hover:underline"
            >
              {showDemoCreds ? 'Sembunyikan' : 'Lihat'} akun demo
            </button>

            {showDemoCreds && (
              <div className="mt-3 flex flex-col gap-2">
                {demoAccounts.map((user) => (
                  <button
                    key={user.username}
                    type="button"
                    onClick={() => fillDemoUser(user)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 px-3 py-2 text-left hover:border-brand-blue/40 dark:hover:border-brand-blue/40 hover:bg-blue-50/40 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>
                      <span className="block text-[12px] font-semibold text-navy-900 dark:text-white">
                        {user.name}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {user.username} &middot; {user.password}
                      </span>
                    </span>
                    <span className="text-[10.5px] font-semibold text-brand-blue dark:text-blue-300 bg-blue-50 dark:bg-brand-blue/20 rounded-full px-2.5 py-1 shrink-0">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
