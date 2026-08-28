import { useEffect, useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import ComparisonKpiRow from '../components/kelurahan/ComparisonKpiRow.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import KelurahanRealMap from '../components/kelurahan/KelurahanRealMap.jsx'
import TopKelurahanRankTable from '../components/kelurahan/TopKelurahanRankTable.jsx'
import CollectionRateTrendChart from '../components/kelurahan/CollectionRateTrendChart.jsx'
import CollectionRateDistributionDonut from '../components/kelurahan/CollectionRateDistributionDonut.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { useKelurahanData } from '../hooks/useYearlyLocalData.js'
import { useAuthStore } from '../store/authStore.js'

export default function RingkasanKelurahanPage() {
  const [dataLoading, setDataLoading] = useState(true)
  const dataFilters = useDataFilters()
  const { list: kelurahanList } = useKelurahanData()
  const isAdmin = useAuthStore((s) => s.user?.role === 'Admin')

  useEffect(() => {
    const timer = window.setTimeout(() => setDataLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  const rankedRows = useMemo(
    () => [...kelurahanList].sort((a, b) => b.collectionRate - a.collectionRate),
    [kelurahanList],
  )

  return (
    <>
      <PageHeader
        title="Ringkasan Kelurahan"
        subtitle="Gambaran Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ per Kelurahan"
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

      {dataLoading ? <KpiRowSkeleton /> : <ComparisonKpiRow />}

      <div className="grid grid-cols-12 gap-3.5 mb-4 items-stretch">
        <div className="col-span-12">
          {dataLoading ? <ChartCardSkeleton /> : <KelurahanRealMap />}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5 mb-4 items-stretch">
        <div className="col-span-12">
          {dataLoading ? (
            <ChartCardSkeleton />
          ) : (
            <TopKelurahanRankTable
              title="RANKING KELURAHAN BERDASARKAN COLLECTION RATE"
              rows={rankedRows}
              showMoreLink={false}
              showRevenueBreakdown={isAdmin}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <CollectionRateTrendChart />}
        {dataLoading ? <ChartCardSkeleton /> : <CollectionRateDistributionDonut />}
      </div>
    </>
  )
}
