import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// items: [{ label, to? }] — the last item (no `to`) renders as plain text.
export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-blue hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-navy-900 dark:text-white font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
