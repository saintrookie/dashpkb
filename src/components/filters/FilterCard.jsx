import { ChevronDown, X } from 'lucide-react'

export default function FilterCard({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  type = 'select',
  dateValue,
  onDateChange,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  dateMin,
  dateMax,
  showReset = false,
  onReset,
  onIconClick,
}) {
  const isDate = type === 'date'
  const isRange = type === 'daterange'
  const isSelectable = !isDate && !isRange && Array.isArray(options) && options.length > 0

  return (
    <div
      className={`relative flex items-center gap-3 bg-white dark:bg-navy-800/60 border border-surface-border dark:border-white/10 rounded-xl px-4 py-2.5 shadow-card dark:shadow-none ${isRange ? 'min-w-[268px]' : 'min-w-[168px]'}`}
    >
      <span className="shrink-0 text-slate-400 dark:text-slate-500">
        <Icon
          size={17}
          strokeWidth={2}
          onClick={onIconClick}
          className={onIconClick ? 'cursor-pointer hover:text-brand-blue transition-colors' : ''}
        />
      </span>

      {isRange ? (
        <div className="leading-tight min-w-0 flex-1">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">{label}</div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              aria-label={`${label} dari`}
              value={fromValue ?? ''}
              min={dateMin}
              max={toValue || dateMax}
              onChange={(e) => onFromChange?.(e.target.value)}
              className="relative z-10 w-[108px] shrink-0 bg-transparent outline-none cursor-pointer text-[12.5px] font-semibold text-navy-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            />
            <span className="shrink-0 text-slate-300 dark:text-slate-600 text-[11px]">–</span>
            <input
              type="date"
              aria-label={`${label} sampai`}
              value={toValue ?? ''}
              min={fromValue || dateMin}
              max={dateMax}
              onChange={(e) => onToChange?.(e.target.value)}
              className="relative z-10 w-[108px] shrink-0 bg-transparent outline-none cursor-pointer text-[12.5px] font-semibold text-navy-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>
      ) : (
        <div className="leading-tight min-w-0 flex-1">
          <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">{label}</div>
          <div className="text-[13px] font-semibold text-navy-900 dark:text-white truncate">{value}</div>
        </div>
      )}

      {(isSelectable || isDate) && (
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

      {isDate && (
        <input
          type="date"
          aria-label={label}
          value={dateValue ?? ''}
          min={dateMin}
          max={dateMax}
          onChange={(e) => onDateChange?.(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      )}
    </div>
  )
}
