import CollectionRateChart from './CollectionRateChart.jsx'
import RevenueChart from './RevenueChart.jsx'
import UnpaidPotentialChart from './UnpaidPotentialChart.jsx'
import ChartsRowSkeleton from './ChartsRowSkeleton.jsx'

export default function ChartsRow({ data, loading, error }) {
  if (loading) return <ChartsRowSkeleton />

  if (error || !data) {
    return (
      <div className="mb-4 rounded-card border border-status-red/20 bg-status-redBg dark:bg-status-red/10 px-4 py-3 text-[12.5px] text-status-red dark:text-red-400">
        {error ?? 'Gagal memuat data grafik.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 items-stretch">
      <CollectionRateChart data={data.charts.collectionRate} />
      <RevenueChart data={data.charts.revenue} />
      <UnpaidPotentialChart data={data.charts.unpaidPotential} />
    </div>
  )
}
