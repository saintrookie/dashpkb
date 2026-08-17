import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KecamatanKpiRow from '../components/kecamatan/KecamatanKpiRow.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import KecamatanRealMap from '../components/kecamatan/KecamatanRealMap.jsx'
import RankingTable from '../components/kecamatan/RankingTable.jsx'
import TrendChart from '../components/kecamatan/TrendChart.jsx'
import RevenueByKecamatanChart from '../components/kecamatan/RevenueByKecamatanChart.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'

export default function RingkasanKecamatanPage() {
  const [dataLoading, setDataLoading] = useState(true)
  const dataFilters = useDataFilters()

  useEffect(() => {
    const timer = window.setTimeout(() => setDataLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <PageHeader
        title="Ringkasan Kecamatan"
        subtitle="Gambaran Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ per Kecamatan"
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

      {dataLoading ? <KpiRowSkeleton /> : <KecamatanKpiRow />}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <KecamatanRealMap />}
        {dataLoading ? <ChartCardSkeleton /> : <RankingTable />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <TrendChart />}
        {dataLoading ? <ChartCardSkeleton /> : <RevenueByKecamatanChart />}
      </div>
    </>
  )
}
