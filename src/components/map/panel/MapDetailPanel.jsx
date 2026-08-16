import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { X, Building2, Landmark, Wallet, MapPinned, ArrowRight } from 'lucide-react'
import Badge from '../../ui/Badge.jsx'
import { useMapStore } from '../../../store/mapStore.js'
import { useMapEntityDetail } from '../../../hooks/useMapData.js'
import { useTheme } from '../../../hooks/useTheme.js'
import { getChartTheme } from '../../../lib/chartTheme.js'
import { complianceStatusLabel } from '../../../lib/complianceStatus.js'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../../lib/format.js'
import { colorForRate, colorForEntityStatus, bandForRate } from '../../../lib/mapMetrics.js'
import { kelurahanByKecamatan } from '../../../data/kelurahan.js'

const ENTITY_META = {
  opd: { icon: Building2, label: 'OPD', routeTo: '/tingkat-kepatuhan-opd' },
  tax_service_point: { icon: Landmark, label: 'Layanan Pajak', routeTo: null },
  collection_point: { icon: Wallet, label: 'Titik Penagihan', routeTo: null },
  kecamatan: { icon: MapPinned, label: 'Kecamatan', routeTo: '/ringkasan-kecamatan' },
  kelurahan: { icon: MapPinned, label: 'Kelurahan', routeTo: '/ringkasan-kecamatan' },
}

const STATUS_LABEL = { active: 'Aktif', maintenance: 'Perbaikan', planned: 'Direncanakan' }

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-white/5 px-2.5 py-2">
      <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-[13px] font-bold text-navy-900 dark:text-white mt-0.5">{value}</div>
    </div>
  )
}

function buildKpis(type, data) {
  if (type === 'opd') {
    return [
      { label: 'Kendaraan', value: formatNumberID(data.vehicleCount) },
      { label: 'Collection Rate', value: formatPercent(data.collectionRate) },
      { label: 'Belum Bayar', value: formatNumberID(data.unpaidVehicleCount) },
      { label: 'Potensi Belum Bayar', value: formatRupiahAuto(data.unpaidPotential) },
    ]
  }
  if (type === 'tax_service_point') {
    return [
      { label: 'Layanan Hari Ini', value: formatNumberID(data.servicesToday) },
      { label: 'Rata-rata Antre', value: `${data.avgQueueMinutes} mnt` },
      { label: 'Transaksi/Bulan', value: formatNumberID(data.monthlyTransactions) },
      { label: 'Pendapatan/Bulan', value: formatRupiahAuto(data.monthlyRevenue) },
    ]
  }
  if (type === 'collection_point') {
    return [
      { label: 'Target Kendaraan', value: formatNumberID(data.targetVehicles) },
      { label: 'Collection Rate', value: formatPercent(data.collectionRate) },
      { label: 'Belum Bayar', value: formatNumberID(data.unpaidVehicles) },
      { label: 'Realisasi', value: formatRupiahAuto(data.revenueCollected) },
    ]
  }
  // kecamatan / kelurahan region
  const stats = data.stats
  return [
    { label: 'Jumlah Kendaraan', value: formatNumberID(stats?.jumlahKendaraan ?? 0) },
    { label: 'Collection Rate', value: formatPercent(stats?.collectionRate ?? 0) },
    { label: 'Belum Bayar', value: formatNumberID(stats?.belumBayar ?? 0) },
    { label: 'Penerimaan PKB', value: formatRupiahAuto(stats?.penerimaanPkb ?? 0) },
  ]
}

