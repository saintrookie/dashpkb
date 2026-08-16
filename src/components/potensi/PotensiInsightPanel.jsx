import { Lightbulb, ClipboardList } from 'lucide-react'
import Card from '../ui/Card.jsx'
import { formatPercent, formatRupiahAuto } from '../../lib/format.js'

export default function PotensiInsightPanel({ summary }) {
  const topKecamatan = summary.byKecamatan[0]
  const longOverduePercent = summary.byTunggakanBucket
    .filter((b) => b.key !== 'y1_2')
    .reduce((a, b) => a + b.percent, 0)

  const insights = topKecamatan
    ? [
        `Potensi penagihan terbesar terdapat di Kecamatan ${topKecamatan.kecamatan} sebesar ${formatRupiahAuto(topKecamatan.potensi)} (${formatPercent((topKecamatan.potensi / summary.totalPotensi) * 100)} dari total potensi).`,
        `${formatPercent(longOverduePercent)} potensi berasal dari kendaraan dengan tunggakan lebih dari 2 tahun.`,
      ]
    : ['Belum ada data potensi penagihan untuk filter yang dipilih.']

  const recommendations = [
    'Fokus penagihan pada wilayah dengan potensi tertinggi dan tunggakan lebih dari 2 tahun.',
    'Manfaatkan data alamat PBB untuk penagihan door to door dan WA Blast.',
  ]

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
              {insights.map((text) => (
                <li
                  key={text}
                  className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
                >
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
            <h3 className="text-[12.5px] font-bold text-navy-900 dark:text-white tracking-wide mb-1.5">
              REKOMENDASI
            </h3>
            <ul className="space-y-1">
              {recommendations.map((text) => (
                <li
                  key={text}
                  className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400"
                >
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
