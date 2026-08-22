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
import { Info } from 'lucide-react'
import Card from '../ui/Card.jsx'
import WrappedTick from '../charts/WrappedTick.jsx'
import { useKecamatanData } from '../../hooks/useYearlyLocalData.js'
import { formatRupiahFull } from '../../lib/format.js'
import { useTheme } from '../../hooks/useTheme.js'
import { getChartTheme } from '../../lib/chartTheme.js'
import { useMapStore } from '../../store/mapStore.js'
import { kecamatanGeoByName } from '../../lib/regionLookup.js'
import { useRevenueVisibility } from '../../hooks/useRevenueVisibility.js'

const TICKS = [0, 1e9, 2e9, 3e9, 4e9, 5e9]

function tickFormatter(v) {
  if (v === 0) return 'Rp 0'
  return `Rp ${v / 1e9} M`
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
          <span className="font-semibold text-navy-900 dark:text-white">{formatRupiahFull(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueByKecamatanChart() {
  const { isDark } = useTheme()
  const ct = getChartTheme(isDark)
  const { list: kecamatanList } = useKecamatanData()
  const { opsenOnly } = useRevenueVisibility()
  const selectedEntityId = useMapStore((s) => s.selectedEntityId)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const flyTo = useMapStore((s) => s.flyTo)

  const data = kecamatanList.map((r) => ({
    opd: r.kecamatan,
    pkb: r.penerimaanPkb,
    opsen: r.opsenPkb,
    regionId: kecamatanGeoByName.get(r.kecamatan)?.id,
  }))

  function handleBarClick(entry) {
    const props = kecamatanGeoByName.get(entry.opd)
    if (!props) return
    selectEntity(props.id, 'kecamatan')
    const [south, west, north, east] = props.bbox
    flyTo(null, null, [[south, west], [north, east]])
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          {opsenOnly ? 'REKAP KEUANGAN (OPSEN PKB)' : 'REKAP KEUANGAN (PKB & OPSEN PKB)'}
        </h2>
        <div className="flex items-center gap-3 text-[10.5px] text-slate-500 dark:text-slate-400">
          {!opsenOnly && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" /> Penerimaan PKB
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-status-purple" /> Opsen PKB
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -8 }} barGap={4}>
            <CartesianGrid vertical={false} stroke={ct.grid} />
            <XAxis
              dataKey="opd"
              tick={<WrappedTick fontSize={9.5} fill={ct.categoryText} />}
              axisLine={{ stroke: ct.axisLine }}
              tickLine={false}
              interval={0}
              height={30}
            />
            <YAxis
              ticks={TICKS}
              domain={[0, 5e9]}
              tickFormatter={tickFormatter}
              tick={{ fontSize: 10, fill: ct.axisText }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill }} />
            {!opsenOnly && (
              <Bar
                dataKey="pkb"
                name="Penerimaan PKB"
                radius={[3, 3, 0, 0]}
                barSize={16}
                isAnimationActive={false}
                onClick={handleBarClick}
                cursor="pointer"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.regionId}
                    fill="#1668e3"
                    fillOpacity={selectedEntityId && selectedEntityId !== entry.regionId ? 0.35 : 1}
                    stroke={selectedEntityId === entry.regionId ? '#0b1c4a' : 'transparent'}
                    strokeWidth={selectedEntityId === entry.regionId ? 1.5 : 0}
                  />
                ))}
                <LabelList
                  dataKey="pkb"
                  position="top"
                  formatter={barLabelFormatter}
                  style={{ fontSize: 9.5, fontWeight: 600, fill: ct.labelText }}
                />
              </Bar>
            )}
            <Bar
              dataKey="opsen"
              name="Opsen PKB"
              radius={[3, 3, 0, 0]}
              barSize={16}
              isAnimationActive={false}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.regionId}
                  fill="#7c3aed"
                  fillOpacity={selectedEntityId && selectedEntityId !== entry.regionId ? 0.35 : 1}
                  stroke={selectedEntityId === entry.regionId ? '#0b1c4a' : 'transparent'}
                  strokeWidth={selectedEntityId === entry.regionId ? 1.5 : 0}
                />
              ))}
              <LabelList
                dataKey="opsen"
                position="top"
                formatter={barLabelFormatter}
                style={{ fontSize: 9.5, fontWeight: 600, fill: ct.labelText }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-surface-border dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
        <Info size={13} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>Data berdasarkan tanggal pembayaran s.d. 20 Mei 2026</span>
      </div>
    </Card>
  )
}
