import { Car, CheckCircle2, AlertTriangle, Coins, BadgePercent, ShieldCheck } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../lib/format.js'

export default function KendaraanKpiRow({ summary }) {
  const s = summary
  const { opsenOnly } = useRevenueVisibility()

  return (
    <div
      className={`grid grid-cols-2 ${opsenOnly ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3 lg:grid-cols-6'} gap-3 mb-4`}
    >
      <KpiCard
        icon={Car}
        color="blue"
        label="TOTAL KENDARAAN"
        value={`${formatNumberID(s.total)} unit`}
        target="100% dari total wilayah"
      />
      <KpiCard
        icon={CheckCircle2}
        color="green"
        label="LUNAS"
        value={`${formatNumberID(s.lunas)} unit`}
        target={formatPercent(s.lunasPercent)}
      />
      <KpiCard
        icon={AlertTriangle}
        color="orange"
        label="BELUM LUNAS"
        value={`${formatNumberID(s.belumLunas)} unit`}
        target={formatPercent(s.belumLunasPercent)}
      />
      {!opsenOnly && (
        <KpiCard
          icon={Coins}
          color="purple"
          label="POTENSI PKB"
          value={formatRupiahAuto(s.potensiPkb)}
          target="dari PKB"
        />
      )}
      <KpiCard
        icon={BadgePercent}
        color="purple"
        label="POTENSI OPSEN PKB"
        value={formatRupiahAuto(s.potensiOpsenPkb)}
        target="dari Opsen PKB"
      />
      <KpiCard
        icon={ShieldCheck}
        color="cyan"
        label="TOTAL POTENSI"
        value={formatRupiahAuto(s.totalPotensi)}
        target="dari seluruh komponen"
      />
    </div>
  )
}
