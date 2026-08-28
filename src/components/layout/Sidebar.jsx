import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Select from '../ui/Select.jsx'
import { NAV_ITEMS } from '../../data/navigation.js'
import { useAuthStore } from '../../store/authStore.js'
import { useFilters } from '../../hooks/useFilters.js'
import { useDataFilters } from '../../hooks/useDataFilters.js'
import bridgeSkyline from '../../assets/illustrations/bridge-skyline.svg'
import { SAMSAT_LOGOS } from '../../data/samsatLogos.js'

// Routes whose region filter drills down to Kecamatan instead of the
// default Tahun Pajak + Periode Data pair.
const KECAMATAN_FILTER_ROUTES = new Set([
  '/peta-wilayah/opd',
  '/peta-wilayah/kecamatan',
  '/ringkasan-kecamatan',
  '/perbandingan-kelurahan',
])

// Kecamatan is page-specific, so it stays local state (remounted per route
// via `key`) rather than living in the shared data-filter store.
function KecamatanFilter({ options }) {
  const [value, setValue] = useState('Semua')
  return <Select label="Kecamatan" value={value} onChange={setValue} options={options} />
}

// A single free date field, styled to match Select above it.
function DateField({ label, ariaLabel, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-400 mb-1.5">{label}</span>
      <input
        type="date"
        aria-label={ariaLabel}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-navy-800/70 border border-white/10 text-white text-sm font-medium px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-blue/60 cursor-pointer [color-scheme:dark]"
      />
    </label>
  )
}

// Same free date-range picker as the page-header FilterCard (real <input
// type="date">, no snapping to a fixed period list) — as two fully separate
// start/end fields rather than a cramped side-by-side pair, since the
// sidebar column has room for each to stand on its own.
function PeriodeDataRangePicker({ dataFilters }) {
  return (
    <div className="flex flex-col gap-3.5">
      <DateField
        label="Periode Dari"
        ariaLabel="Periode Data dari"
        value={dataFilters.fromDate}
        min={dataFilters.minPeriodDate}
        max={dataFilters.toDate || dataFilters.maxPeriodDate}
        onChange={dataFilters.setFromDate}
      />
      <DateField
        label="Periode Sampai"
        ariaLabel="Periode Data sampai"
        value={dataFilters.toDate}
        min={dataFilters.fromDate || dataFilters.minPeriodDate}
        max={dataFilters.maxPeriodDate}
        onChange={dataFilters.setToDate}
      />
    </div>
  )
}

function SkylineIllustration() {
  return (
    <div className="w-full h-[80px] overflow-hidden opacity-[0.40]" aria-hidden="true">
      <img
        src={bridgeSkyline}
        alt=""
        className="w-full h-full object-cover object-bottom"
      />
    </div>
  )
}

function SidebarFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
          <div className="h-[42px] w-full rounded-lg bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// `collapsed` only ever narrows the layout at the `lg` breakpoint — the
// mobile drawer always renders the full, expanded sidebar regardless of
// the desktop collapse preference stored for large screens.
export default function Sidebar({ collapsed = false, onClose }) {
  const location = useLocation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { data: filtersData, loading: filtersLoading } = useFilters()
  const dataFilters = useDataFilters()
  const showKecamatan = KECAMATAN_FILTER_ROUTES.has(location.pathname)
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )

  return (
    <aside className="w-full h-full bg-gradient-to-b from-navy-950 to-navy-900 text-white flex flex-col overflow-hidden">
      <div
        className={`pt-6 pb-5 flex items-center justify-center gap-3 border-b border-white/10 relative ${
          collapsed ? 'pl-5 pr-12 lg:px-0' : 'pl-5 pr-12 lg:px-5'
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          {SAMSAT_LOGOS.map((logo) => (
            <img key={logo.src} src={logo.src} alt={logo.alt} className="w-12 h-12 object-contain" />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="lg:hidden absolute top-2 right-2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={`px-5 pt-5 pb-3 ${collapsed ? 'lg:hidden' : ''}`}>
        <h1 className="text-[13px] font-bold text-white leading-tight">
          Dashboard Kepatuhan
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          PKB, Opsen PKB &amp; SWDKLLJ
        </p>
      </div>

      <nav
        className={`flex flex-col gap-1 px-3 overflow-y-auto ${collapsed ? 'lg:px-2 lg:mt-4' : ''}`}
        aria-label="Navigasi utama"
      >
        {visibleNavItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            onClick={onClose}
            title={label}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 text-[13px] font-medium text-left transition-colors gap-2.5 px-3 ${
                collapsed ? 'lg:justify-center lg:px-0 lg:gap-0' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-brand-blue to-blue-500 text-white shadow-sidebarActive'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={`px-5 mt-6 ${collapsed ? 'lg:hidden' : ''}`}>
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 mb-3">
          FILTER WILAYAH
        </div>
        {filtersLoading || !dataFilters.ready ? (
          <SidebarFiltersSkeleton />
        ) : (
          <div className="flex flex-col gap-3.5">
            <Select
              label="Tahun Pajak"
              value={dataFilters.taxYearLabel}
              onChange={dataFilters.setTaxYear}
              options={dataFilters.taxYearOptions}
            />
            {showKecamatan ? (
              <KecamatanFilter key={location.pathname} options={['Semua', ...filtersData.kecamatan]} />
            ) : (
              <PeriodeDataRangePicker dataFilters={dataFilters} />
            )}
          </div>
        )}
      </div>

      <div className="mt-auto relative shrink-0">
        <div
          className={`px-5 pb-4 pt-6 text-[10.5px] leading-relaxed text-slate-400 relative z-10 border-t border-white/10 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          <p>Data per : 20 Mei 2026</p>
          <p>Sumber : Bapenda, Jasa Raharja</p>
        </div>
        <div className={`absolute inset-x-0 bottom-0 pointer-events-none ${collapsed ? 'lg:hidden' : ''}`}>
          <SkylineIllustration />
        </div>
        <div className="relative z-10 flex justify-center px-10 pb-4 top-[-10px]">
          <img src="/logo-sinergi-white.png" alt="Logo Sinergi" className="w-[100%] h-auto object-contain" />
        </div>
      </div>
    </aside>
  )
}
