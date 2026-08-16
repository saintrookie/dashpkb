import { Info, Target } from 'lucide-react'

export default function InfoPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#eef4fd] dark:bg-brand-blue/10 border border-[#d7e6fb] dark:border-brand-blue/20 rounded-card px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-navy-800 text-brand-blue dark:text-blue-400 shrink-0">
          <Info size={14} strokeWidth={2} />
        </span>
        <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-navy-900 dark:text-white">Catatan: </span>
          Data collection rate dihitung berdasarkan realisasi pembayaran
          dibandingkan dengan jumlah tagihan (PKB + Opsen PKB + SWDKLLJ).
        </p>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-navy-800 text-brand-blue dark:text-blue-400 shrink-0">
          <Target size={14} strokeWidth={2} />
        </span>
        <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-navy-900 dark:text-white">Tujuan: </span>
          Memantau kinerja OPD dalam pembayaran pajak kendaraan dinas untuk
          optimalisasi PAD.
        </p>
      </div>
    </div>
  )
}
