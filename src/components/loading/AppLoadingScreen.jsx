export default function AppLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-navy-950 to-navy-900 text-white"
    >
      <div className="w-11 h-11 rounded-full border-[3px] border-white/15 border-t-brand-blue animate-spin" />
      <div className="text-center">
        <div className="text-[13px] font-bold tracking-wide">
          TINGKAT KEPATUHAN OPD
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Memuat dashboard...</div>
      </div>
    </div>
  )
}
