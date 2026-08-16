import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import { Plus, Minus, RotateCcw, Locate, Maximize, Minimize } from 'lucide-react'
import { useStopMapEventPropagation } from '../mapControlUtils.js'

export default function MapControlPanel({ initialCenter, initialZoom }) {
  const map = useMap()
  const ref = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  useStopMapEventPropagation(ref)

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
      window.setTimeout(() => map.invalidateSize(), 150)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [map])

  function handleLocate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15),
      () => {},
    )
  }

  function handleFullscreen() {
    const container = map.getContainer()
    if (!document.fullscreenElement) container.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const buttons = [
    { icon: Plus, onClick: () => map.zoomIn(), label: 'Perbesar' },
    { icon: Minus, onClick: () => map.zoomOut(), label: 'Perkecil' },
    { icon: RotateCcw, onClick: () => map.setView(initialCenter, initialZoom), label: 'Reset Tampilan' },
    { icon: Locate, onClick: handleLocate, label: 'Lokasi Saya' },
    { icon: isFullscreen ? Minimize : Maximize, onClick: handleFullscreen, label: 'Layar Penuh' },
  ]

  return (
    <div ref={ref} className="absolute top-16 right-3 z-[1000] flex flex-col overflow-hidden rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card">
      {buttons.map(({ icon: Icon, onClick, label }, i) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          title={label}
          aria-label={label}
          className={`flex items-center justify-center w-9 h-9 text-slate-500 dark:text-slate-300 hover:text-brand-blue hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
            i > 0 ? 'border-t border-surface-border dark:border-white/10' : ''
          }`}
        >
          <Icon size={16} strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}
