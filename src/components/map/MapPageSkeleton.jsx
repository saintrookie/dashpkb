import Card from '../ui/Card.jsx'
import Skeleton from '../ui/Skeleton.jsx'

export default function MapPageSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-3 flex flex-col gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </Card>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-3.5">
        <Card className="flex-1 p-0 overflow-hidden">
          <Skeleton className="w-full h-[600px]" />
        </Card>
      </div>
    </div>
  )
}
