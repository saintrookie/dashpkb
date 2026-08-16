import { Route as RouteIcon } from 'lucide-react'
import { formatNumberID } from '../../../lib/format.js'

const STATUS_LABEL = { ACTIVE: 'Aktif', PLANNED: 'Direncanakan', COMPLETED: 'Selesai' }
const STATUS_CLASS = {
  ACTIVE: 'bg-status-greenBg text-status-green dark:bg-status-green/15 dark:text-green-400',
  PLANNED: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  COMPLETED: 'bg-blue-50 text-brand-blue dark:bg-brand-blue/15 dark:text-blue-400',
}

export default function RoutePopup({ route }) {
  return (
    <div className="text-left">
      <div className="flex items-start gap-2.5 px-3.5 pt-3.5 pb-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-900 text-white shrink-0">
          <RouteIcon size={15} strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
            {route.assignedTeam}
          </div>
          <div className="text-[12.5px] font-bold text-navy-900 dark:text-white leading-snug">{route.name}</div>
        </div>
      </div>

      <div className="px-3.5 pb-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[route.status]}`}>
          {STATUS_LABEL[route.status] ?? route.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3.5 pb-3.5">
        <div>
          <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Jarak</div>
          <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{route.distance} km</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Estimasi Waktu</div>
          <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{route.estimatedDuration} mnt</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Target Kendaraan</div>
          <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{formatNumberID(route.vehiclesTargeted)}</div>
        </div>
        <div>
          <div className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Titik Singgah</div>
          <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{route.waypointIds.length}</div>
        </div>
      </div>
    </div>
  )
}
