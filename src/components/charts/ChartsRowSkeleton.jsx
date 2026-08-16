import ChartCardSkeleton from './ChartCardSkeleton.jsx'

export default function ChartsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 items-stretch">
      <ChartCardSkeleton />
      <ChartCardSkeleton />
      <ChartCardSkeleton />
    </div>
  )
}
