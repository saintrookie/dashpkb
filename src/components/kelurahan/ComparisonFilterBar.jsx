import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import Card from '../ui/Card.jsx'
import SearchBar from '../table/SearchBar.jsx'
import { kecamatanList } from '../../data/kecamatan.js'

export const DEFAULT_COMPARISON_FILTERS = {
  kecamatan: 'Semua',
  search: '',
  sort: 'rate_desc',
}

const SORT_OPTIONS = [
  { value: 'rate_desc', label: 'Collection Rate (PKB)' },
  { value: 'penerimaan_desc', label: 'Penerimaan PKB' },
  { value: 'potensi_desc', label: 'Potensi Belum Bayar' },
  { value: 'kendaraan_desc', label: 'Jumlah Kendaraan' },
  { value: 'name_asc', label: 'Nama Kelurahan (A-Z)' },
]

function FilterSelect({ label, value, options, onChange, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-[12.5px] font-medium pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
      </span>
    </label>
  )
}

export default function ComparisonFilterBar({ filters, onChange }) {
  const kecamatanOptions = useMemo(
    () => [{ value: 'Semua', label: 'Semua Kecamatan' }, ...kecamatanList.map((k) => ({ value: k.kecamatan, label: k.kecamatan }))],
    [],
  )

  function patch(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card className="p-3.5 mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Kecamatan"
          value={filters.kecamatan}
          options={kecamatanOptions}
          onChange={(v) => patch('kecamatan', v)}
          className="w-full sm:w-52"
        />

        <div>
          <span className="block text-[11px] font-semibold text-transparent select-none mb-1.5">Cari</span>
          <SearchBar
            value={filters.search}
            onChange={(v) => patch('search', v)}
            placeholder="Cari Kelurahan..."
          />
        </div>

        <FilterSelect
          label="Urutkan Berdasarkan"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(v) => patch('sort', v)}
          className="w-full sm:w-56 sm:ml-auto"
        />
      </div>
    </Card>
  )
}
