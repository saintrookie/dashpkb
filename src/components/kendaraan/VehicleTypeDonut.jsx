import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card.jsx'
import { formatNumberID, formatPercent } from '../../lib/format.js'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{d.label}</div>
      <div className="text-slate-500 dark:text-slate-400">
        {formatNumberID(d.count)} unit ({formatPercent(d.percent)})
      </div>
    </div>
  )
}

export default function VehicleTypeDonut({ breakdown, total }) {
  const data = breakdown.filter((d) => d.count > 0)

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">
        KOMPOSISI JENIS KENDARAAN
      </h2>
      <div className="flex-1 flex items-center gap-3 min-h-[190px]">
        <div className="relative w-[128px] h-[128px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[16px] font-extrabold text-navy-900 dark:text-white leading-none">
              {formatNumberID(total)}
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">unit</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 min-w-0">
          {data.map((d) => (
            <li key={d.key} className="text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="block font-semibold text-navy-900 dark:text-white pl-3.5">
                {formatNumberID(d.count)}{' '}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({formatPercent(d.percent)})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
