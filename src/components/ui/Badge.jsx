const VARIANTS = {
  'Sangat Baik': 'bg-status-greenBg text-status-green dark:bg-status-green/15 dark:text-green-400',
  Baik: 'bg-status-yellowBg text-yellow-700 dark:bg-status-yellow/15 dark:text-yellow-400',
  Cukup: 'bg-status-orangeBg text-status-orange dark:bg-status-orange/15 dark:text-orange-400',
  Rendah: 'bg-status-redBg text-status-red dark:bg-status-red/15 dark:text-red-400',
  'Sangat Rendah': 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400',
  Lunas: 'bg-status-greenBg text-status-green dark:bg-status-green/15 dark:text-green-400',
  'Belum Lunas': 'bg-status-redBg text-status-red dark:bg-status-red/15 dark:text-red-400',
  Berhasil: 'bg-status-greenBg text-status-green dark:bg-status-green/15 dark:text-green-400',
  Gagal: 'bg-status-redBg text-status-red dark:bg-status-red/15 dark:text-red-400',
}

export default function Badge({ children }) {
  const cls = VARIANTS[children] || 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  )
}
