import { useEffect, useState } from 'react'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import TopBarActions from '../topbar/TopBarActions.jsx'
import { usePageTitleStore } from '../../store/pageTitleStore.js'
import bgMaps from '../../assets/bg-maps-transparent.webp'

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
  const currentTitle = usePageTitleStore((s) => s.title)

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-navy-950">
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center gap-2 bg-navy-950 text-white pl-2 pr-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu navigasi"
          className="shrink-0 p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Menu size={20} />
        </button>
        <span className="min-w-0 flex-1 text-[13px] font-bold tracking-wide uppercase truncate">
          {currentTitle || 'Dashboard Kepatuhan'}
        </span>
        <TopBarActions variant="dark" />
      </div>

      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-[1px]"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[238px] transition-all duration-200 lg:translate-x-0 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-[238px]'
        } ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Straddles the sidebar's edge, so it must stay outside the aside's
            own overflow-hidden box or it would get clipped. */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-pressed={collapsed}
          className="hidden lg:flex absolute top-8 -right-3 z-10 items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 shadow-card dark:shadow-none text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <Sidebar collapsed={collapsed} onClose={() => setDrawerOpen(false)} />
      </div>

      <main
        className={`relative pt-14 lg:pt-0 transition-[padding] duration-200 ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[238px]'
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `url(${bgMaps})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '180% 80%',
          }}
        />
        <div className="relative z-10 px-4 sm:px-6 lg:px-7 py-4 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
