import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import Card from '../components/ui/Card.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import TableCardSkeleton from '../components/table/TableCardSkeleton.jsx'
import RegionDetailKpiRow from '../components/wilayah/RegionDetailKpiRow.jsx'
import VehicleTable from '../components/kendaraan/VehicleTable.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { useKelurahanData, useKendaraanListForActiveYear } from '../hooks/useYearlyLocalData.js'
import { useMapRegions } from '../hooks/useMapData.js'
import { useMapStore } from '../store/mapStore.js'
import { kecamatanNameBySlug, kelurahanNameBySlug, kelurahanGeoByName, kecamatanSlug } from '../lib/regionLookup.js'
import { complianceStatusFromRate } from '../lib/complianceStatus.js'

const InteractiveMap = lazy(() => import('../components/map/InteractiveMap.jsx'))

export default function KelurahanDetailPage() {
  const { kecamatanSlug: kecSlugParam, kelurahanSlug: kelSlugParam } = useParams()
  const dataFilters = useDataFilters()
  const { list: kelurahanList } = useKelurahanData()
  const { list: kendaraanList, loading: kendaraanLoading } = useKendaraanListForActiveYear()
  const flyTo = useMapStore((s) => s.flyTo)
  const resetView = useMapStore((s) => s.resetView)

  const kecamatanName = kecamatanNameBySlug(kecSlugParam)
  const kelurahanName = kecamatanName ? kelurahanNameBySlug(kecamatanName, kelSlugParam) : null
  const geoProps = kelurahanName ? kelurahanGeoByName.get(kelurahanName) : null
  const row = kelurahanName ? kelurahanList.find((r) => r.kelurahan === kelurahanName) : null

  const { data: regions, loading: regionsLoading } = useMapRegions({
    level: 'kelurahan',
    metric: 'collectionRate',
    kecamatanId: geoProps?.id,
    taxYear: dataFilters.taxYear,
    periodId: dataFilters.periodId,
  })

  useEffect(() => {
    if (!geoProps) return
    const [south, west, north, east] = geoProps.bbox
    flyTo(null, null, [[south, west], [north, east]])
    return () => resetView()
  }, [geoProps, flyTo, resetView])

  const vehicleRows = useMemo(
    () => (kelurahanName ? kendaraanList.filter((r) => r.kelurahan === kelurahanName) : []),
    [kendaraanList, kelurahanName],
  )

  if (!kecamatanName || !kelurahanName || !geoProps) {
    return <Navigate to="/ringkasan-kelurahan" replace />
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Ringkasan Kelurahan', to: '/ringkasan-kelurahan' },
          { label: kecamatanName, to: `/kecamatan/${kecamatanSlug(kecamatanName)}` },
          { label: kelurahanName },
        ]}
      />
      <PageHeader
        title={`Kelurahan ${kelurahanName}`}
        subtitle={`Kecamatan ${kecamatanName} — Detail Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ`}
      >
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
          type="daterange"
          fromValue={dataFilters.fromDate}
          toValue={dataFilters.toDate}
          dateMin={dataFilters.minPeriodDate}
          dateMax={dataFilters.maxPeriodDate}
          onFromChange={dataFilters.setFromDate}
          onToChange={dataFilters.setToDate}
          showReset={!dataFilters.isPeriodDefault}
          onReset={dataFilters.resetPeriod}
        />
      </PageHeader>

      {row ? (
        <RegionDetailKpiRow
          row={row}
          totalCount={kelurahanList.length}
          status={complianceStatusFromRate(row.collectionRate)}
        />
      ) : (
        <Skeleton className="h-[110px] w-full mb-4" />
      )}

      <Card className="p-0 overflow-hidden min-h-[360px] mb-4">
        <Suspense fallback={<Skeleton className="w-full h-[360px]" />}>
          {regionsLoading || !regions ? (
            <Skeleton className="w-full h-[360px]" />
          ) : (
            <InteractiveMap
              regions={regions}
              regionLevel="kelurahan"
              metric="collectionRate"
              showMarkers={false}
              showHeatmap={false}
              showRoutes={false}
              showToolbar={false}
              showControls
              showLegend
              height="360px"
            />
          )}
        </Suspense>
      </Card>

      {kendaraanLoading ? <TableCardSkeleton /> : <VehicleTable rows={vehicleRows} />}
    </>
  )
}
