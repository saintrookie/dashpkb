import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatNumberID, formatRupiahAuto } from '../../lib/format.js'

const SORT_OPTIONS = [
  { value: 'potensi_desc', label: 'Total Potensi' },
  { value: 'kendaraan_desc', label: 'Jumlah Kendaraan' },
]

export default function RegionPotensiTable({ title, rows, nameKey, limit = 5, viewAllTo }) {
  const [sort, setSort] = useState('potensi_desc')

  const sortedRows = useMemo(() => {
    const copy = [...rows]
    if (sort === 'kendaraan_desc') copy.sort((a, b) => b.kendaraan - a.kendaraan)
    else copy.sort((a, b) => b.potensi - a.potensi)
    return copy.slice(0, limit)
  }, [rows, sort, limit])

  const maxPotensi = Math.max(...sortedRows.map((r) => r.potensi), 1)

  return (
    <Card className="p-4 flex flex-col h-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">{title}</h2>
        <label className="flex items-center gap-1.5 text-[10.5px] text-slate-400 dark:text-slate-500">
          Urutkan berdasarkan
          <span className="relative inline-block">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-[11px] font-medium pl-2 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
          </span>
        </label>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 flex-1">
        <table className="w-full min-w-[320px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border dark:border-white/10">
              <th className="py-2 pr-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-5">
                #
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {nameKey === 'kecamatan' ? 'Kecamatan' : 'Kelurahan'}
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Total Potensi (Rp)
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Kendaraan
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={row[nameKey]}
                className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-2 pr-1.5 text-[11px] text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="py-2 px-1.5">
                  <div className="text-[11px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                    {row[nameKey]}
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden mt-1 w-full max-w-[140px]">
                    <div
                      className="h-full rounded-full bg-brand-blue"
                      style={{ width: `${(row.potensi / maxPotensi) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="py-2 px-1.5 text-[11px] font-semibold text-navy-900 dark:text-white text-right whitespace-nowrap">
                  {formatRupiahAuto(row.potensi)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.kendaraan)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        to={viewAllTo}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-blue hover:underline mt-3 pt-3 border-t border-surface-border dark:border-white/10 w-fit"
      >
        Lihat Selengkapnya
        <ArrowRight size={14} />
      </Link>
    </Card>
  )
}
