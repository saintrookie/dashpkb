import { TrendingUp, Wallet, Landmark, ShieldCheck, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'
import { formatNumberID, formatPercent, formatRupiahCompact, formatSignedPercent } from '../../lib/format.js'

function potensiFooter(label, value) {
  return (
    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
      <div>
        Potensi Belum Bayar {label} :{' '}
        <span className="font-semibold text-navy-900 dark:text-white">Rp {formatRupiahCompact(value, 2)}</span>
      </div>
    </div>
  )
}

export default function ComparisonKpiRow() {
  const { summary: s, summaryDelta: d } = useKecamatanData()
  const { opsenOnly } = useRevenueVisibility()

  return (
    <div className={`grid grid-cols-2 ${opsenOnly ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5'} gap-3 mb-4`}>
      <KpiCard
        icon={TrendingUp}
        color="blue"
        label="COLLECTION RATE (RATA-RATA)"
        value={formatPercent(s.collectionRate, 2)}
        target={`Target : ${formatPercent(s.collectionRateTarget, 2)}`}
        progress={(s.collectionRate / s.collectionRateTarget) * 100}
        delta={formatSignedPercent(d.collectionRate.deltaPercent)}
        deltaLabel="dari bulan lalu"
        negative={d.collectionRate.negative}
      />
      {!opsenOnly && (
        <KpiCard
          icon={Wallet}
          color="green"
          label="PENERIMAAN PKB"
          value={`Rp ${formatRupiahCompact(s.penerimaanPkb, 2)}`}
          target={`Target PKB : Rp ${formatRupiahCompact(s.penerimaanPkbTarget, 2)}`}
          progress={(s.penerimaanPkb / s.penerimaanPkbTarget) * 100}
          footer={potensiFooter('PKB', s.potensiBelumBayarPkb)}
        />
      )}
      <KpiCard
        icon={Landmark}
        color="purple"
        label="PENERIMAAN OPSEN PKB"
        value={`Rp ${formatRupiahCompact(s.opsenPkb, 2)}`}
        target={`Target Opsen PKB : Rp ${formatRupiahCompact(s.opsenPkbTarget, 2)}`}
        progress={(s.opsenPkb / s.opsenPkbTarget) * 100}
        footer={potensiFooter('Opsen PKB', s.potensiBelumBayarOpsen)}
      />
      {!opsenOnly && (
        <KpiCard
          icon={ShieldCheck}
          color="orange"
          label="PENERIMAAN SWDKLLJ"
          value={`Rp ${formatRupiahCompact(s.penerimaanSwdkllj, 2)}`}
          target={`Target SWDKLLJ : Rp ${formatRupiahCompact(s.penerimaanSwdklljTarget, 2)}`}
          progress={(s.penerimaanSwdkllj / s.penerimaanSwdklljTarget) * 100}
          footer={potensiFooter('SWDKLLJ', s.potensiBelumBayarSwdkllj)}
        />
      )}
      <KpiCard
        icon={Car}
        color="cyan"
        label="JUMLAH KENDARAAN"
        value={`${formatNumberID(s.totalKendaraan)} unit`}
        footer={
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <div>
              Lunas :{' '}
              <span className="font-semibold text-navy-900 dark:text-white">
                {formatNumberID(s.totalSudahBayar)} unit
              </span>
            </div>
            <div>
              Belum Lunas :{' '}
              <span className="font-semibold text-navy-900 dark:text-white">
                {formatNumberID(s.totalBelumBayar)} unit
              </span>
            </div>
          </div>
        }
      />
    </div>
  )
}
