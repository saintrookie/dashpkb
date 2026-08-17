import { useEffect } from 'react'
import TopBarActions from '../topbar/TopBarActions.jsx'
import { usePageTitleStore } from '../../store/pageTitleStore.js'

export default function PageHeader({ title, subtitle, children }) {
  const setPageTitle = usePageTitleStore((s) => s.setTitle)

  useEffect(() => {
    setPageTitle(title)
    return () => setPageTitle('')
  }, [title, setPageTitle])

  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-navy-900 dark:text-white uppercase truncate">
            {title}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate">{subtitle}</p>
        </div>

        <div className="hidden lg:flex items-center shrink-0">
          <TopBarActions />
        </div>
      </div>

      {children && (
        <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>
      )}
    </header>
  )
}
