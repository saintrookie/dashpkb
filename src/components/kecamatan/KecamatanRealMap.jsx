import { Suspense, lazy, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Info, Map } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useMapRegions } from '../../hooks/useMapData.js'
import { useMapStore } from '../../store/mapStore.js'
import { useDataFilters } from '../../hooks/useDataFilters.js'

const InteractiveMap = lazy(() => import('../map/InteractiveMap.jsx'))

/**
 * Lightweight, region-only instance of the reusable InteractiveMap for the
 * Ringkasan Kecamatan page -- proves InteractiveMap is genuinely reusable
 * across pages, and replaces the old hand-drawn SVG wedge map.
 */
export default function KecamatanRealMap() {
  const { taxYear, periodId } = useDataFilters()
  const { data: regions, loading } = useMapRegions({ level: 'kecamatan', metric: 'collectionRate', taxYear, periodId })
  const setLayer = useMapStore((s) => s.setLayer)

  useEffect(() => {
    setLayer('kecamatan', true)
    setLayer('opd', false)
    setLayer('taxServicePoints', false)
    setLayer('collectionPoints', false)
  }, [setLayer])

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-1.5 mb-3">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          PETA COLLECTION RATE (PKB)
        </h2>
        <Info size={13} className="text-slate-400 dark:text-slate-500" />
        <Link
          to="/peta-wilayah/kecamatan"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 px-2.5 py-1.5 text-[11px] font-semibold text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Map size={13} />
          Peta Wilayah
        </Link>
      </div>

      <div className="flex-1 min-h-[260px] -mx-1">
        <Suspense fallback={<Skeleton className="w-full h-full min-h-[260px]" />}>
          {loading || !regions ? (
            <Skeleton className="w-full h-full min-h-[260px]" />
          ) : (
            <InteractiveMap
              regions={regions}
              regionLevel="kecamatan"
              metric="collectionRate"
              showMarkers={false}
              showHeatmap={false}
              showRoutes={false}
              showToolbar={false}
              showControls
              showLegend
              height="100%"
              className="min-h-[260px]"
            />
          )}
        </Suspense>
      </div>

      <div className="flex items-start gap-1.5 pt-3 mt-3 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info size={13} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>
          Warna peta menunjukkan tingkat Collection Rate (PKB). Klik pada wilayah untuk melihat detail kecamatan.
        </span>
      </div>
    </Card>
  )
}
