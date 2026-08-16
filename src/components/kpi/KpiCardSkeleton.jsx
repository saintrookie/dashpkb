import Card from '../ui/Card.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function KpiCardSkeleton() {
  return (
    <Card className="p-3 flex flex-col gap-2.5 min-w-0">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <Skeleton className="h-2.5 w-32" />
    </Card>
  )
}
