import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Dot } from 'recharts'
import { Info } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { trendCollectionRate } from '../../data/kecamatan.js'
import { formatPercent } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{label}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Rata-rata:{' '}
        <span className="font-semibold text-navy-900 dark:text-white">{formatPercent(payload[0].value)}</span>
      </div>
    </div>
  )
}

function EndDot(props) {
  const { cx, cy, index } = props
  const isLast = index === trendCollectionRate.length - 1
  if (!isLast) return <Dot {...props} r={3} fill="#1668e3" strokeWidth={0} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#1668e3" stroke="#fff" strokeWidth={2} />
      <rect x={cx - 22} y={cy - 28} width={44} height={18} rx={9} fill="#1668e3" />
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#fff">
        {formatPercent(trendCollectionRate[index].rate)}
      </text>
    </g>
  )
}

export default function CollectionRateTrendChart() {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-2">
        TREND RATA-RATA COLLECTION RATE
      </h2>
      <div className="flex-1 min-h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendCollectionRate} margin={{ top: 24, right: 30, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={ct.grid} />
            <XAxis
              dataKey="bulan"
              tickFormatter={(v) => (v === 'Mei (YTD)' ? 'YTD' : v)}
              tick={{ fontSize: 9, fill: ct.categoryText }}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: ct.axisText }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: isDark ? '#2a3b6b' : '#c7d2e4', strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#1668e3"
              strokeWidth={2.5}
              dot={<EndDot />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info size={13} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>Rata-rata collection rate kumulatif s.d. Mei 2026</span>
      </div>
    </Card>
  )
}
