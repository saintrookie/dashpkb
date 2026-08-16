import * as Popover from '@radix-ui/react-popover'
import { Palette } from 'lucide-react'
import { useMapStore } from '../../../store/mapStore.js'
import { TILE_PROVIDERS } from '../config/tileProviders.js'

const OPTIONS = [
  { value: null, label: 'Otomatis' },
  { value: 'light', label: TILE_PROVIDERS.light.label },
  { value: 'dark', label: TILE_PROVIDERS.dark.label },
  { value: 'standard', label: TILE_PROVIDERS.standard.label },
]

export default function MapStyleSwitcher() {
  const tileStyleOverride = useMapStore((s) => s.tileStyleOverride)
  const setTileStyleOverride = useMapStore((s) => s.setTileStyleOverride)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Ubah gaya peta"
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card text-slate-500 dark:text-slate-300 hover:text-brand-blue transition-colors data-[state=open]:text-brand-blue"
        >
          <Palette size={15} strokeWidth={2} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-[1100] w-[150px] rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card overflow-hidden p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setTileStyleOverride(opt.value)}
              className={`flex items-center w-full px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
                tileStyleOverride === opt.value
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
