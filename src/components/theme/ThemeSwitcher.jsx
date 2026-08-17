import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore.js'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const TRIGGER_CLASS = {
  default:
    'flex items-center justify-center w-9 h-9 rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-navy-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-white/5 data-[state=open]:text-navy-900 dark:data-[state=open]:text-white',
  dark: 'flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 data-[state=open]:bg-white/10 data-[state=open]:text-white',
}

export default function ThemeSwitcher({ variant = 'default' }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const ActiveIcon = OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" aria-label="Ubah tema tampilan" className={TRIGGER_CLASS[variant]}>
          <ActiveIcon size={16} strokeWidth={2} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[180px] rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Tampilan
          </div>
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = theme === opt.value
            return (
              <DropdownMenu.Item
                key={opt.value}
                onSelect={() => setTheme(opt.value)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium cursor-pointer outline-none transition-colors ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 data-[highlighted]:bg-slate-50 dark:data-[highlighted]:bg-white/5'
                }`}
              >
                <Icon size={15} strokeWidth={2} className="shrink-0" />
                <span className="flex-1">{opt.label}</span>
                {isActive && <Check size={15} strokeWidth={2.5} className="shrink-0" />}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
