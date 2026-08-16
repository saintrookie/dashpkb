import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-56 rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-900 pl-9 pr-3 py-2 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
      />
    </label>
  )
}
