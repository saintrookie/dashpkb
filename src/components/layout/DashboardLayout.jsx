import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import { NAV_ITEMS } from '../../data/navigation.js'

function useCollapsedState() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem('sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0')
    } catch {
      /* ignore persistence errors */
    }
  }, [collapsed])

  return [collapsed, setCollapsed]
}

export default function DashboardLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useCollapsedState()
  const location = useLocation()
  const currentTitle =
    NAV_ITEMS.find((item) => item.path === location.pathname)?.label ??
    'Tingkat Kepatuhan OPD'

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-navy-950">
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-navy-950 text-white px-4 py-3">
        <span className="text-sm font-bold tracking-wide uppercase truncate pr-3">
          {currentTitle}
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu navigasi"
          className="p-1.5 rounded-md hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-navy-950/60"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[238px] transition-all duration-200 lg:translate-x-0 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-[238px]'
        } ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup menu navigasi"
          className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-md bg-white/10 text-white hover:bg-white/20"
        >
          <X size={16} />
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-pressed={collapsed}
          className="hidden lg:flex absolute top-20 -right-3 z-10 items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 shadow-card dark:shadow-none text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <Sidebar collapsed={collapsed} onNavigate={() => setDrawerOpen(false)} />
      </div>

      <main
        className={`pt-14 lg:pt-0 transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[238px]'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-7 py-4 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
