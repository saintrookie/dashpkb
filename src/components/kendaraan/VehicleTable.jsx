import { useEffect, useState } from 'react'
import { ChevronDown, Download, Inbox } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Pagination from '../table/Pagination.jsx'
import { formatNumberID } from '../../lib/format.js'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const COLUMNS = [
  { key: 'noPolisi', label: 'No Polisi' },
  { key: 'namaPemilik', label: 'Nama Pemilik' },
  { key: 'alamat', label: 'Alamat PKB' },
  { key: 'kelurahan', label: 'Kelurahan' },
  { key: 'kecamatan', label: 'Kecamatan' },
  { key: 'jenisLabel', label: 'Jenis Kendaraan' },
  { key: 'merk', label: 'Merk' },
  { key: 'tahunBuat', label: 'Tahun Buat', align: 'center' },
  { key: 'tglJatuhTempo', label: 'Tgl Jatuh Tempo', align: 'center' },
  { key: 'statusBayar', label: 'Status Bayar', align: 'center' },
  { key: 'tunggakanTahun', label: 'Tunggakan (Tahun)', align: 'center' },
  { key: 'pkb', label: 'PKB (Rp)', align: 'right' },
  { key: 'opsenPkb', label: 'Opsen PKB (Rp)', align: 'right' },
  { key: 'swdkllj', label: 'SWDKLLJ (Rp)', align: 'right' },
  { key: 'total', label: 'Total (Rp)', align: 'right' },
]

export default function VehicleTable({ rows }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [rows, pageSize])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <Card className="p-3.5 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-bold text-navy-900 dark:text-white tracking-wide">
          DAFTAR DATA KENDARAAN
        </h2>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
            Tampilkan
            <span className="relative inline-block">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="appearance-none rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-[12px] font-medium pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
            </span>
            data
          </label>
          <Button icon={Download}>Export Excel</Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3.5 px-3.5 flex-1">
        <table className="w-full min-w-[1440px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b border-surface-border dark:border-white/10">
              <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-8">
                No
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="py-14">
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Inbox size={28} strokeWidth={1.5} />
                    <p className="text-sm">Tidak ada kendaraan yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
            )}

            {pageRows.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
              >
                <td className="px-2.5 py-2 text-[12px] text-slate-500 dark:text-slate-400">
                  {(page - 1) * pageSize + index + 1}
                </td>
                <td className="px-2.5 py-2 text-[12px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                  {row.noPolisi}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.namaPemilik}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.alamat}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.kelurahan}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.kecamatan}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.jenisLabel}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.merk}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-center">
                  {row.tahunBuat}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-center whitespace-nowrap">
                  {row.tglJatuhTempo}
                </td>
                <td className="px-2.5 py-2 text-center">
                  <Badge>{row.statusBayar}</Badge>
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-center">
                  {row.tunggakanTahun > 0 ? row.tunggakanTahun : '-'}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.pkb)}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.opsenPkb)}
                </td>
                <td className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.swdkllj)}
                </td>
                <td className="px-2.5 py-2 text-[12px] font-semibold text-navy-900 dark:text-white text-right whitespace-nowrap">
                  {formatNumberID(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-surface-border dark:border-white/10">
        <p className="text-[12px] text-slate-500 dark:text-slate-400">
          Menampilkan {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
          {Math.min(page * pageSize, rows.length)} dari {formatNumberID(rows.length)} data
        </p>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </Card>
  )
}
