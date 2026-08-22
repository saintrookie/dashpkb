import { Suspense, lazy, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import Card from '../components/ui/Card.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import RegionDetailKpiRow from '../components/wilayah/RegionDetailKpiRow.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { useKecamatanData, useKelurahanData } from '../hooks/useYearlyLocalData.js'
import { useMapRegions } from '../hooks/useMapData.js'
import { useMapStore } from '../store/mapStore.js'
import { kecamatanNameBySlug, kecamatanGeoByName, kelurahanSlug } from '../lib/regionLookup.js'
import { complianceStatusFromRate, complianceStatusLabel } from '../lib/complianceStatus.js'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../lib/format.js'

const InteractiveMap = lazy(() => import('../components/map/InteractiveMap.jsx'))

function RateBar({ rate }) {
  const color =
    rate >= 90 ? '#16a34a' : rate >= 75 ? '#86d78c' : rate >= 60 ? '#eab308' : '#f2760c'
  return (
    <div className="flex items-center gap-1.5 min-w-[92px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10.5px] font-semibold text-navy-900 dark:text-white shrink-0">
        {formatPercent(rate)}
      </span>
    </div>
  )
}

export default function KecamatanDetailPage() {
  const { kecamatanSlug: slug } = useParams()
  const dataFilters = useDataFilters()
  const { list: kecamatanList } = useKecamatanData()
  const { list: kelurahanList } = useKelurahanData()
  const flyTo = useMapStore((s) => s.flyTo)
  const resetView = useMapStore((s) => s.resetView)

  const kecamatanName = kecamatanNameBySlug(slug)
  const geoProps = kecamatanName ? kecamatanGeoByName.get(kecamatanName) : null
  const row = kecamatanName ? kecamatanList.find((r) => r.kecamatan === kecamatanName) : null

  const { data: regions, loading: regionsLoading } = useMapRegions({
    level: 'kelurahan',
    metric: 'collectionRate',
    kecamatanId: geoProps?.id,
  })

  useEffect(() => {
    if (!geoProps) return
    const [south, west, north, east] = geoProps.bbox
    flyTo(null, null, [[south, west], [north, east]])
    return () => resetView()
  }, [geoProps, flyTo, resetView])

  if (!kecamatanName || !geoProps) {
    return <Navigate to="/ringkasan-kecamatan" replace />
  }

  const kelurahanRows = kelurahanList
    .filter((r) => r.kecamatan === kecamatanName)
    .sort((a, b) => b.collectionRate - a.collectionRate)

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Ringkasan Kecamatan', to: '/ringkasan-kecamatan' },
          { label: kecamatanName },
        ]}
      />
      <PageHeader
        title={`Kecamatan ${kecamatanName}`}
        subtitle="Detail Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ"
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
          value={dataFilters.periodLabel || '—'}
          options={dataFilters.periodOptions}
          onChange={dataFilters.setPeriodByLabel}
          showReset={!dataFilters.isPeriodDefault}
          onReset={dataFilters.resetPeriod}
        />
      </PageHeader>

      {row ? (
        <RegionDetailKpiRow
          row={row}
          totalCount={kecamatanList.length}
          status={complianceStatusFromRate(row.collectionRate)}
        />
      ) : (
        <Skeleton className="h-[110px] w-full mb-4" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3.5 mb-4 items-stretch">
        <Card className="p-0 overflow-hidden min-h-[420px]">
          <Suspense fallback={<Skeleton className="w-full h-[420px]" />}>
            {regionsLoading || !regions ? (
              <Skeleton className="w-full h-[420px]" />
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
                height="420px"
              />
            )}
          </Suspense>
        </Card>

        <Card className="p-4 flex flex-col h-full min-w-0">
          <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">
            KELURAHAN DI {kecamatanName.toUpperCase()}
          </h2>
          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            <table className="w-full border-collapse text-left">
              <tbody>
                {kelurahanRows.map((kr, index) => (
                  <tr
                    key={kr.id}
                    className="border-b border-surface-border dark:border-white/10 last:border-0"
                  >
                    <td className="py-2 pr-1.5 text-[11px] text-slate-500 dark:text-slate-400 w-5">
                      {index + 1}
                    </td>
                    <td className="py-2 px-1.5 text-[11.5px] font-semibold text-navy-900 dark:text-white">
                      <Link
                        to={`/kecamatan/${slug}/${kelurahanSlug(kr.kelurahan)}`}
                        className="hover:text-brand-blue hover:underline"
                      >
                        {kr.kelurahan}
                      </Link>
                    </td>
                    <td className="py-2 px-1.5">
                      <RateBar rate={kr.collectionRate} />
                    </td>
                    <td className="py-2 pl-1.5 text-right">
                      <Link
                        to={`/kecamatan/${slug}/${kelurahanSlug(kr.kelurahan)}`}
                        aria-label={`Detail ${kr.kelurahan}`}
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
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-slate-600 dark:text-slate-300">
          <span>
            Status kepatuhan:{' '}
            <span className="font-semibold text-navy-900 dark:text-white">
              {row ? complianceStatusLabel(complianceStatusFromRate(row.collectionRate)) : '—'}
            </span>
          </span>
          <span>
            Jumlah kelurahan:{' '}
            <span className="font-semibold text-navy-900 dark:text-white">
              {formatNumberID(kelurahanRows.length)}
            </span>
          </span>
          <span>
            Potensi belum bayar (kecamatan):{' '}
            <span className="font-semibold text-navy-900 dark:text-white">
              {row ? `Rp ${formatRupiahAuto(row.potensiBelumBayar)}` : '—'}
            </span>
          </span>
        </div>
      </Card>
    </>
  )
}
