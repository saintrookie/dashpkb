import { ArrowDown, ArrowUp } from 'lucide-react'
import Card from '../ui/Card.jsx'

const ICON_BG = {
  blue: 'bg-brand-blue',
  green: 'bg-status-green',
  purple: 'bg-status-purple',
  orange: 'bg-status-orange',
  cyan: 'bg-status-cyan',
}

export default function KpiCard({
  icon: Icon,
  color = 'blue',
  label,
  value,
  target,
  progress,
  delta,
  deltaLabel,
  footer,
}) {
  const isUp = delta?.trim().startsWith('+')
  // The arrow icon already conveys direction, so drop the redundant +/- sign
  // from the printed number.
  const deltaDisplay = delta?.trim().replace(/^[+-]/, '')
  return (
    <Card className="p-3 flex gap-3 min-w-0">
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0 ${ICON_BG[color]}`}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <span className="text-[10.5px] font-semibold tracking-wide text-slate-400 dark:text-slate-400 leading-tight">
          {label}
        </span>
        <div>
          <div className="text-[22px] font-extrabold text-navy-900 dark:text-white leading-none">
            {value}
          </div>
          {target && <div className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-1.5">{target}</div>}
          {progress !== undefined && (
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full ${ICON_BG[color]}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
        {footer !== undefined ? (
          footer
        ) : delta ? (
          <div
            className={`flex items-center gap-1 text-[11.5px] font-semibold ${
              isUp ? 'text-status-green' : 'text-status-red'
            }`}
          >
            {isUp ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            <span>{deltaDisplay}</span>
            <span className="text-slate-400 font-normal">{deltaLabel}</span>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
