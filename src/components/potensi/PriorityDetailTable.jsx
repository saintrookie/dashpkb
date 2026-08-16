import { Link } from 'react-router-dom'
import { ArrowRight, Inbox } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatNumberID, formatRupiahAuto } from '../../lib/format.js'

export default function PriorityDetailTable({ title, rows, showKecamatan = false, avgLabel, viewAllTo }) {
  return (
    <Card className="p-4 flex flex-col h-full min-w-0">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">{title}</h2>

      <div className="overflow-x-auto -mx-4 px-4 flex-1">
        <table className="w-full min-w-[360px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border dark:border-white/10">
              <th className="py-2 pr-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-5">
                #
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {showKecamatan ? 'Kelurahan' : 'Kecamatan'}
              </th>
              {showKecamatan && (
                <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Kecamatan
                </th>
              )}
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Potensi (Rp)
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Kendaraan
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                {avgLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={showKecamatan ? 5 : 4} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Inbox size={22} strokeWidth={1.5} />
                    <p className="text-xs">Tidak ada data yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr
                key={showKecamatan ? `${row.kecamatan}-${row.kelurahan}` : row.kecamatan}
                className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-2 pr-1.5 text-[11px] text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="py-2 px-1.5 text-[11px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                  {showKecamatan ? row.kelurahan : row.kecamatan}
                </td>
                {showKecamatan && (
                  <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {row.kecamatan}
                  </td>
                )}
                <td className="py-2 px-1.5 text-[11px] font-semibold text-navy-900 dark:text-white text-right whitespace-nowrap">
                  {formatRupiahAuto(row.potensi)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.kendaraan)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatRupiahAuto(row.avgPotensiPerKendaraan)}
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
