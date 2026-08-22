import { useState } from 'react'
import { Download, RefreshCw, Inbox, Loader2 } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import SearchBar from './SearchBar.jsx'
import Pagination from './Pagination.jsx'
import TableCardSkeleton from './TableCardSkeleton.jsx'
import { useOpd } from '../../hooks/useOpd'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'
import { formatNumberID, formatPercent } from '../../lib/format.js'
import { complianceStatusLabel } from '../../lib/complianceStatus.js'
import * as mockApi from '../../services/mockApi.js'
import { col, toXlsxBlob, downloadBlob, slugify } from '../../lib/reportExport.js'

const PAGE_SIZE = 5

const COLUMNS = [
  { key: 'no', label: 'No', align: 'left' },
  { key: 'opd', label: 'OPD', align: 'left' },
  { key: 'jumlahKendaraan', label: 'Jumlah Kendaraan', align: 'right' },
  { key: 'sudahBayar', label: 'Sudah Bayar', align: 'right' },
  { key: 'belumBayar', label: 'Belum Bayar', align: 'right' },
  { key: 'collectionRate', label: 'Collection Rate (%)', align: 'right' },
  { key: 'penerimaanPkb', label: 'Penerimaan PKB (Rp)', align: 'right', revenue: true },
  { key: 'opsenPkb', label: 'Opsen PKB (Rp)', align: 'right' },
  { key: 'swdkllj', label: 'SWDKLLJ (Rp)', align: 'right', revenue: true },
  { key: 'potensiBelumBayar', label: 'Potensi Belum Bayar (Rp)', align: 'right' },
  { key: 'status', label: 'Status Kepatuhan', align: 'center' },
]

function SkeletonRow({ columns }) {
  return (
    <tr className="border-b border-surface-border dark:border-white/10">
      {columns.map((c) => (
        <td key={c.key} className="px-2.5 py-2">
          <div className="h-3 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export default function ComplianceTable({ taxYear }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const { opsenOnly } = useRevenueVisibility()
  const columns = COLUMNS.filter((c) => !opsenOnly || !c.revenue).map((c) =>
    opsenOnly && c.key === 'potensiBelumBayar' ? { ...c, label: 'Potensi Belum Bayar Opsen PKB (Rp)' } : c,
  )

  const { data, meta, loading, error, refetch } = useOpd({
    page,
    perPage: PAGE_SIZE,
    search: query,
    sortBy: 'collectionRate',
    sortDirection: 'desc',
    taxYear,
  })

  function handleSearch(v) {
    setQuery(v)
    setPage(1)
  }

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    setExportError(null)
    try {
      const res = await mockApi.getOpd({
        taxYear,
        search: query,
        perPage: 1000,
        sortBy: 'collectionRate',
        sortDirection: 'desc',
      })
      const rows = res.success ? res.data : []
      const exportColumns = [
        col('OPD', (r) => r.name),
        col('Jumlah Kendaraan', (r) => r.vehicleCount, { numeric: true }),
        col('Sudah Bayar', (r) => r.paidVehicleCount, { numeric: true }),
        col('Belum Bayar', (r) => r.unpaidVehicleCount, { numeric: true }),
        col('Collection Rate (%)', (r) => r.collectionRate, { numeric: true }),
        !opsenOnly && col('Penerimaan PKB (Rp)', (r) => r.payment.pkb, { numeric: true }),
        col('Opsen PKB (Rp)', (r) => r.payment.opsenPkb, { numeric: true }),
        !opsenOnly && col('SWDKLLJ (Rp)', (r) => r.payment.swdkllj, { numeric: true }),
        col(
          opsenOnly ? 'Potensi Belum Bayar Opsen PKB (Rp)' : 'Potensi Belum Bayar (Rp)',
          (r) => (opsenOnly ? r.billing.opsenPkb - r.payment.opsenPkb : r.unpaidPotential),
          { numeric: true },
        ),
        col('Status Kepatuhan', (r) => complianceStatusLabel(r.complianceStatus)),
      ].filter(Boolean)
      const blob = await toXlsxBlob('Daftar Kepatuhan OPD', exportColumns, rows)
      downloadBlob(blob, `daftar-kepatuhan-opd-${slugify(String(taxYear ?? 'default'))}.xlsx`)
    } catch {
      setExportError('Gagal mengekspor data. Silakan coba lagi.')
    } finally {
      setExporting(false)
    }
  }

  if (loading && !meta) {
    return <TableCardSkeleton />
  }

  return (
    <Card className="p-3.5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-bold text-navy-900 dark:text-white tracking-wide">
          DAFTAR KEPATUHAN OPD
        </h2>
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchBar value={query} onChange={handleSearch} placeholder="Cari OPD..." />
          <Button icon={exporting ? undefined : Download} onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Mengekspor...
              </span>
            ) : (
              'Ekspor Excel'
            )}
          </Button>
          <Button icon={RefreshCw} onClick={refetch} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-card border border-status-red/20 bg-status-redBg dark:bg-status-red/10 px-4 py-3 text-[12.5px] text-status-red dark:text-red-400">
          {error}
        </div>
      )}

      {exportError && (
        <div className="mb-3 rounded-card border border-status-red/20 bg-status-redBg dark:bg-status-red/10 px-4 py-3 text-[12.5px] text-status-red dark:text-red-400">
          {exportError}
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <caption className="sr-only">
            Daftar kepatuhan pembayaran PKB, Opsen PKB, dan SWDKLLJ per OPD
          </caption>
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b border-surface-border dark:border-white/10">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 leading-tight ${
                    c.align === 'right'
                      ? 'text-right'
                      : c.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}

            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-14">
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Inbox size={28} strokeWidth={1.5} />
                    <p className="text-sm">Tidak ada OPD yang cocok dengan pencarian.</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              data.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-2.5 py-2 text-[12px] text-slate-500 dark:text-slate-400">
                    {meta ? (meta.page - 1) * meta.perPage + index + 1 : index + 1}
                  </td>
                  <td className="px-2.5 py-2 text-[12px] font-semibold text-navy-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                    {formatNumberID(row.vehicleCount)}
                  </td>
                  <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                    {formatNumberID(row.paidVehicleCount)}
                  </td>
                  <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                    {formatNumberID(row.unpaidVehicleCount)}
                  </td>
                  <td className="px-2.5 py-2 text-[12px] font-semibold text-navy-900 dark:text-white text-right">
                    {formatPercent(row.collectionRate)}
                  </td>
                  {!opsenOnly && (
                    <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                      {formatNumberID(row.payment.pkb)}
                    </td>
                  )}
                  <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                    {formatNumberID(row.payment.opsenPkb)}
                  </td>
                  {!opsenOnly && (
                    <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                      {formatNumberID(row.payment.swdkllj)}
                    </td>
                  )}
                  <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right">
                    {formatNumberID(opsenOnly ? row.billing.opsenPkb - row.payment.opsenPkb : row.unpaidPotential)}
                  </td>
                  <td className="px-2.5 py-2 text-center">
                    <Badge>{complianceStatusLabel(row.complianceStatus)}</Badge>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-surface-border dark:border-white/10">
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Menampilkan {data.length === 0 ? 0 : (meta.page - 1) * meta.perPage + 1} -{' '}
            {Math.min(meta.page * meta.perPage, meta.total)} dari {meta.total} OPD
          </p>
          <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />
        </div>
      )}
    </Card>
  )
}
