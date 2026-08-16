import { useEffect, useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRowSkeleton from '../components/kpi/KpiRowSkeleton.jsx'
import ChartCardSkeleton from '../components/charts/ChartCardSkeleton.jsx'
import TableCardSkeleton from '../components/table/TableCardSkeleton.jsx'
import ComparisonKpiRow from '../components/kelurahan/ComparisonKpiRow.jsx'
import ComparisonFilterBar, { DEFAULT_COMPARISON_FILTERS } from '../components/kelurahan/ComparisonFilterBar.jsx'
import TopKelurahanRankTable from '../components/kelurahan/TopKelurahanRankTable.jsx'
import CollectionRateDistributionDonut from '../components/kelurahan/CollectionRateDistributionDonut.jsx'
import CollectionRateRangeChart from '../components/kelurahan/CollectionRateRangeChart.jsx'
import CollectionRateTrendChart from '../components/kelurahan/CollectionRateTrendChart.jsx'
import InsightRecommendationPanel from '../components/kelurahan/InsightRecommendationPanel.jsx'
import { kelurahanList } from '../data/kelurahan.js'

const METRIC_KEY = {
  rate_desc: 'collectionRate',
  penerimaan_desc: 'penerimaanPkb',
  potensi_desc: 'potensiBelumBayar',
  kendaraan_desc: 'jumlahKendaraan',
  name_asc: 'kelurahan',
}

function sortRows(rows, sort) {
  const key = METRIC_KEY[sort] ?? 'collectionRate'
  const sorted = [...rows]
  if (key === 'kelurahan') {
    sorted.sort((a, b) => a.kelurahan.localeCompare(b.kelurahan, 'id'))
  } else {
    sorted.sort((a, b) => b[key] - a[key])
  }
  return sorted
}

export default function PerbandinganKelurahanPage() {
  const [dataLoading, setDataLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_COMPARISON_FILTERS)

  useEffect(() => {
    const timer = window.setTimeout(() => setDataLoading(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  const sortedFiltered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const rows = kelurahanList.filter((row) => {
      if (filters.kecamatan !== 'Semua' && row.kecamatan !== filters.kecamatan) return false
      if (search && !row.kelurahan.toLowerCase().includes(search)) return false
      return true
    })
    return sortRows(rows, filters.sort)
  }, [filters])

  const highest = sortedFiltered.slice(0, 5)
  const lowest = [...sortedFiltered].reverse().slice(0, 5)

  return (
    <>
      <PageHeader
        title="Perbandingan Kelurahan"
        subtitle="Perbandingan Tingkat Kepatuhan Pembayaran PKB per Kelurahan"
      >
        <FilterCard icon={Calendar} label="Tahun Pajak" value="2025" />
        <FilterCard icon={Calendar} label="Periode Data" value="s.d. 20 Mei 2026" />
      </PageHeader>

      {dataLoading ? <KpiRowSkeleton /> : <ComparisonKpiRow />}

      {dataLoading ? (
        <ChartCardSkeleton />
      ) : (
        <ComparisonFilterBar filters={filters} onChange={setFilters} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-4 items-stretch">
        {dataLoading ? (
          <TableCardSkeleton />
        ) : (
          <TopKelurahanRankTable
            title="TOP 5 KELURAHAN DENGAN COLLECTION RATE TERTINGGI"
            rows={highest}
            tone="positive"
          />
        )}
        {dataLoading ? (
          <TableCardSkeleton />
        ) : (
          <TopKelurahanRankTable
            title="TOP 5 KELURAHAN DENGAN COLLECTION RATE TERENDAH"
            rows={lowest}
            tone="negative"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-4 items-stretch">
        {dataLoading ? <ChartCardSkeleton /> : <CollectionRateDistributionDonut />}
        {dataLoading ? <ChartCardSkeleton /> : <CollectionRateRangeChart />}
        {dataLoading ? <ChartCardSkeleton /> : <CollectionRateTrendChart />}
      </div>

      {!dataLoading && <InsightRecommendationPanel />}
    </>
  )
}
