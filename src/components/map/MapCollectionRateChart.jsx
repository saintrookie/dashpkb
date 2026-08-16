import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card.jsx'
import CategoryTick from '../charts/CategoryTick.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'
import { useMapEntities } from '../../hooks/useMapData.js'
import { useMapStore } from '../../store/mapStore.js'
import { colorForRate } from '../../lib/mapMetrics.js'
import ChartCardSkeleton from '../charts/ChartCardSkeleton.jsx'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 rounded-lg shadow-card px-3 py-2 text-xs">
      <div className="font-semibold text-navy-900 dark:text-white">{name}</div>
      <div className="text-slate-500 dark:text-slate-400">
        Collection rate: <span className="font-semibold text-navy-900 dark:text-white">{value.toString().replace('.', ',')}%</span>
      </div>
    </div>
  )
}

export default function MapCollectionRateChart() {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)
  const { data: entities, loading } = useMapEntities({ entityType: 'opd' })
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const flyTo = useMapStore((s) => s.flyTo)

  if (loading || !entities) return <ChartCardSkeleton />

  const chartData = [...entities]
    .sort((a, b) => b.collectionRate - a.collectionRate)
    .slice(0, 10)
    .map((e) => ({ id: e.id, name: e.name, value: e.collectionRate, latitude: e.latitude, longitude: e.longitude, entityType: e.entityType }))

  function handleBarClick(entry) {
    selectEntity(entry.id, entry.entityType)
    flyTo([entry.latitude, entry.longitude], 16)
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-2">
        COLLECTION RATE OPD (%) &middot; TERKAIT PETA
      </h2>
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 42, bottom: 0, left: 0 }} barCategoryGap={10}>
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
            <YAxis type="category" dataKey="name" width={118} tick={<CategoryTick fill={ct.categoryText} maxChars={15} />} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={13} isAnimationActive={false} onClick={handleBarClick} cursor="pointer">
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={colorForRate(entry.value)}
                  fillOpacity={selectedEntityId && selectedEntityId !== entry.id ? 0.35 : 1}
                  stroke={selectedEntityId === entry.id ? '#0b1c4a' : 'transparent'}
                  strokeWidth={selectedEntityId === entry.id ? 1.5 : 0}
                />
              ))}
              <LabelList dataKey="value" position="right" formatter={(v) => `${v.toString().replace('.', ',')}%`} style={{ fontSize: 11, fontWeight: 600, fill: ct.labelText }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
