import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../lib/format.js'
import { useMapStore } from '../../store/mapStore.js'
import { kecamatanGeoByName } from '../../lib/regionLookup.js'

const LEGEND = [
  { min: 90, color: '#16a34a' },
  { min: 75, color: '#86d78c' },
  { min: 60, color: '#eab308' },
  { min: 0, color: '#f2760c' },
]

function colorFor(rate) {
  return LEGEND.find((band) => rate >= band.min).color
}

const COLUMNS = [
  { key: 'kecamatan', label: 'Kecamatan', align: 'left' },
  { key: 'collectionRate', label: 'Collection Rate (PKB)', align: 'left' },
  { key: 'penerimaanPkb', label: 'Penerimaan PKB', align: 'right' },
  { key: 'opsenPkb', label: 'Opsen PKB', align: 'right' },
  { key: 'penerimaanSwdkllj', label: 'SWDKLLJ', align: 'right' },
  { key: 'sudahBayar', label: 'Sudah Bayar', align: 'right' },
  { key: 'belumBayar', label: 'Belum Bayar', align: 'right' },
  { key: 'jumlahKendaraan', label: 'Jumlah Kendaraan', align: 'right' },
]

export default function RankingTable() {
  const { list: kecamatanList } = useKecamatanData()
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const flyTo = useMapStore((s) => s.flyTo)

  function handleRowClick(kecamatanName) {
    const props = kecamatanGeoByName.get(kecamatanName)
    if (!props) return
    selectEntity(props.id, 'kecamatan')
    const [south, west, north, east] = props.bbox
    flyTo(null, null, [[south, west], [north, east]])
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">
        RANKING KECAMATAN BERDASARKAN COLLECTION RATE (PKB)
      </h2>

      <div className="overflow-x-auto -mx-4 px-4 flex-1">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border dark:border-white/10">
              <th className="py-2 pr-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-5">
                #
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kecamatanList.map((row) => {
              const isSelected = selectedEntityId === kecamatanGeoByName.get(row.kecamatan)?.id
              return (
              <tr
                key={row.kecamatan}
                onClick={() => handleRowClick(row.kecamatan)}
                className={`border-b border-surface-border dark:border-white/10 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? 'bg-brand-blue/[0.06] dark:bg-brand-blue/[0.1]' : 'hover:bg-slate-50/70 dark:hover:bg-white/5'
                }`}
              >
                <td className="py-2 pr-1.5 text-[11px] text-slate-500 dark:text-slate-400">{row.no}</td>
                <td className="py-2 px-1.5 text-[11px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                  {row.kecamatan}
                </td>
                <td className="py-2 px-1.5">
                  <div className="flex items-center gap-1.5 min-w-[88px]">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.collectionRate}%`,
                          backgroundColor: colorFor(row.collectionRate),
                        }}
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
                  {formatRupiahAuto(row.opsenPkb)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                  {formatRupiahAuto(row.penerimaanSwdkllj)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right">
                  {formatNumberID(row.sudahBayar)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right">
                  {formatNumberID(row.belumBayar)}
                </td>
                <td className="py-2 px-1.5 text-[11px] text-slate-600 dark:text-slate-300 text-right">
                  {formatNumberID(row.jumlahKendaraan)}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Link
        to="/ringkasan-kelurahan"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-blue hover:underline mt-3 pt-3 border-t border-surface-border dark:border-white/10 w-fit"
      >
        Lihat Selengkapnya
        <ArrowRight size={14} />
      </Link>
    </Card>
  )
}
