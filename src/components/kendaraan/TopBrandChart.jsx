import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card.jsx'
import CategoryTick from '../charts/CategoryTick.jsx'
import { formatNumberID, formatPercent } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{d.merk}</div>
      <div className="text-slate-500 dark:text-slate-400">
        {formatNumberID(d.count)} unit ({formatPercent(d.percent)})
      </div>
    </div>
  )
}

export default function TopBrandChart({ breakdown }) {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)
  const maxCount = Math.max(...breakdown.map((d) => d.count), 1)
  const chartData = breakdown.map((d) => ({
    ...d,
    labelText: `${formatNumberID(d.count)} (${formatPercent(d.percent)})`,
  }))

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-2">
        TOP 5 MEREK KENDARAAN
      </h2>
      <div className="flex-1 min-h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 60, bottom: 0, left: 0 }} barCategoryGap={14}>
            <XAxis type="number" domain={[0, maxCount * 1.15]} hide />
            <YAxis
              type="category"
              dataKey="merk"
              width={70}
              tick={<CategoryTick fill={ct.categoryText} maxChars={12} fontSize={11} />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
              {chartData.map((d) => (
                <Cell key={d.merk} fill={d.color} />
              ))}
              <LabelList
                dataKey="labelText"
                position="right"
                style={{ fontSize: 10.5, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
