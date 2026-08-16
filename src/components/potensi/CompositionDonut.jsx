import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Info } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatPercent, formatRupiahAuto } from '../../lib/format.js'

export default function CompositionDonut({ summary }) {
  const data = [
    { key: 'pkb', label: 'PKB', value: summary.potensiPkb, percent: summary.potensiPkbPercent, color: '#1668e3' },
    {
      key: 'opsen',
      label: 'Opsen PKB',
      value: summary.potensiOpsenPkb,
      percent: summary.potensiOpsenPkbPercent,
      color: '#7c3aed',
    },
    {
      key: 'swdkllj',
      label: 'SWDKLLJ',
      value: summary.potensiSwdkllj,
      percent: summary.potensiSwdklljPercent,
      color: '#eab308',
    },
  ].filter((d) => d.value > 0)

  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
        <div className="font-semibold text-navy-900 dark:text-white">{d.label}</div>
        <div className="text-slate-500 dark:text-slate-400">
          {formatRupiahAuto(d.value)} ({formatPercent(d.percent)})
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-3">
        KOMPOSISI POTENSI PENAGIHAN
      </h2>
      <div className="flex-1 flex items-center gap-3 min-h-[150px]">
        <div className="relative w-[128px] h-[128px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
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
            <span className="text-[15px] font-extrabold text-navy-900 dark:text-white leading-none text-center">
              {formatRupiahAuto(summary.totalPotensi)}
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-2 min-w-0">
          {data.map((d) => (
            <li key={d.key} className="text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="block font-semibold text-navy-900 dark:text-white pl-3.5">
                {formatRupiahAuto(d.value)}{' '}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  ({formatPercent(d.percent)})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2 mt-3 bg-[#eef4fd] dark:bg-brand-blue/10 rounded-lg px-2.5 py-2">
        <Info size={13} className="shrink-0 mt-0.5 text-brand-blue dark:text-blue-400" />
        <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Potensi penagihan adalah estimasi pendapatan dari kendaraan yang belum melakukan pembayaran pajak dan
          SWDKLLJ.
        </p>
      </div>
    </Card>
  )
}
