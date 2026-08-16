const VARIANTS = {
  primary:
    'bg-brand-blue text-white hover:bg-blue-700 focus-visible:ring-blue-300 border border-brand-blue',
  outline:
    'bg-white dark:bg-navy-800 text-navy-900 dark:text-slate-200 border border-surface-border dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 focus-visible:ring-slate-200 dark:focus-visible:ring-white/20',
}

export default function Button({
  variant = 'outline',
  className = '',
  children,
  icon: Icon,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </button>
  )
}
