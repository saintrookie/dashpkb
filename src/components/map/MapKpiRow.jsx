import { TrendingUp, Wallet, Car, AlertTriangle, Landmark } from 'lucide-react'
import KpiCard from '../kpi/KpiCard.jsx'
import KpiRowSkeleton from '../kpi/KpiRowSkeleton.jsx'
import { useMapStore } from '../../store/mapStore.js'
import { useMapEntityDetail } from '../../hooks/useMapData.js'
import { kecamatanSummary } from '../../data/kecamatan.js'
import { formatNumberID, formatPercent, formatRupiahCompact } from '../../lib/format.js'

function summaryFromCityWide() {
  const s = kecamatanSummary
  return {
    scopeLabel: 'SELURUH KOTA PANGKALPINANG',
    collectionRate: s.collectionRate,
    vehicleCount: s.totalKendaraan,
    unpaidCount: s.totalBelumBayar,
    revenue: s.penerimaanPkb,
    unpaidPotential: s.potensiBelumBayar,
  }
}

function summaryFromEntity(type, data) {
  if (type === 'opd') {
    return {
      scopeLabel: data.name,
      collectionRate: data.collectionRate,
      vehicleCount: data.vehicleCount,
      unpaidCount: data.unpaidVehicleCount,
      revenue: data.payment.pkb + data.payment.opsenPkb,
      unpaidPotential: data.unpaidPotential,
    }
  }
  if (type === 'collection_point') {
    return {
      scopeLabel: data.name,
      collectionRate: data.collectionRate,
      vehicleCount: data.targetVehicles,
      unpaidCount: data.unpaidVehicles,
      revenue: data.revenueCollected,
      unpaidPotential: null,
    }
  }
  if (type === 'tax_service_point') {
    return {
      scopeLabel: data.name,
      collectionRate: null,
      vehicleCount: data.monthlyTransactions,
      unpaidCount: null,
      revenue: data.monthlyRevenue,
      unpaidPotential: null,
    }
  }
  // kecamatan / kelurahan
  const stats = data.stats
  return {
    scopeLabel: data.name,
    collectionRate: stats?.collectionRate ?? 0,
    vehicleCount: stats?.jumlahKendaraan ?? 0,
    unpaidCount: stats?.belumBayar ?? 0,
    revenue: stats?.penerimaanPkb ?? 0,
    unpaidPotential: stats?.potensiBelumBayar ?? 0,
  }
}

export default function MapKpiRow() {
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectedEntityType = useMapStore((s) => s.selectedEntityType)
  const { data, loading } = useMapEntityDetail(selectedEntityId, selectedEntityType)

  if (selectedEntityId && (loading || !data)) return <KpiRowSkeleton />

  const summary = selectedEntityId ? summaryFromEntity(selectedEntityType, data) : summaryFromCityWide()

  return (
    <div className="mb-1">
      <p className="text-[10.5px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase mb-2">
        {summary.scopeLabel}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <KpiCard
          icon={TrendingUp}
          color="blue"
          label="COLLECTION RATE"
          value={summary.collectionRate != null ? formatPercent(summary.collectionRate) : '-'}
        />
        <KpiCard icon={Car} color="cyan" label="JUMLAH KENDARAAN" value={`${formatNumberID(summary.vehicleCount)} unit`} />
        <KpiCard
          icon={AlertTriangle}
          color="orange"
          label="BELUM BAYAR"
          value={summary.unpaidCount != null ? `${formatNumberID(summary.unpaidCount)} unit` : '-'}
        />
        <KpiCard icon={Wallet} color="green" label="PENERIMAAN / REALISASI" value={`Rp ${formatRupiahCompact(summary.revenue, 2)}`} />
        <KpiCard
          icon={Landmark}
          color="purple"
          label="POTENSI BELUM BAYAR"
          value={summary.unpaidPotential != null ? `Rp ${formatRupiahCompact(summary.unpaidPotential, 2)}` : '-'}
        />
      </div>
    </div>
  )
}
