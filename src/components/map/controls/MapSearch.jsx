import { useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import { Search, X, Building2, Landmark, Wallet, MapPinned, Loader2 } from 'lucide-react'
import { useMapSearch } from '../../../hooks/useMapData.js'
import { useMapStore } from '../../../store/mapStore.js'
import { useStopMapEventPropagation } from '../mapControlUtils.js'

const TYPE_META = {
  opd: { icon: Building2, label: 'OPD' },
  tax_service_point: { icon: Landmark, label: 'Layanan Pajak' },
  collection_point: { icon: Wallet, label: 'Titik Penagihan' },
  kecamatan: { icon: MapPinned, label: 'Kecamatan' },
  kelurahan: { icon: MapPinned, label: 'Kelurahan' },
}

export default function MapSearch() {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { results, loading } = useMapSearch(query)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const containerRef = useRef(null)
  useStopMapEventPropagation(containerRef)

  const showDropdown = focused && query.trim().length > 0

  function handleSelect(result) {
    if (result.bbox) {
      const [south, west, north, east] = result.bbox
      map.fitBounds([[south, west], [north, east]], { padding: [40, 40], maxZoom: 16 })
    } else {
      map.flyTo([result.latitude, result.longitude], 16)
    }
    selectEntity(result.id, result.type)
    setQuery(result.label)
    setFocused(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Cari OPD, kecamatan, kelurahan..."
          className="flex-1 min-w-0 bg-transparent text-[12.5px] text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        {loading && <Loader2 size={13} className="animate-spin text-slate-400 shrink-0" />}
        {query && !loading && (
          <button type="button" onClick={() => setQuery('')} aria-label="Bersihkan pencarian" className="text-slate-400 hover:text-slate-600 shrink-0">
            <X size={13} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-[280px] overflow-y-auto rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card z-[1100]">
          {results.length === 0 && !loading && (
            <p className="px-3.5 py-3 text-[12px] text-slate-400 dark:text-slate-500">Tidak ada hasil ditemukan.</p>
          )}
          {results.map((result) => {
            const meta = TYPE_META[result.type] ?? TYPE_META.opd
            const Icon = meta.icon
            return (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(result)}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 shrink-0">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-navy-900 dark:text-white truncate">{result.label}</span>
                  <span className="block text-[10.5px] text-slate-400 dark:text-slate-500">
                    {meta.label} &middot; {result.sublabel}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
