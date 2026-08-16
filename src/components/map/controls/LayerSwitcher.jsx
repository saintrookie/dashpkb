import * as Popover from '@radix-ui/react-popover'
import { Layers, Check } from 'lucide-react'
import { useMapStore } from '../../../store/mapStore.js'

const LAYER_ITEMS = [
  { key: 'opd', label: 'OPD' },
  { key: 'taxServicePoints', label: 'Layanan Pajak' },
  { key: 'collectionPoints', label: 'Titik Penagihan' },
  { key: 'kecamatan', label: 'Kecamatan' },
  { key: 'kelurahan', label: 'Kelurahan' },
  { key: 'heatmap', label: 'Heatmap' },
  { key: 'routes', label: 'Rute' },
]

export default function LayerSwitcher() {
  const activeLayers = useMapStore((s) => s.activeLayers)
  const toggleLayer = useMapStore((s) => s.toggleLayer)
  const activeCount = Object.values(activeLayers).filter(Boolean).length

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Kelola layer peta"
          className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card text-[11.5px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-colors data-[state=open]:text-brand-blue"
        >
          <Layers size={14} strokeWidth={2} />
          Layer
          <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-brand-blue/10 text-brand-blue text-[9.5px] font-bold">
            {activeCount}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-[1100] w-[220px] rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card overflow-hidden p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {LAYER_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleLayer(item.key)}
              className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              {item.label}
              <span
                className={`flex items-center justify-center w-4 h-4 rounded border ${
                  activeLayers[item.key]
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'border-slate-300 dark:border-white/20'
                }`}
              >
                {activeLayers[item.key] && <Check size={11} strokeWidth={3} />}
              </span>
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
