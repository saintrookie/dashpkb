import TopBarActions from '../topbar/TopBarActions.jsx'

export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold tracking-tight text-navy-900 dark:text-white uppercase">
            {title}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {children}
          {children && (
            <span
              className="hidden sm:block w-px h-8 bg-surface-border dark:bg-white/10 mx-1 shrink-0"
              aria-hidden="true"
            />
          )}
          <TopBarActions />
        </div>
      </div>
    </header>
  )
}
