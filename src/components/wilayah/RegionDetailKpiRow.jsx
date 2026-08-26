import { TrendingUp, Wallet, Landmark, ShieldCheck, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { formatNumberID, formatPercent, formatRupiahCompact } from '../../lib/format.js'
import { complianceStatusLabel } from '../../lib/complianceStatus.js'

// Single-region counterpart of KecamatanKpiRow/ComparisonKpiRow — same 5-card
// layout, but sourced from one row instead of a city-wide aggregate. There's
// no per-region "vs last month" delta computed anywhere yet, so this shows a
// ranking instead (cheap, meaningful context already available on the row).
export default function RegionDetailKpiRow({ row, totalCount, status }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <KpiCard
        icon={TrendingUp}
        color="blue"
        label="COLLECTION RATE"
        value={formatPercent(row.collectionRate, 2)}
        target={
          totalCount
            ? `Peringkat ${row.no} dari ${totalCount} · ${complianceStatusLabel(status)}`
            : complianceStatusLabel(status)
        }
      />
      <KpiCard
        icon={Wallet}
        color="green"
        label="PENERIMAAN PKB"
        value={`Rp ${formatRupiahCompact(row.penerimaanPkb, 2)}`}
      />
      <KpiCard
        icon={Landmark}
        color="purple"
        label="PENERIMAAN OPSEN PKB"
        value={`Rp ${formatRupiahCompact(row.opsenPkb, 2)}`}
      />
      <KpiCard
        icon={ShieldCheck}
        color="orange"
        label="PENERIMAAN SWDKLLJ"
        value={`Rp ${formatRupiahCompact(row.penerimaanSwdkllj, 2)}`}
      />
      <KpiCard
        icon={Car}
        color="cyan"
        label="JUMLAH KENDARAAN"
        value={`${formatNumberID(row.jumlahKendaraan)} unit`}
        footer={
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <div>
              Lunas :{' '}
              <span className="font-semibold text-navy-900 dark:text-white">
                {formatNumberID(row.sudahBayar)} unit
              </span>
            </div>
            <div>
              Belum Lunas :{' '}
              <span className="font-semibold text-navy-900 dark:text-white">
                {formatNumberID(row.belumBayar)} unit
              </span>
            </div>
            <div>
              Potensi Belum Bayar :{' '}
              <span className="font-semibold text-navy-900 dark:text-white">
                Rp {formatRupiahCompact(row.potensiBelumBayar, 2)}
              </span>
            </div>
          </div>
        }
      />
    </div>
  )
}
