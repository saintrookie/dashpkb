import { DollarSign, Wallet, Landmark, Users, Car } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import { formatNumberID, formatPercent, formatRupiahAuto, formatRupiahFull } from '../../lib/format.js'

export default function PotensiKpiRow({ summary }) {
  const s = summary

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <KpiCard
        icon={DollarSign}
        color="blue"
        label="TOTAL POTENSI"
        value={formatRupiahAuto(s.totalPotensi)}
        target={`${formatNumberID(s.total)} kendaraan`}
        delta="-1,92%"
        deltaLabel="dari bulan lalu"
        negative
      />
      <KpiCard
        icon={Wallet}
        color="green"
        label="POTENSI PKB"
        value={formatRupiahAuto(s.potensiPkb)}
        target={`${formatPercent(s.potensiPkbPercent)} dari total potensi`}
        delta="-1,75%"
        deltaLabel="dari bulan lalu"
        negative
      />
      <KpiCard
        icon={Landmark}
        color="purple"
        label="POTENSI OPSEN PKB"
        value={formatRupiahAuto(s.potensiOpsenPkb)}
        target={`${formatPercent(s.potensiOpsenPkbPercent)} dari total potensi`}
        delta="-2,08%"
        deltaLabel="dari bulan lalu"
        negative
      />
      <KpiCard
        icon={Users}
        color="orange"
        label="POTENSI SWDKLLJ"
        value={formatRupiahAuto(s.potensiSwdkllj)}
        target={`${formatPercent(s.potensiSwdklljPercent)} dari total potensi`}
        delta="-1,63%"
        deltaLabel="dari bulan lalu"
        negative
      />
      <KpiCard
        icon={Car}
        color="cyan"
        label="RATA-RATA TUNGGAKAN PER KENDARAAN"
        value={formatRupiahFull(s.avgPotensiPerKendaraan)}
        delta="-0,87%"
        deltaLabel="dari bulan lalu"
        negative
      />
    </div>
  )
}
