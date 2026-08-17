import { useEffect, useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import PotensiKpiRow from '../components/potensi/PotensiKpiRow.jsx'
import PotensiFilterBar, { DEFAULT_POTENSI_FILTERS } from '../components/potensi/PotensiFilterBar.jsx'
import RegionPotensiTable from '../components/potensi/RegionPotensiTable.jsx'
import CompositionDonut from '../components/potensi/CompositionDonut.jsx'
import TunggakanSummaryCard from '../components/potensi/TunggakanSummaryCard.jsx'
import PriorityDetailTable from '../components/potensi/PriorityDetailTable.jsx'
import PotensiInsightPanel from '../components/potensi/PotensiInsightPanel.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { usePotensiRowsForActiveYear } from '../hooks/useYearlyLocalData.js'
import { summarizePotensi, bucketForTunggakan } from '../data/potensiPenagihan.js'

export default function PotensiPenagihanPage() {
  const [dataLoading, setDataLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_POTENSI_FILTERS)
  const dataFilters = useDataFilters()
  const potensiRows = usePotensiRowsForActiveYear()

  useEffect(() => {
    const timer = window.setTimeout(() => setDataLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredRows = useMemo(() => {
    return potensiRows.filter((row) => {
      if (filters.kecamatan !== 'Semua' && row.kecamatan !== filters.kecamatan) return false
      if (filters.kelurahan !== 'Semua' && row.kelurahan !== filters.kelurahan) return false
      if (filters.jenis !== 'Semua' && row.jenisLabel !== filters.jenis) return false
      if (filters.tunggakan !== 'Semua' && bucketForTunggakan(row.tunggakanTahun)?.label !== filters.tunggakan)
        return false
      return true
    })
  }, [filters, potensiRows])

  const summary = useMemo(() => summarizePotensi(filteredRows), [filteredRows])

  return (
    <>
      <PageHeader
        title="Potensi Penagihan"
        subtitle="Informasi Potensi Pendapatan dari Kendaraan yang Belum Bayar"
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

      {dataLoading ? <KpiRowSkeleton /> : <PotensiKpiRow summary={summary} />}

      {dataLoading ? <ChartCardSkeleton /> : <PotensiFilterBar onApply={setFilters} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4 items-stretch">
        {dataLoading ? (
          <ChartCardSkeleton />
        ) : (
          <RegionPotensiTable
            title="POTENSI PENAGIHAN PER KECAMATAN"
            rows={summary.byKecamatan}
            nameKey="kecamatan"
            limit={7}
            viewAllTo="/ringkasan-kecamatan"
          />
        )}
        {dataLoading ? (
          <ChartCardSkeleton />
        ) : (
          <RegionPotensiTable
            title="POTENSI PENAGIHAN PER KELURAHAN"
            rows={summary.byKelurahan}
            nameKey="kelurahan"
            limit={5}
            viewAllTo="/perbandingan-kelurahan"
          />
        )}
        {dataLoading ? <ChartCardSkeleton /> : <CompositionDonut summary={summary} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <TunggakanSummaryCard summary={summary} />}
        {dataLoading ? (
          <ChartCardSkeleton />
        ) : (
          <PriorityDetailTable
            title="DAFTAR POTENSI PENAGIHAN TERBESAR (KECAMATAN)"
            rows={summary.byKecamatan.slice(0, 5)}
            avgLabel="Rata-rata Potensi/Kendaraan"
            viewAllTo="/ringkasan-kecamatan"
          />
        )}
        {dataLoading ? (
          <ChartCardSkeleton />
        ) : (
          <PriorityDetailTable
            title="DAFTAR TUNGGAKAN PRIORITAS"
            rows={summary.byKelurahan.slice(0, 5)}
            showKecamatan
            avgLabel="Tunggakan Rata-rata"
            viewAllTo="/perbandingan-kelurahan"
          />
        )}
      </div>

      {!dataLoading && <PotensiInsightPanel summary={summary} />}
    </>
  )
}
