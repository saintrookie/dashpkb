import { TrendingUp, Wallet, Landmark, AlertTriangle, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { kecamatanSummary } from '../../data/kecamatan.js'
import { formatNumberID, formatPercent, formatRupiahCompact } from '../../lib/format.js'

export default function ComparisonKpiRow() {
  const s = kecamatanSummary

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <KpiCard
        icon={TrendingUp}
        color="blue"
        label="COLLECTION RATE (RATA-RATA)"
        value={formatPercent(s.collectionRate, 2)}
        target={`Target : ${formatPercent(s.collectionRateTarget, 2)}`}
        progress={(s.collectionRate / s.collectionRateTarget) * 100}
        delta="+2,35%"
        deltaLabel="dari bulan lalu"
        negative={false}
      />
      <KpiCard
        icon={Wallet}
        color="green"
        label="PENERIMAAN PKB"
        value={`Rp ${formatRupiahCompact(s.penerimaanPkb, 2)}`}
        target={`Target : Rp ${formatRupiahCompact(s.penerimaanPkbTarget, 2)}`}
        progress={(s.penerimaanPkb / s.penerimaanPkbTarget) * 100}
        delta="+4,16%"
        deltaLabel="dari bulan lalu"
        negative={false}
      />
      <KpiCard
        icon={Landmark}
        color="purple"
        label="OPSEN PKB DITERIMA"
        value={`Rp ${formatRupiahCompact(s.opsenPkb, 2)}`}
        target={`Target : Rp ${formatRupiahCompact(s.opsenPkbTarget, 2)}`}
        progress={(s.opsenPkb / s.opsenPkbTarget) * 100}
        delta="+4,03%"
        deltaLabel="dari bulan lalu"
        negative={false}
      />
      <KpiCard
        icon={AlertTriangle}
        color="orange"
        label="POTENSI BELUM BAYAR"
        value={`Rp ${formatRupiahCompact(s.potensiBelumBayar, 2)}`}
        target={`${formatNumberID(s.totalBelumBayar)} kendaraan`}
        delta="-1,92%"
        deltaLabel="dari bulan lalu"
        negative
      />
      <KpiCard
        icon={Car}
        color="cyan"
        label="JUMLAH KENDARAAN"
        value={`${formatNumberID(s.totalKendaraan)} unit`}
        footer={
          <div className="text-[11px] text-slate-500 leading-relaxed">
            <div>
              Lunas : <span className="font-semibold text-navy-900">{formatNumberID(s.totalSudahBayar)} unit</span>
            </div>
            <div>
              Belum Lunas :{' '}
              <span className="font-semibold text-navy-900">{formatNumberID(s.totalBelumBayar)} unit</span>
            </div>
          </div>
        }
      />
    </div>
  )
}
