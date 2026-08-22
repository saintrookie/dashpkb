import { useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import TableCardSkeleton from '../components/table/TableCardSkeleton.jsx'
import KendaraanKpiRow from '../components/kendaraan/KendaraanKpiRow.jsx'
import VehicleTypeDonut from '../components/kendaraan/VehicleTypeDonut.jsx'
import PaymentStatusDonut from '../components/kendaraan/PaymentStatusDonut.jsx'
import VehicleYearChart from '../components/kendaraan/VehicleYearChart.jsx'
import TopBrandChart from '../components/kendaraan/TopBrandChart.jsx'
import VehicleFilterPanel, { DEFAULT_VEHICLE_FILTERS } from '../components/kendaraan/VehicleFilterPanel.jsx'
import VehicleTable from '../components/kendaraan/VehicleTable.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { useKendaraanListForActiveYear } from '../hooks/useYearlyLocalData.js'
import { summarizeKendaraan } from '../data/kendaraan.js'

export default function DataKendaraanPage() {
  const [filters, setFilters] = useState(DEFAULT_VEHICLE_FILTERS)
  const dataFilters = useDataFilters()
  const { list: kendaraanList, loading: dataLoading } = useKendaraanListForActiveYear()

  const filteredRows = useMemo(() => {
    return kendaraanList.filter((row) => {
      if (filters.kecamatan !== 'Semua' && row.kecamatan !== filters.kecamatan) return false
      if (filters.kelurahan !== 'Semua' && row.kelurahan !== filters.kelurahan) return false
      if (filters.jenis !== 'Semua' && row.jenisLabel !== filters.jenis) return false
      if (filters.status !== 'Semua' && row.statusBayar !== filters.status) return false
      return true
    })
  }, [filters, kendaraanList])

  const summary = useMemo(() => summarizeKendaraan(filteredRows), [filteredRows])

  return (
    <>
      <PageHeader title="Data Kendaraan" subtitle="Informasi Data Kendaraan Berdasarkan Wilayah">
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

      {dataLoading ? <KpiRowSkeleton /> : <KendaraanKpiRow summary={summary} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <VehicleTypeDonut breakdown={summary.jenisBreakdown} total={summary.total} />}
        {dataLoading ? <ChartCardSkeleton /> : <PaymentStatusDonut summary={summary} />}
        {dataLoading ? <ChartCardSkeleton /> : <VehicleYearChart breakdown={summary.yearBreakdown} />}
        {dataLoading ? <ChartCardSkeleton /> : <TopBrandChart breakdown={summary.brandBreakdown} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-3.5 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <VehicleFilterPanel onApply={setFilters} />}
        {dataLoading ? <TableCardSkeleton /> : <VehicleTable rows={filteredRows} />}
      </div>
    </>
  )
}
