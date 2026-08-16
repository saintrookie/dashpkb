export default function FilterCard({ icon: Icon, label, value, onIconClick }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-navy-800/60 border border-surface-border dark:border-white/10 rounded-xl px-4 py-2.5 shadow-card dark:shadow-none min-w-[168px]">
      <span className="shrink-0 text-slate-400 dark:text-slate-500">
        <Icon
          size={17}
          strokeWidth={2}
          onClick={onIconClick}
          className={onIconClick ? 'cursor-pointer hover:text-brand-blue transition-colors' : ''}
        />
      </span>
      <div className="leading-tight">
        <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">{label}</div>
        <div className="text-[13px] font-semibold text-navy-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}
