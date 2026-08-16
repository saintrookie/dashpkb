import { Building2, Landmark, Wallet, ChevronRight } from 'lucide-react'
import Badge from '../../ui/Badge.jsx'
import { useMapStore } from '../../../store/mapStore.js'
import { complianceStatusLabel } from '../../../lib/complianceStatus.js'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../../lib/format.js'

const ENTITY_META = {
  opd: { icon: Building2, label: 'OPD' },
  tax_service_point: { icon: Landmark, label: 'Layanan Pajak' },
  collection_point: { icon: Wallet, label: 'Titik Penagihan' },
}

const STATUS_LABEL = { active: 'Aktif', maintenance: 'Perbaikan', planned: 'Direncanakan', on_time: 'Tepat Waktu', late: 'Terlambat' }

function metricsFor(entity) {
  if (entity.entityType === 'opd') {
    return [
      { label: 'Kendaraan', value: formatNumberID(entity.metrics.vehicleCount) },
      { label: 'Collection Rate', value: formatPercent(entity.collectionRate) },
      { label: 'Belum Bayar', value: formatNumberID(entity.metrics.unpaidVehicleCount) },
      { label: 'Potensi Belum Bayar', value: formatRupiahAuto(entity.metrics.unpaidPotential) },
    ]
  }
  if (entity.entityType === 'tax_service_point') {
    return [
      { label: 'Layanan Hari Ini', value: formatNumberID(entity.metrics.servicesToday) },
      { label: 'Rata-rata Antre', value: `${entity.metrics.avgQueueMinutes} mnt` },
      { label: 'Transaksi/Bulan', value: formatNumberID(entity.metrics.monthlyTransactions) },
      { label: 'Pendapatan/Bulan', value: formatRupiahAuto(entity.metrics.monthlyRevenue) },
    ]
  }
  return [
    { label: 'Target Kendaraan', value: formatNumberID(entity.metrics.targetVehicles) },
    { label: 'Collection Rate', value: entity.collectionRate != null ? formatPercent(entity.collectionRate) : '-' },
    { label: 'Belum Bayar', value: formatNumberID(entity.metrics.unpaidVehicles) },
    { label: 'Realisasi', value: formatRupiahAuto(entity.metrics.revenueCollected) },
  ]
}

export default function EntityPopup({ entity }) {
  const selectEntity = useMapStore((s) => s.selectEntity)
  const meta = ENTITY_META[entity.entityType] ?? ENTITY_META.opd
  const Icon = meta.icon

  return (
    <div className="text-left">
      <div className="flex items-start gap-2.5 px-3.5 pt-3.5 pb-2.5">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0"
          style={{ backgroundColor: entity.color }}
        >
          <Icon size={15} strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
            {meta.label} &middot; {entity.kecamatan}
          </div>
          <div className="text-[12.5px] font-bold text-navy-900 dark:text-white leading-snug">{entity.name}</div>
        </div>
      </div>

      <div className="px-3.5 pb-2">
        {entity.complianceStatus ? (
          <Badge>{complianceStatusLabel(entity.complianceStatus)}</Badge>
        ) : (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
            {STATUS_LABEL[entity.status] ?? entity.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3.5 pb-3 border-b border-surface-border dark:border-white/10">
        {metricsFor(entity).map((m) => (
          <div key={m.label}>
            <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{m.label}</div>
            <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{m.value}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => selectEntity(entity.id, entity.entityType)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 text-[11.5px] font-semibold text-brand-blue hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        Lihat Detail
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
