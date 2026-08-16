import Card from '../ui/Card.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function TableCardSkeleton() {
  return (
    <Card className="p-3.5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-52 rounded-lg" />
      </div>
    </Card>
  )
}
