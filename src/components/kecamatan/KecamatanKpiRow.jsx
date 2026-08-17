import { TrendingUp, Wallet, Landmark, AlertTriangle, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { formatNumberID, formatPercent, formatRupiahCompact } from '../../lib/format.js'

export default function KecamatanKpiRow() {
  const { summary: s } = useKecamatanData()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <KpiCard
        icon={TrendingUp}
        color="blue"
        label="COLLECTION RATE (PKB)"
        value={formatPercent(s.collectionRate, 2)}
        target={`Target : ${formatPercent(s.collectionRateTarget, 2)}`}
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
