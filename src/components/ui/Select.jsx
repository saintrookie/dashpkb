import { ChevronDown } from 'lucide-react'

export default function Select({ label, value, options = [], onChange }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full appearance-none rounded-lg bg-navy-800/70 border border-white/10 text-white text-sm font-medium pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/60 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-navy-900">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </span>
    </label>
  )
}
