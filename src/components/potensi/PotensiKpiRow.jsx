import { DollarSign, Wallet, Landmark, Users, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'
import { formatNumberID, formatPercent, formatRupiahAuto, formatRupiahFull, formatSignedPercent } from '../../lib/format.js'

export default function PotensiKpiRow({ summary, delta }) {
  const s = summary
  const d = delta
  const { opsenOnly } = useRevenueVisibility()

  return (
    <div className={`grid grid-cols-2 ${opsenOnly ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5'} gap-3 mb-4`}>
      <KpiCard
        icon={DollarSign}
        color="blue"
        label="TOTAL POTENSI"
        value={formatRupiahAuto(s.totalPotensi)}
        target={`${formatNumberID(s.total)} kendaraan`}
        delta={formatSignedPercent(d.totalPotensi.deltaPercent)}
        deltaLabel="dari bulan lalu"
        negative={d.totalPotensi.negative}
      />
      {!opsenOnly && (
        <KpiCard
          icon={Wallet}
          color="green"
          label="POTENSI PKB"
          value={formatRupiahAuto(s.potensiPkb)}
          target={`${formatPercent(s.potensiPkbPercent)} dari total potensi`}
          delta={formatSignedPercent(d.potensiPkb.deltaPercent)}
          deltaLabel="dari bulan lalu"
          negative={d.potensiPkb.negative}
        />
      )}
      <KpiCard
        icon={Landmark}
        color="purple"
        label="POTENSI OPSEN PKB"
        value={formatRupiahAuto(s.potensiOpsenPkb)}
        target={`${formatPercent(s.potensiOpsenPkbPercent)} dari total potensi`}
        delta={formatSignedPercent(d.potensiOpsenPkb.deltaPercent)}
        deltaLabel="dari bulan lalu"
        negative={d.potensiOpsenPkb.negative}
      />
      {!opsenOnly && (
        <KpiCard
          icon={Users}
          color="orange"
          label="POTENSI SWDKLLJ"
          value={formatRupiahAuto(s.potensiSwdkllj)}
          target={`${formatPercent(s.potensiSwdklljPercent)} dari total potensi`}
          delta={formatSignedPercent(d.potensiSwdkllj.deltaPercent)}
          deltaLabel="dari bulan lalu"
          negative={d.potensiSwdkllj.negative}
        />
      )}
      <KpiCard
        icon={Car}
        color="cyan"
        label="RATA-RATA TUNGGAKAN PER KENDARAAN"
        value={formatRupiahFull(s.avgPotensiPerKendaraan)}
        delta={formatSignedPercent(d.avgPotensiPerKendaraan.deltaPercent)}
        deltaLabel="dari bulan lalu"
        negative={d.avgPotensiPerKendaraan.negative}
      />
    </div>
  )
}
