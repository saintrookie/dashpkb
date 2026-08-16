import { useMemo, useState } from 'react'
import { ChevronDown, RotateCcw, Filter } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { kecamatanList } from '../../data/kecamatan.js'
import { kelurahanList } from '../../data/kelurahan.js'
import { JENIS_KENDARAAN } from '../../data/kendaraan.js'

export const DEFAULT_VEHICLE_FILTERS = {
  kecamatan: 'Semua',
  kelurahan: 'Semua',
  jenis: 'Semua',
  status: 'Semua',
}

const JENIS_OPTIONS = ['Semua', ...JENIS_KENDARAAN.map((j) => j.label)]
const STATUS_OPTIONS = ['Semua', 'Lunas', 'Belum Lunas']

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="block">
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

export default function VehicleFilterPanel({ onApply }) {
  const [draft, setDraft] = useState(DEFAULT_VEHICLE_FILTERS)

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
    setDraft(DEFAULT_VEHICLE_FILTERS)
    onApply(DEFAULT_VEHICLE_FILTERS)
  }

  function handleApply() {
    onApply(draft)
  }

  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-1.5 mb-3.5">
        <Filter size={14} className="text-slate-400 dark:text-slate-500" />
        <h2 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide">
          FILTER DATA KENDARAAN
        </h2>
      </div>

      <div className="flex flex-col gap-3.5 flex-1">
        <FilterSelect
          label="Kecamatan"
          value={draft.kecamatan}
          options={kecamatanOptions}
          onChange={(v) => patch('kecamatan', v)}
        />
        <FilterSelect
          label="Kelurahan"
          value={draft.kelurahan}
          options={kelurahanOptions}
          onChange={(v) => patch('kelurahan', v)}
        />
        <FilterSelect
          label="Jenis Kendaraan"
          value={draft.jenis}
          options={JENIS_OPTIONS}
          onChange={(v) => patch('jenis', v)}
        />
        <FilterSelect
          label="Status Bayar"
          value={draft.status}
          options={STATUS_OPTIONS}
          onChange={(v) => patch('status', v)}
        />
      </div>

      <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-surface-border dark:border-white/10">
        <Button variant="outline" icon={RotateCcw} onClick={handleReset} className="justify-center">
          Reset Filter
        </Button>
        <Button variant="primary" onClick={handleApply} className="justify-center">
          Terapkan Filter
        </Button>
      </div>
    </Card>
  )
}
