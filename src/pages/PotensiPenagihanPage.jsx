import { useEffect, useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import PotensiKpiRow from '../components/potensi/PotensiKpiRow.jsx'
import PotensiFilterBar, { getDefaultPotensiFilters } from '../components/potensi/PotensiFilterBar.jsx'
import RegionPotensiTable from '../components/potensi/RegionPotensiTable.jsx'
import CompositionDonut from '../components/potensi/CompositionDonut.jsx'
import TunggakanSummaryCard from '../components/potensi/TunggakanSummaryCard.jsx'
import PriorityDetailTable from '../components/potensi/PriorityDetailTable.jsx'
import PotensiInsightPanel from '../components/potensi/PotensiInsightPanel.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { usePotensiRowsForActiveYear } from '../hooks/useYearlyLocalData.js'
import { getPreviousMonthPeriod } from '../data/kecamatan.js'
import {
  getPotensiRowsForYear,
  summarizePotensi,
  bucketForTunggakan,
  getPotensiSummaryDelta,
} from '../data/potensiPenagihan.js'

function matchesPotensiFilters(row, filters) {
  if (filters.kecamatan !== 'Semua' && row.kecamatan !== filters.kecamatan) return false
  if (filters.kelurahan !== 'Semua' && row.kelurahan !== filters.kelurahan) return false
  if (filters.jenis !== 'Semua' && row.jenisLabel !== filters.jenis) return false
  if (filters.tunggakan !== 'Semua' && bucketForTunggakan(row.tunggakanTahun)?.label !== filters.tunggakan)
    return false
  return true
}

export default function PotensiPenagihanPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [filters, setFilters] = useState(() => getDefaultPotensiFilters(role))
  const dataFilters = useDataFilters()
  const { list: potensiRows, loading: rowsLoading } = usePotensiRowsForActiveYear()
  const [summaryDelta, setSummaryDelta] = useState(null)

  const filteredRows = useMemo(
    () => potensiRows.filter((row) => matchesPotensiFilters(row, filters)),
    [filters, potensiRows],
  )

  const summary = useMemo(
    () => summarizePotensi(filteredRows, filters.jenisPendapatan),
    [filteredRows, filters.jenisPendapatan],
  )

  useEffect(() => {
    if (dataFilters.taxYear == null) return
    let cancelled = false
    setSummaryDelta(null)
    const { year: prevYear, periodId: prevPeriodId } = getPreviousMonthPeriod(
      dataFilters.taxYear,
      dataFilters.periodId ?? undefined,
    )
    getPotensiRowsForYear(prevYear, prevPeriodId).then((prevRowsAll) => {
      if (cancelled) return
      const prevRows = prevRowsAll.filter((row) => matchesPotensiFilters(row, filters))
      setSummaryDelta(getPotensiSummaryDelta(summary, summarizePotensi(prevRows, filters.jenisPendapatan)))
    })
    return () => {
      cancelled = true
    }
  }, [summary, filters, dataFilters.taxYear, dataFilters.periodId])

  const dataLoading = rowsLoading || summaryDelta == null

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

      {dataLoading ? <KpiRowSkeleton /> : <PotensiKpiRow summary={summary} delta={summaryDelta} />}

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
