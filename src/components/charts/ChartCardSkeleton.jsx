import Card from '../ui/Card.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function ChartCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col h-full">
      <Skeleton className="h-3 w-40 mb-3" />
      <Skeleton className="flex-1 min-h-[205px] w-full" />
      <Skeleton className="h-2.5 w-full mt-3" />
    </Card>
  )
}