function PaidUnpaidChart({ paid, unpaid, isDark }) {
  const ct = getChartTheme(isDark)
  const chartData = [
    { label: 'Sudah Bayar', value: paid, fill: '#16a34a' },
    { label: 'Belum Bayar', value: unpaid, fill: '#e0332f' },
  ]
  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={ct.grid} />
        <XAxis type="number" tick={{ fontSize: 10, fill: ct.axisText }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 10.5, fill: ct.categoryText }} axisLine={false} tickLine={false} width={72} />
        <Tooltip
          cursor={{ fill: ct.cursorFill }}
          formatter={(v) => formatNumberID(v)}
          contentStyle={{ fontSize: 11, borderRadius: 8 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
          {chartData.map((d) => (
            <Cell key={d.label} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function RelatedKelurahanChart({ kecamatanName, isDark }) {
  const ct = getChartTheme(isDark)
  const rows = kelurahanByKecamatan(kecamatanName).slice(0, 6)
  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={ct.grid} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: ct.axisText }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="kelurahan" tick={{ fontSize: 10, fill: ct.categoryText }} axisLine={false} tickLine={false} width={86} />
        <Tooltip cursor={{ fill: ct.cursorFill }} formatter={(v) => formatPercent(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Bar dataKey="collectionRate" radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
          {rows.map((row) => (
            <Cell key={row.id} fill={colorForRate(row.collectionRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function MapDetailPanel() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectedEntityType = useMapStore((s) => s.selectedEntityType)
  const detailPanelOpen = useMapStore((s) => s.detailPanelOpen)
  const closeDetailPanel = useMapStore((s) => s.closeDetailPanel)
  const { data, loading } = useMapEntityDetail(selectedEntityId, selectedEntityType)

  const meta = ENTITY_META[selectedEntityType] ?? ENTITY_META.opd
  const Icon = meta.icon
  const isRegion = selectedEntityType === 'kecamatan' || selectedEntityType === 'kelurahan'

  return (
    <>
      {detailPanelOpen && (
        <button
          type="button"
          aria-label="Tutup panel detail"
          onClick={closeDetailPanel}
          className="fixed inset-0 z-[1150] bg-navy-950/40 md:hidden"
        />
      )}
      <div
        className={`${detailPanelOpen ? 'flex' : 'hidden'} flex-col fixed inset-x-0 bottom-0 z-[1200] max-h-[78vh] rounded-t-2xl md:static md:z-auto md:max-h-none md:rounded-card md:w-[320px] md:shrink-0 bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 shadow-card overflow-hidden`}
      >
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <span className="w-9 h-1 rounded-full bg-slate-200 dark:bg-white/15" />
        </div>

        {!data || loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-white/10 border-t-brand-blue animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-start gap-3 p-4 border-b border-surface-border dark:border-white/10">
              <span
                className="flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0"
                style={{ backgroundColor: isRegion ? colorForRate(data.stats?.collectionRate ?? 0) : data.color ?? colorForEntityStatus(data.status) }}
              >
                <Icon size={17} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                  {meta.label} {!isRegion && data.kecamatan ? `· ${data.kecamatan}` : ''}
                </div>
                <h3 className="text-[14.5px] font-bold text-navy-900 dark:text-white leading-snug">
                  {data.name}
                </h3>
                <div className="mt-1.5">
                  {isRegion || data.complianceStatus ? (
                    <Badge>
                      {complianceStatusLabel(isRegion ? bandForRate(data.stats?.collectionRate ?? 0) : data.complianceStatus)}
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {STATUS_LABEL[data.status] ?? data.status}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetailPanel}
                aria-label="Tutup"
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {buildKpis(selectedEntityType, data).map((kpi) => (
                  <MiniStat key={kpi.label} label={kpi.label} value={kpi.value} />
                ))}
              </div>

              <div>
                <div className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                  {isRegion ? 'Collection Rate Kelurahan' : 'Status Pembayaran'}
                </div>
                {isRegion ? (
                  <RelatedKelurahanChart kecamatanName={data.name} isDark={isDark} />
                ) : (
                  <PaidUnpaidChart
                    paid={data.paidVehicleCount ?? data.vehiclesCollected ?? 0}
                    unpaid={data.unpaidVehicleCount ?? data.unpaidVehicles ?? 0}
                    isDark={isDark}
                  />
                )}
              </div>

              {meta.routeTo && (
                <button
                  type="button"
                  onClick={() => navigate(meta.routeTo)}
                  className="flex items-center justify-center gap-1.5 w-full h-9 rounded-lg bg-brand-blue text-white text-[12.5px] font-semibold hover:bg-blue-600 transition-colors"
                >
                  Lihat Detail
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
