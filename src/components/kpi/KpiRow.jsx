import { TrendingUp, Wallet, Landmark, AlertTriangle, Users } from 'lucide-react'
import KpiCard from './KpiCard.jsx'
import KpiRowSkeleton from './KpiRowSkeleton.jsx'
import { formatPercent, formatRupiahCompact } from '../../lib/format.js'

const CARDS = [
  {
    key: 'avgCollectionRate',
    icon: TrendingUp,
    color: 'blue',
    label: 'RATA-RATA COLLECTION RATE OPD',
    deltaLabel: 'dari target',
    formatValue: (v) => formatPercent(v, 2),
    formatTarget: (t) => `Target Minimal ${formatPercent(t, 0)}`,
  },
  {
    key: 'totalPkb',
    icon: Wallet,
    color: 'green',
    label: 'TOTAL PENERIMAAN PKB OPD',
    deltaLabel: 'dari target',
    formatValue: (v) => `Rp ${formatRupiahCompact(v, 2)}`,
    formatTarget: (t) => `Target Rp ${formatRupiahCompact(t, 2)}`,
  },
  {
    key: 'totalOpsen',
    icon: Landmark,
    color: 'purple',
    label: 'TOTAL OPSEN PKB OPD',
    deltaLabel: 'dari target',
    formatValue: (v) => `Rp ${formatRupiahCompact(v, 2)}`,
    formatTarget: (t) => `Target Rp ${formatRupiahCompact(t, 2)}`,
  },
  {
    key: 'unpaidPotential',
    icon: AlertTriangle,
    color: 'orange',
    label: 'POTENSI BELUM BAYAR OPD',
    deltaLabel: 'dari target',
    formatValue: (v) => `Rp ${formatRupiahCompact(v, 2)}`,
    formatTarget: (t) => `Target < Rp ${formatRupiahCompact(t, 2)}`,
  },
  {
    key: 'onTimeReporting',
    icon: Users,
    color: 'cyan',
    label: 'OPD TEPAT WAKTU LAPOR',
    deltaLabel: 'dari total',
    formatValue: (v) => `${v} OPD`,
    formatTarget: (_t, kpi) => `Total OPD ${kpi.total}`,
  },
]

export default function KpiRow({ data, loading, error }) {
  if (loading) return <KpiRowSkeleton />

  if (error || !data) {
    return (
      <div className="mb-4 rounded-card border border-status-red/20 bg-status-redBg dark:bg-status-red/10 px-4 py-3 text-[12.5px] text-status-red dark:text-red-400">
        {error ?? 'Gagal memuat data KPI.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {CARDS.map(({ key, icon, color, label, deltaLabel, formatValue, formatTarget }) => {
        const kpi = data.kpi[key]
        const sign = kpi.deltaPercent >= 0 ? '+' : '-'
        const delta = `${sign}${formatPercent(Math.abs(kpi.deltaPercent), 2)}`
        return (
          <KpiCard
            key={key}
            icon={icon}
            color={color}
            label={label}
            value={formatValue(kpi.value)}
            target={formatTarget(kpi.target, kpi)}
            delta={delta}
            deltaLabel={deltaLabel}
            negative={kpi.negative}
          />
        )
      })}
    </div>
  )
}
