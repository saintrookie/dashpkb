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
import Card from '../ui/Card.jsx'
import WrappedTick from './WrappedTick.jsx'
import { formatRupiahFull } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'

const TICKS = [0, 5e8, 1e9, 1.5e9, 2e9, 2.5e9]

function tickFormatter(v) {
  if (v === 0) return '0'
  if (v < 1e9) return `${Math.round(v / 1e6)} jt`
  const m = v / 1e9
  return `${m.toString().replace('.', ',')} M`
}

function barLabelFormatter(v) {
  if (v <= 0) return ''
  const m = v / 1e9
  return `${m.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="text-slate-500 dark:text-slate-400">
          {p.name}:{' '}
          <span className="font-semibold text-navy-900 dark:text-white">
            {formatRupiahFull(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ data: revenueChartData }) {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          PENERIMAAN PKB &amp; OPSEN (Rp)
        </h2>
        <div className="flex items-center gap-3 text-[10.5px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" /> PKB
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-status-green" /> Opsen PKB
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-[205px] max-h-[205px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={revenueChartData}
            margin={{ top: 16, right: 8, bottom: 0, left: -12 }}
            barGap={4}
          >
            <CartesianGrid vertical={false} stroke={ct.grid} />
            <XAxis
              dataKey="opd"
              tick={<WrappedTick fill={ct.categoryText} />}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
              interval={0}
              height={30}
            />
            <YAxis
              ticks={TICKS}
              domain={[0, 2.5e9]}
              tickFormatter={tickFormatter}
              tick={{ fontSize: 10.5, fill: ct.axisText }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey="pkb" name="PKB" fill="#1668e3" radius={[3, 3, 0, 0]} barSize={16} isAnimationActive={false}>
              <LabelList
                dataKey="pkb"
                position="top"
                formatter={barLabelFormatter}
                style={{ fontSize: 10, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
            <Bar dataKey="opsenPkb" name="Opsen PKB" fill="#16a34a" radius={[3, 3, 0, 0]} barSize={16} isAnimationActive={false}>
              <LabelList
                dataKey="opsenPkb"
                position="top"
                formatter={barLabelFormatter}
                style={{ fontSize: 10, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
