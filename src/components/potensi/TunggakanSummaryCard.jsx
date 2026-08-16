import { Car, DollarSign, Landmark } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatNumberID, formatPercent, formatRupiahAuto } from '../../lib/format.js'

const ICON_BG = {
  '#f2760c': 'bg-status-orange',
  '#eab308': 'bg-status-yellow',
  '#16a34a': 'bg-status-green',
}

export default function TunggakanSummaryCard({ summary }) {
  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">
        RINGKASAN TUNGGAKAN
      </h2>

      <div className="flex flex-col gap-2.5 flex-1">
        {summary.byTunggakanBucket.map((bucket) => (
          <div
            key={bucket.key}
            className="flex items-center gap-3 rounded-lg border border-surface-border dark:border-white/10 px-3 py-2.5"
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0 ${ICON_BG[bucket.color]}`}
            >
              <Car size={15} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-navy-900 dark:text-white">{bucket.label}</div>
              <div className="text-[10.5px] text-slate-400 dark:text-slate-500">
                {formatNumberID(bucket.count)} kendaraan
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[12px] font-bold text-navy-900 dark:text-white">
                {formatRupiahAuto(bucket.potensi)}
              </div>
              <div className="text-[10.5px] text-slate-400 dark:text-slate-500">
                ({formatPercent(bucket.percent)})
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-surface-border dark:border-white/10">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-2.5 py-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue text-white shrink-0">
            <DollarSign size={13} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[9.5px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              Total Kendaraan
            </div>
            <div className="text-[12px] font-bold text-navy-900 dark:text-white">
              {formatNumberID(summary.total)} unit
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-2.5 py-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-status-purple text-white shrink-0">
            <Landmark size={13} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[9.5px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              Total Potensi
            </div>
            <div className="text-[12px] font-bold text-navy-900 dark:text-white">
              {formatRupiahAuto(summary.totalPotensi)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
