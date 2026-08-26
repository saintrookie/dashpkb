import { useEffect, useMemo } from 'react'
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
import RevenueByKecamatanChart from '../components/kecamatan/RevenueByKecamatanChart.jsx'
import RankingTable from '../components/kecamatan/RankingTable.jsx'
import { useMapEntities, useMapRegions, useMapRoutes, useMapHeatmap } from '../hooks/useMapData.js'
import { useMapStore } from '../store/mapStore.js'
import { useDataFilters } from '../hooks/useDataFilters.js'

const ENTITY_TYPE_BY_LAYER = {
  opd: 'opd',
  taxServicePoints: 'tax_service_point',
  collectionPoints: 'collection_point',
}

const SCOPE_COPY = {
  opd: {
    title: 'Peta Wilayah — OPD',
    subtitle: 'Visualisasi Geografis OPD, Layanan Pajak & Titik Penagihan',
  },
  kecamatan: {
    title: 'Peta Wilayah — Kecamatan & Kelurahan',
    subtitle: 'Visualisasi Geografis Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ per Wilayah',
  },
}

// Peta Wilayah is split into two pages with non-overlapping data: OPD/titik
// layanan (point markers) and Kecamatan/Kelurahan (region choropleth). Each
// forces the map's layer toggles into its own scope on mount so switching
// between the two pages never leaks the other page's layer selection.
export default function PetaWilayahPage({ scope }) {
  const dataFilters = useDataFilters()
  const activeLayers = useMapStore((s) => s.activeLayers)
  const activeMetric = useMapStore((s) => s.activeMetric)
  const setLayer = useMapStore((s) => s.setLayer)
  const clearSelection = useMapStore((s) => s.clearSelection)
  const regionLevel = activeLayers.kelurahan ? 'kelurahan' : 'kecamatan'
  const heatmapMetric = activeMetric === 'collectionRate' ? 'unpaidPotential' : activeMetric

  useEffect(() => {
    // selectedEntityId/Type live in the shared map store, so a marker/region
    // picked on one Peta Wilayah page (or via search) would otherwise still
    // be showing in the KPI row/detail panel after navigating to the other
    // page -- clear it whenever this page's scope is (re)established.
    clearSelection()
    if (scope === 'opd') {
      setLayer('opd', true)
      setLayer('taxServicePoints', true)
      setLayer('collectionPoints', false)
      setLayer('kecamatan', false)
      setLayer('kelurahan', false)
    } else {
      setLayer('kecamatan', true)
      setLayer('kelurahan', false)
      setLayer('opd', false)
      setLayer('taxServicePoints', false)
      setLayer('collectionPoints', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, setLayer, clearSelection])

  const { data: allEntities, loading: entitiesLoading } = useMapEntities({ taxYear: dataFilters.taxYear })
  const { data: regions, loading: regionsLoading } = useMapRegions({
    level: regionLevel,
    metric: activeMetric,
    taxYear: dataFilters.taxYear,
    periodId: dataFilters.periodId,
  })
  const { data: routes } = useMapRoutes()
  const { data: heatmap } = useMapHeatmap({ metric: heatmapMetric, taxYear: dataFilters.taxYear })

  const markers = useMemo(() => {
    if (scope !== 'opd' || !allEntities) return []
    return allEntities.filter((entity) => {
      const layerKey = Object.keys(ENTITY_TYPE_BY_LAYER).find((key) => ENTITY_TYPE_BY_LAYER[key] === entity.entityType)
      return layerKey ? activeLayers[layerKey] : true
    })
  }, [scope, allEntities, activeLayers])

  const loading = entitiesLoading || regionsLoading
  const showMarkers = scope === 'opd' && (activeLayers.opd || activeLayers.taxServicePoints || activeLayers.collectionPoints)
  const showRegions = scope === 'kecamatan' && (activeLayers.kecamatan || activeLayers.kelurahan)
  const copy = SCOPE_COPY[scope] ?? SCOPE_COPY.opd

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle}>
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
              layerScope={scope}
              height="600px"
            />
          )}
        </Card>
        <MapDetailPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4 items-stretch">
        {scope === 'opd' ? (
          <>
            <MapCollectionRateChart />
            <MapEntityTable />
          </>
        ) : (
          <>
            <RevenueByKecamatanChart />
            <RankingTable />
          </>
        )}
      </div>
    </>
  )
}
