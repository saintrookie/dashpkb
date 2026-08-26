import { TrendingUp, Wallet, Landmark, ShieldCheck, Car, ArrowUp, ArrowDown } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'
import { formatNumberID, formatPercent, formatRupiahCompact, formatSignedPercent } from '../../lib/format.js'

function potensiFooter(label, value, delta) {
  const isUp = delta.deltaPercent >= 0
  return (
    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span>
          Potensi Belum Bayar {label} :{' '}
          <span className="font-semibold text-navy-900 dark:text-white">Rp {formatRupiahCompact(value, 2)}</span>
        </span>
        <span
          className={`inline-flex items-center gap-0.5 font-semibold ${
            isUp ? 'text-status-green' : 'text-status-red'
          }`}
        >
          {isUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {formatPercent(Math.abs(delta.deltaPercent), 2)}
        </span>
      </div>
    </div>
  )
}

export default function KecamatanKpiRow() {
  const { summary: s, summaryDelta: d } = useKecamatanData()
  const { opsenOnly } = useRevenueVisibility()

  return (
    <div className={`grid grid-cols-2 ${opsenOnly ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5'} gap-3 mb-4`}>
      <KpiCard
        icon={TrendingUp}
        color="blue"
        label="COLLECTION RATE"
        value={formatPercent(s.collectionRate, 2)}
        target={`Target : ${formatPercent(s.collectionRateTarget, 2)}`}
        delta={formatSignedPercent(d.collectionRate.deltaPercent)}
        deltaLabel="dari bulan lalu"
      />
      {!opsenOnly && (
        <KpiCard
          icon={Wallet}
          color="green"
          label="PENERIMAAN PKB"
          value={`Rp ${formatRupiahCompact(s.penerimaanPkb, 2)}`}
          target={`Target PKB : Rp ${formatRupiahCompact(s.penerimaanPkbTarget, 2)}`}
          footer={potensiFooter('PKB', s.potensiBelumBayarPkb, d.potensiBelumBayarPkb)}
        />
      )}
      <KpiCard
        icon={Landmark}
        color="purple"
        label="PENERIMAAN OPSEN PKB"
        value={`Rp ${formatRupiahCompact(s.opsenPkb, 2)}`}
        target={`Target Opsen PKB : Rp ${formatRupiahCompact(s.opsenPkbTarget, 2)}`}
        footer={potensiFooter('Opsen PKB', s.potensiBelumBayarOpsen, d.potensiBelumBayarOpsen)}
      />
      {!opsenOnly && (
        <KpiCard
          icon={ShieldCheck}
          color="orange"
          label="PENERIMAAN SWDKLLJ"
          value={`Rp ${formatRupiahCompact(s.penerimaanSwdkllj, 2)}`}
          target={`Target SWDKLLJ : Rp ${formatRupiahCompact(s.penerimaanSwdklljTarget, 2)}`}
          footer={potensiFooter('SWDKLLJ', s.potensiBelumBayarSwdkllj, d.potensiBelumBayarSwdkllj)}
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
