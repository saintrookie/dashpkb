import { Construction } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'

export default function ComingSoonPage({ title, subtitle }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[360px]">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500">
          <Construction size={22} strokeWidth={1.75} />
        </span>
        <h2 className="text-[15px] font-bold text-navy-900 dark:text-white">Halaman Segera Hadir</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm">
          Halaman ini sedang dalam pengembangan dan akan tersedia pada pembaruan
          berikutnya.
        </p>
      </Card>
    </>
  )
}
