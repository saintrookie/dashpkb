import { Lightbulb, ClipboardList } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { kelurahanList, kelurahanSummary, rateRangeDistribution } from '../../data/kelurahan.js'
import { formatPercent } from '../../lib/format.js'

const best = kelurahanList[0]
const belowSixty = rateRangeDistribution.find((d) => d.key === 'lt60')?.kelurahanCount ?? 0

const INSIGHTS = [
  `Kelurahan ${best.kelurahan} (${best.kecamatan}) memiliki tingkat kepatuhan tertinggi sebesar ${formatPercent(best.collectionRate)}.`,
  `Masih terdapat ${belowSixty} kelurahan dengan collection rate di bawah 60% dari total ${kelurahanSummary.totalKelurahan} kelurahan yang perlu menjadi prioritas penagihan.`,
]

const RECOMMENDATIONS = [
  'Fokus penagihan pada 5 kelurahan dengan collection rate terendah.',
  'Optimalkan pemanfaatan data PBB dan kolaborasi RT/RW untuk peningkatan kepatuhan.',
]

export default function InsightRecommendationPanel() {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-status-yellowBg dark:bg-status-yellow/10 text-status-yellow shrink-0">
            <Lightbulb size={15} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-1.5">INSIGHT</h3>
            <ul className="space-y-1">
              {INSIGHTS.map((text) => (
                <li key={text} className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue shrink-0">
            <ClipboardList size={15} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-1.5">REKOMENDASI</h3>
            <ul className="space-y-1">
              {RECOMMENDATIONS.map((text) => (
                <li key={text} className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
