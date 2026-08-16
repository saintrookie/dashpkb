import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card.jsx'
import { rateRangeDistribution, kelurahanSummary } from '../../data/kelurahan.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{label}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Jumlah kelurahan:{' '}
        <span className="font-semibold text-navy-900 dark:text-white">{payload[0].value}</span>
      </div>
    </div>
  )
}

export default function CollectionRateRangeChart() {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-1">
        RANGE COLLECTION RATE (PKB)
      </h2>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2">Jumlah Kelurahan</p>
      <div className="flex-1 min-h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rateRangeDistribution} margin={{ top: 16, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={ct.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9.5, fill: ct.categoryText }}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: ct.axisText }}
              axisLine={false}
              tickLine={false}
              width={26}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey="kelurahanCount" radius={[3, 3, 0, 0]} barSize={40} isAnimationActive={false}>
              {rateRangeDistribution.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
              <LabelList
                dataKey="kelurahanCount"
                position="top"
                style={{ fontSize: 11, fontWeight: 700, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        Total {kelurahanSummary.totalKelurahan} Kelurahan
      </p>
    </Card>
  )
}
