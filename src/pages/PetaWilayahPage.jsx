import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import Card from '../components/ui/Card.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import InteractiveMap from '../components/map/InteractiveMap.jsx'
import MapKpiRow from '../components/map/MapKpiRow.jsx'
import MapDetailPanel from '../components/map/panel/MapDetailPanel.jsx'
import MapCollectionRateChart from '../components/map/MapCollectionRateChart.jsx'
import MapEntityTable from '../components/map/MapEntityTable.jsx'
import { useMapEntities, useMapRegions, useMapRoutes, useMapHeatmap } from '../hooks/useMapData.js'
import { useMapStore } from '../store/mapStore.js'
import { useDataFilters } from '../hooks/useDataFilters.js'

const ENTITY_TYPE_BY_LAYER = {
  opd: 'opd',
  taxServicePoints: 'tax_service_point',
  collectionPoints: 'collection_point',
}

export default function PetaWilayahPage() {
  const dataFilters = useDataFilters()
  const activeLayers = useMapStore((s) => s.activeLayers)
  const activeMetric = useMapStore((s) => s.activeMetric)
  const regionLevel = activeLayers.kelurahan ? 'kelurahan' : 'kecamatan'
  const heatmapMetric = activeMetric === 'collectionRate' ? 'unpaidPotential' : activeMetric

  const { data: allEntities, loading: entitiesLoading } = useMapEntities()
  const { data: regions, loading: regionsLoading } = useMapRegions({ level: regionLevel, metric: activeMetric })
  const { data: routes } = useMapRoutes()
  const { data: heatmap } = useMapHeatmap({ metric: heatmapMetric })

  const markers = useMemo(() => {
    if (!allEntities) return []
    return allEntities.filter((entity) => {
      const layerKey = Object.keys(ENTITY_TYPE_BY_LAYER).find((key) => ENTITY_TYPE_BY_LAYER[key] === entity.entityType)
      return layerKey ? activeLayers[layerKey] : true
    })
  }, [allEntities, activeLayers])

  const loading = entitiesLoading || regionsLoading
  const showMarkers = activeLayers.opd || activeLayers.taxServicePoints || activeLayers.collectionPoints
  const showRegions = activeLayers.kecamatan || activeLayers.kelurahan

  return (
    <>
      <PageHeader title="Peta Wilayah" subtitle="Visualisasi Geografis Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ">
        <FilterCard
          icon={Calendar}
          label="Tahun Pajak"
          value={dataFilters.taxYearLabel || '—'}
          options={dataFilters.taxYearOptions}
          onChange={dataFilters.setTaxYear}
          showReset={!dataFilters.isTaxYearDefault}
          onReset={dataFilters.resetTaxYear}
        />
        <FilterCard
          icon={Calendar}
          label="Periode Data"
          value={dataFilters.periodLabel || '—'}
          options={dataFilters.periodOptions}
          onChange={dataFilters.setPeriodByLabel}
          showReset={!dataFilters.isPeriodDefault}
          onReset={dataFilters.resetPeriod}
        />
      </PageHeader>

      <MapKpiRow />

      <div className="flex flex-col lg:flex-row gap-3.5 mb-4 items-stretch">
        <Card className="flex-1 p-0 overflow-hidden min-h-[600px]">
          {loading ? (
            <Skeleton className="w-full h-[600px]" />
          ) : (
            <InteractiveMap
              markers={markers}
              regions={regions}
              routes={routes}
              heatmap={heatmap}
              regionLevel={regionLevel}
              metric={activeMetric}
              showMarkers={showMarkers}
              showRegions={showRegions}
              showHeatmap={activeLayers.heatmap}
              showRoutes={activeLayers.routes}
              height="600px"
            />
          )}
        </Card>
        <MapDetailPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4 items-stretch">
        <MapCollectionRateChart />
        <MapEntityTable />
      </div>
    </>
  )
}
