import { Clock3 } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import ComingSoonIllustration from '../components/illustrations/ComingSoonIllustration.jsx'

export default function ComingSoonPage({ title, subtitle }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="px-10 py-14 flex flex-col items-center justify-center text-center min-h-[420px] overflow-hidden">
        <ComingSoonIllustration className="w-44 sm:w-52 h-auto text-brand-blue dark:text-brand-blueLight shrink-0" />

        <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blueLight/10 px-3 py-1 text-[11px] font-semibold text-brand-blue dark:text-brand-blueLight">
          <Clock3 size={12} strokeWidth={2.25} />
          Segera Hadir
        </span>

        <h2 className="mt-3 text-[17px] font-bold text-navy-900 dark:text-white">
          {title || 'Halaman Ini'} Sedang Dalam Pengembangan
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
          Kami sedang menyiapkan halaman ini agar dapat memberikan pengalaman terbaik.
          Fitur ini akan tersedia pada pembaruan berikutnya.
        </p>
      </Card>
    </>
  )
}
