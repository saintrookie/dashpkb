import { ChevronDown, X } from 'lucide-react'

export default function FilterCard({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  showReset = false,
  onReset,
  onIconClick,
}) {
  const isSelectable = Array.isArray(options) && options.length > 0

  return (
    <div className="relative flex items-center gap-3 bg-white dark:bg-navy-800/60 border border-surface-border dark:border-white/10 rounded-xl px-4 py-2.5 shadow-card dark:shadow-none min-w-[168px]">
      <span className="shrink-0 text-slate-400 dark:text-slate-500">
        <Icon
          size={17}
          strokeWidth={2}
          onClick={onIconClick}
          className={onIconClick ? 'cursor-pointer hover:text-brand-blue transition-colors' : ''}
        />
      </span>
      <div className="leading-tight min-w-0 flex-1">
        <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">{label}</div>
        <div className="text-[13px] font-semibold text-navy-900 dark:text-white truncate">{value}</div>
      </div>

      {isSelectable && (
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="shrink-0 text-slate-400 dark:text-slate-500 pointer-events-none"
        />
      )}

      {showReset && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onReset?.()
          }}
          aria-label={`Reset ${label}`}
          className="relative z-10 shrink-0 -mr-1 p-1 rounded-full text-slate-300 dark:text-slate-500 hover:text-status-red hover:bg-status-redBg dark:hover:bg-status-red/15 transition-colors"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}

      {isSelectable && (
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
