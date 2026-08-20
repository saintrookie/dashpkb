import { useMemo, useState } from 'react'
import { ChevronDown, RotateCcw, Filter } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { kecamatanList } from '../../data/kecamatan.js'
import { kelurahanList } from '../../data/kelurahan.js'
import { JENIS_KENDARAAN } from '../../data/kendaraan.js'
import { TUNGGAKAN_BUCKETS, REVENUE_TYPES } from '../../data/potensiPenagihan.js'

// Pemkot only owns the Opsen PKB share of vehicle tax (PKB itself is
// provincial revenue, SWDKLLJ is Jasa Raharja's), so that role only ever
// gets that one option — Admin sees every revenue type.
const PEMKOT_REVENUE_OPTIONS = ['Opsen PKB']

export function getDefaultPotensiFilters(role) {
  return {
    kecamatan: 'Semua',
    kelurahan: 'Semua',
    jenis: 'Semua',
    tunggakan: 'Semua',
    jenisPendapatan: role === 'Pemkot' ? 'Opsen PKB' : 'Semua',
  }
}

const JENIS_OPTIONS = ['Semua', ...JENIS_KENDARAAN.map((j) => j.label)]
const TUNGGAKAN_OPTIONS = ['Semua', ...TUNGGAKAN_BUCKETS.map((b) => b.label)]

function FilterSelect({ label, value, options, onChange, className = '' }) {
  const locked = options.length <= 1
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className="w-full appearance-none rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-900 text-navy-900 dark:text-white text-[12.5px] font-medium pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {!locked && (
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
        )}
      </span>
    </label>
  )
}

export default function PotensiFilterBar({ onApply }) {
  const role = useAuthStore((s) => s.user?.role)
  const revenueOptions = role === 'Pemkot' ? PEMKOT_REVENUE_OPTIONS : REVENUE_TYPES
  const defaultFilters = useMemo(() => getDefaultPotensiFilters(role), [role])
  const [draft, setDraft] = useState(defaultFilters)

  const kecamatanOptions = useMemo(() => ['Semua', ...kecamatanList.map((k) => k.kecamatan)], [])

  const kelurahanOptions = useMemo(() => {
    const rows =
      draft.kecamatan === 'Semua'
        ? kelurahanList
        : kelurahanList.filter((r) => r.kecamatan === draft.kecamatan)
    return ['Semua', ...rows.map((r) => r.kelurahan).sort((a, b) => a.localeCompare(b, 'id'))]
  }, [draft.kecamatan])

  function patch(key, value) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'kecamatan') next.kelurahan = 'Semua'
      return next
    })
  }

  function handleReset() {
    setDraft(defaultFilters)
    onApply(defaultFilters)
  }

  function handleApply() {
    onApply(draft)
  }

  return (
    <Card className="p-3.5 mb-4">
      <div className="flex items-end flex-wrap gap-3">
        <FilterSelect
          label="Kecamatan"
          value={draft.kecamatan}
          options={kecamatanOptions}
          onChange={(v) => patch('kecamatan', v)}
          className="w-full sm:w-40"
        />
        <FilterSelect
          label="Kelurahan"
          value={draft.kelurahan}
          options={kelurahanOptions}
          onChange={(v) => patch('kelurahan', v)}
          className="w-full sm:w-40"
        />
        <FilterSelect
          label="Jenis Pendapatan"
          value={draft.jenisPendapatan}
          options={revenueOptions}
          onChange={(v) => patch('jenisPendapatan', v)}
          className="w-full sm:w-40"
        />
        <FilterSelect
          label="Jenis Kendaraan"
          value={draft.jenis}
          options={JENIS_OPTIONS}
          onChange={(v) => patch('jenis', v)}
          className="w-full sm:w-44"
        />
        <FilterSelect
          label="Status Tunggakan"
          value={draft.tunggakan}
          options={TUNGGAKAN_OPTIONS}
          onChange={(v) => patch('tunggakan', v)}
          className="w-full sm:w-44"
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="primary" icon={Filter} onClick={handleApply}>
            Terapkan Filter
          </Button>
          <Button variant="outline" icon={RotateCcw} onClick={handleReset}>
            Reset Filter
          </Button>
        </div>
      </div>
    </Card>
  )
}
