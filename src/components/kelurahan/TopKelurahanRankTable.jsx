import { Link } from 'react-router-dom'
import { ArrowRight, Inbox } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../lib/format.js'
import { kecamatanSlug, kelurahanSlug } from '../../lib/regionLookup.js'

const LEGEND = [
  { min: 90, color: '#16a34a' },
  { min: 75, color: '#86d78c' },
  { min: 60, color: '#eab308' },
  { min: 0, color: '#f2760c' },
]

function colorFor(rate) {
  return LEGEND.find((band) => rate >= band.min).color
}

const TONE = {
  positive: 'text-status-green',
  negative: 'text-status-red',
}

export default function TopKelurahanRankTable({ title, rows, tone = 'positive', showMoreLink = true }) {
  return (
    <Card className="p-4 flex flex-col h-full min-w-0">
      <h2 className={`text-[12.5px] font-bold tracking-wide mb-3 ${TONE[tone]}`}>{title}</h2>

      <div className="overflow-x-auto -mx-4 px-4 flex-1">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border dark:border-white/10">
              <th className="py-2 pr-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-5">
                #
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Kelurahan
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Kecamatan
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Collection Rate (PKB)
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Penerimaan PKB
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Potensi Belum Bayar
              </th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                Jumlah Kendaraan
              </th>
              <th className="py-2 pl-1.5 w-8" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Inbox size={22} strokeWidth={1.5} />
                    <p className="text-xs">Tidak ada kelurahan yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-2 pr-1.5 text-[11px] text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="py-2 px-1.5 text-[11px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                  {row.kelurahan}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {row.kecamatan}
                </td>
                <td className="py-2 px-1.5">
                  <div className="flex items-center gap-1.5 min-w-[92px]">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.collectionRate}%`, backgroundColor: colorFor(row.collectionRate) }}
                      />
                    </div>
                    <span className="text-[10.5px] font-semibold text-navy-900 dark:text-white shrink-0">
                      {formatPercent(row.collectionRate)}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatRupiahAuto(row.penerimaanPkb)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatRupiahAuto(row.potensiBelumBayar)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatNumberID(row.jumlahKendaraan)}
                </td>
                <td className="py-2 pl-1.5 text-right">
                  <Link
                    to={`/kecamatan/${kecamatanSlug(row.kecamatan)}/${kelurahanSlug(row.kelurahan)}`}
                    aria-label={`Detail Kelurahan ${row.kelurahan}`}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-400 dark:text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMoreLink && (
        <Link
          to="/ringkasan-kelurahan"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-blue hover:underline mt-3 pt-3 border-t border-surface-border dark:border-white/10 w-fit"
        >
          Lihat Selengkapnya
          <ArrowRight size={14} />
        </Link>
      )}
    </Card>
  )
}
