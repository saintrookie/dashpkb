import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Info } from 'lucide-react'
import Card from '../ui/Card.jsx'
import WrappedTick from './WrappedTick.jsx'
import { formatRupiahFull } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'

const TICKS = [0, 1e9, 2e9, 3e9, 4e9]

function tickFormatter(v) {
  if (v === 0) return '0'
  return `${v / 1e9} M`
}

function barLabelFormatter(v) {
  const m = v / 1e9
  return `${m.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white mb-1">{label}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Potensi belum bayar:{' '}
        <span className="font-semibold text-navy-900 dark:text-white">
          {formatRupiahFull(payload[0].value)}
        </span>
      </div>
    </div>
  )
}

export default function UnpaidPotentialChart({ data: unpaidPotentialChartData }) {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)
  const { opsenOnly } = useRevenueVisibility()
  const dataKey = opsenOnly ? 'potentialOpsenPkb' : 'potential'

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-2">
        {opsenOnly ? 'POTENSI BELUM BAYAR OPSEN PKB (Rp)' : 'POTENSI BELUM BAYAR (Rp)'}
      </h2>
      <div className="flex-1 min-h-[205px] max-h-[205px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={unpaidPotentialChartData}
            margin={{ top: 16, right: 8, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} stroke={ct.grid} />
            <XAxis
              dataKey="opd"
              tick={<WrappedTick fontSize={9.5} fill={ct.categoryText} />}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
              interval={0}
              height={38}
            />
            <YAxis
              ticks={TICKS}
              domain={[0, 4e9]}
              tickFormatter={tickFormatter}
              tick={{ fontSize: 10.5, fill: ct.axisText }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey={dataKey} fill="#7c3aed" radius={[3, 3, 0, 0]} barSize={26} isAnimationActive={false}>
              <LabelList
                dataKey={dataKey}
                position="top"
                formatter={barLabelFormatter}
                style={{ fontSize: 10.5, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info size={13} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>
          {opsenOnly
            ? 'Potensi belum bayar adalah Opsen PKB yang belum dibayarkan.'
            : 'Potensi belum bayar adalah total PKB + Opsen PKB + SWDKLLJ yang belum dibayarkan.'}
        </span>
      </div>
    </Card>
  )
}
