import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import Card from '../ui/Card.jsx'
import CategoryTick from './CategoryTick.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'

const THRESHOLDS = [
  { min: 90, color: '#16a34a', label: 'Sangat Baik' },
  { min: 70, color: '#eab308', label: 'Cukup' },
  { min: 50, color: '#f2760c', label: 'Rendah' },
  { min: 0, color: '#e0332f', label: 'Sangat Rendah' },
]

function colorFor(rate) {
  return THRESHOLDS.find((t) => rate >= t.min).color
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { opd, value } = payload[0].payload
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{opd}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Collection rate:{' '}
        <span className="font-semibold text-navy-900 dark:text-white">
          {value.toString().replace('.', ',')}%
        </span>
      </div>
    </div>
  )
}

export default function CollectionRateChart({ data: collectionRateChartData }) {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-2">
        COLLECTION RATE OPD (%)
      </h2>
      <div className="flex-1 min-h-[205px] max-h-[205px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={collectionRateChartData}
            layout="vertical"
            margin={{ top: 4, right: 42, bottom: 0, left: 0 }}
            barCategoryGap={10}
          >
            <CartesianGrid horizontal={false} stroke={ct.grid} />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10.5, fill: ct.axisText }}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="opd"
              width={118}
              tick={<CategoryTick fill={ct.categoryText} maxChars={15} />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={13} isAnimationActive={false}>
              {collectionRateChartData.map((entry) => (
                <Cell key={entry.opd} fill={colorFor(entry.value)} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v) => `${v.toString().replace('.', ',')}%`}
                style={{ fontSize: 11, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 pt-2 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400">
        {THRESHOLDS.map((t, i) => (
          <span key={t.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: t.color }}
            />
            {i === 0 && `≥${t.min}% `}
            {i > 0 && i < THRESHOLDS.length - 1 &&
              `${t.min}-${THRESHOLDS[i - 1].min - 1}% `}
            {i === THRESHOLDS.length - 1 && `<${THRESHOLDS[i - 1].min}% `}
            ({t.label})
          </span>
        ))}
      </div>
    </Card>
  )
}
