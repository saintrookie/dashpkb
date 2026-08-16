import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Select from '../ui/Select.jsx'
import CityEmblem from '../brand/CityEmblem.jsx'
import { NAV_ITEMS } from '../../data/navigation.js'
import { useAuthStore } from '../../store/authStore.js'

const DEFAULT_FILTERS = [
  { label: 'Tahun Pajak', defaultValue: '2025', options: ['2025', '2024', '2023'] },
  {
    label: 'Periode Data',
    defaultValue: 's.d. 20 Mei 2026',
    options: ['s.d. 20 Mei 2026', 's.d. 20 April 2026', 's.d. 20 Maret 2026'],
  },
]

const FILTER_CONFIG = {
  '/peta-wilayah': [
    { label: 'Tahun Pajak', defaultValue: '2025', options: ['2025', '2024', '2023'] },
    {
      label: 'Kecamatan',
      defaultValue: 'Semua',
      options: [
        'Semua',
        'Gerunggang',
        'Rangkui',
        'Taman Sari',
        'Bukit Intan',
        'Gabek',
        'Girimaya',
        'Pangkal Balam',
      ],
    },
  ],
  '/ringkasan-kecamatan': [
    { label: 'Tahun Pajak', defaultValue: '2025', options: ['2025', '2024', '2023'] },
    {
      label: 'Kecamatan',
      defaultValue: 'Semua',
      options: [
        'Semua',
        'Gerunggang',
        'Rangkui',
        'Taman Sari',
        'Bukit Intan',
        'Gabek',
        'Girimaya',
        'Pangkal Balam',
      ],
    },
  ],
  '/perbandingan-kelurahan': [
    { label: 'Tahun Pajak', defaultValue: '2025', options: ['2025', '2024', '2023'] },
    {
      label: 'Kecamatan',
      defaultValue: 'Semua',
      options: [
        'Semua',
        'Gerunggang',
        'Rangkui',
        'Taman Sari',
        'Bukit Intan',
        'Gabek',
        'Girimaya',
        'Pangkal Balam',
      ],
    },
  ],
}

function SkylineIllustration() {
  return (
    <svg
      viewBox="0 0 238 140"
      className="w-full h-auto opacity-[0.14]"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <rect x="0" y="70" width="18" height="70" fill="#fff" />
      <rect x="20" y="50" width="14" height="90" fill="#fff" />
      <rect x="36" y="85" width="16" height="55" fill="#fff" />
      <rect x="56" y="35" width="12" height="105" fill="#fff" />
      <polygon points="62,15 68,35 56,35" fill="#fff" />
      <rect x="72" y="60" width="20" height="80" fill="#fff" />
      <rect x="96" y="20" width="10" height="120" fill="#fff" />
      <circle cx="101" cy="10" r="6" fill="#fff" />
      <rect x="110" y="75" width="18" height="65" fill="#fff" />
      <rect x="132" y="45" width="14" height="95" fill="#fff" />
      <rect x="150" y="65" width="22" height="75" fill="#fff" />
      <rect x="176" y="30" width="12" height="110" fill="#fff" />
      <polygon points="182,10 188,30 176,30" fill="#fff" />
      <rect x="192" y="80" width="16" height="60" fill="#fff" />
      <rect x="212" y="55" width="14" height="85" fill="#fff" />
      <rect x="228" y="90" width="10" height="50" fill="#fff" />
    </svg>
  )
}

function SidebarFilters({ filters }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(filters.map((f) => [f.label, f.defaultValue])),
  )

  return (
    <div className="flex flex-col gap-3.5">
      {filters.map((filter) => (
        <Select
          key={filter.label}
          label={filter.label}
          value={values[filter.label]}
          onChange={(v) => setValues((prev) => ({ ...prev, [filter.label]: v }))}
          options={filter.options}
        />
      ))}
    </div>
  )
}

export default function Sidebar({ collapsed = false, onNavigate }) {
  const location = useLocation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const filters = FILTER_CONFIG[location.pathname] || DEFAULT_FILTERS
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )

  return (
    <aside className="w-full h-full bg-gradient-to-b from-navy-950 to-navy-900 text-white flex flex-col overflow-hidden">
      <div
        className={`pt-6 pb-5 flex items-center gap-3 border-b border-white/10 ${
          collapsed ? 'px-0 justify-center' : 'px-5'
        }`}
      >
        <CityEmblem />
        {!collapsed && (
          <div className="leading-tight whitespace-nowrap">
            <div className="text-[10px] font-semibold tracking-wide text-slate-300">
              PEMERINTAH KOTA
            </div>
            <div className="text-[15px] font-bold tracking-wide text-white">
              PANGKALPINANG
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 pt-5 pb-3">
          <h1 className="text-[13px] font-bold text-white leading-tight">
            Dashboard Kepatuhan
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PKB, Opsen PKB &amp; SWDKLLJ
          </p>
        </div>
      )}

      <nav
        className={`flex flex-col gap-1 ${collapsed ? 'px-2 mt-4' : 'px-3'}`}
        aria-label="Navigasi utama"
      >
        {visibleNavItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 text-[13px] font-medium text-left transition-colors ${
                collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-brand-blue to-blue-500 text-white shadow-sidebarActive'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-5 mt-6">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 mb-3">
            FILTER WILAYAH
          </div>
          <SidebarFilters key={location.pathname} filters={filters} />
        </div>
      )}

      <div className="mt-auto relative">
        {!collapsed && (
          <div className="px-5 pb-4 pt-6 text-[10.5px] leading-relaxed text-slate-400 relative z-10 border-t border-white/10">
            <p>Data per : 20 Mei 2026</p>
            <p>Sumber : Bapenda, Jasa Raharja</p>
          </div>
        )}
        {!collapsed && (
          <div className="pointer-events-none">
            <SkylineIllustration />
          </div>
        )}
      </div>
    </aside>
  )
}
