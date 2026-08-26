import { useState } from 'react'
import { Search } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { useMapEntities } from '../../hooks/useMapData.js'
import { useMapStore } from '../../store/mapStore.js'
import { useDataFilters } from '../../hooks/useDataFilters.js'
import { colorForRate } from '../../lib/mapMetrics.js'
import { formatNumberID, formatPercent } from '../../lib/format.js'
import TableCardSkeleton from '../table/TableCardSkeleton.jsx'

const ENTITY_TYPE_LABEL = { opd: 'OPD', tax_service_point: 'Layanan Pajak', collection_point: 'Titik Penagihan' }

export default function MapEntityTable() {
  const [query, setQuery] = useState('')
  const { taxYear } = useDataFilters()
  const { data: entities, loading } = useMapEntities({ search: query || undefined, taxYear })
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const flyTo = useMapStore((s) => s.flyTo)

  function handleRowClick(entity) {
    selectEntity(entity.id, entity.entityType)
    flyTo([entity.latitude, entity.longitude], 16)
  }

  if (loading || !entities) return <TableCardSkeleton />

  const rows = [...entities].sort((a, b) => (b.collectionRate ?? 0) - (a.collectionRate ?? 0)).slice(0, 12)

  return (
    <Card className="p-3.5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          DAFTAR LOKASI PETA
        </h2>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-lg px-2.5 h-8 min-w-[160px]">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari lokasi..."
            className="flex-1 min-w-0 bg-transparent text-[11.5px] text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-3.5 px-3.5 flex-1">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border dark:border-white/10">
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nama</th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipe</th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Kecamatan</th>
              <th className="py-2 px-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right">Collection Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[12px] text-slate-400 dark:text-slate-500">
                  Tidak ada lokasi yang cocok.
                </td>
              </tr>
            )}
            {rows.map((entity) => {
              const isSelected = entity.id === selectedEntityId
              return (
                <tr
                  key={entity.id}
                  onClick={() => handleRowClick(entity)}
                  className={`border-b border-surface-border dark:border-white/10 last:border-0 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-blue/[0.06] dark:bg-brand-blue/[0.1]' : 'hover:bg-slate-50/70 dark:hover:bg-white/5'
                  }`}
                >
                  <td className="py-2 px-1.5 text-[11.5px] font-semibold text-navy-900 dark:text-white whitespace-nowrap max-w-[220px] truncate">
                    {entity.name}
                  </td>
                  <td className="py-2 px-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {ENTITY_TYPE_LABEL[entity.entityType]}
                  </td>
                  <td className="py-2 px-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{entity.kecamatan}</td>
                  <td className="py-2 px-1.5 text-right">
                    {entity.collectionRate != null ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10.5px] font-semibold text-navy-900 dark:text-white">{formatPercent(entity.collectionRate)}</span>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorForRate(entity.collectionRate) }} />
                      </div>
                    ) : (
                      <span className="text-[10.5px] text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 mt-1 border-t border-surface-border dark:border-white/10">
        Menampilkan {rows.length} dari {formatNumberID(entities.length)} lokasi
      </p>
    </Card>
  )
}
