import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Dot,
} from 'recharts'
import { Info } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { formatPercent } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'
import { useMapStore } from '../../store/mapStore.js'
import { kecamatanNameById } from '../../lib/regionLookup.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{label}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Collection rate:{' '}
        <span className="font-semibold text-navy-900 dark:text-white">
          {formatPercent(payload[0].value)}
        </span>
      </div>
    </div>
  )
}

function EndDot(props) {
  const { cx, cy, index, payload, total } = props
  const isLast = index === total - 1
  if (!isLast) return <Dot {...props} r={3} fill="#1668e3" strokeWidth={0} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#1668e3" stroke="#fff" strokeWidth={2} />
      <rect x={cx - 22} y={cy - 28} width={44} height={18} rx={9} fill="#1668e3" />
      <text x={cx} y={cy - 16} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#fff">
        {formatPercent(payload.rate)}
      </text>
    </g>
  )
}

export default function TrendChart() {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)
  const { list: kecamatanList, trend: trendCollectionRate } = useKecamatanData()
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectedEntityType = useMapStore((s) => s.selectedEntityType)

  const selectedKecamatanName = selectedEntityType === 'kecamatan' ? kecamatanNameById.get(selectedEntityId) : null
  const selectedKecamatan = selectedKecamatanName ? kecamatanList.find((r) => r.kecamatan === selectedKecamatanName) : null

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          TREND COLLECTION RATE KOTA
        </h2>
        {selectedKecamatan && (
          <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-status-orange">
            <span className="w-2.5 h-0.5 rounded-full bg-status-orange" />
            {selectedKecamatan.kecamatan}: {formatPercent(selectedKecamatan.collectionRate)}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-[220px]">
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
              dot={<EndDot total={trendCollectionRate.length} />}
              isAnimationActive={false}
            />
            {selectedKecamatan && (
              <ReferenceLine
                y={selectedKecamatan.collectionRate}
                stroke="#f2760c"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `${selectedKecamatan.kecamatan} ${formatPercent(selectedKecamatan.collectionRate)}`,
                  position: 'insideBottomRight',
                  fill: '#f2760c',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info size={13} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>Periode Mei (YTD) s.d. 20 Mei 2026</span>
      </div>
    </Card>
  )
}
