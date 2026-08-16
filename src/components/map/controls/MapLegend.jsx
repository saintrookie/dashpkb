import { useRef, useState } from 'react'
import { Info, ChevronDown } from 'lucide-react'
import { useStopMapEventPropagation } from '../mapControlUtils.js'
import { metricLegend, MAP_METRICS } from '../../../lib/mapMetrics.js'

export default function MapLegend({ metric }) {
  const ref = useRef(null)
  const [collapsed, setCollapsed] = useState(false)
  useStopMapEventPropagation(ref)

  const legend = metricLegend(metric)
  const metricLabel = (MAP_METRICS[metric] ?? MAP_METRICS.collectionRate).label

  return (
    <div
      ref={ref}
      className="absolute bottom-3 left-3 z-[1000] max-w-[220px] rounded-xl border border-surface-border dark:border-white/10 bg-white/95 dark:bg-navy-800/95 backdrop-blur shadow-card"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-navy-900 dark:text-white uppercase">
          <Info size={12} className="text-slate-400 dark:text-slate-500" />
          {metricLabel}
        </span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-1 px-3 pb-2.5 text-[10.5px] text-slate-600 dark:text-slate-300">
          {legend.map((item) => (
            <span key={item.band} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              {item.threshold && <span className="text-slate-400 dark:text-slate-500 tabular-nums">{item.threshold}</span>}
              <span className="truncate">{item.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
