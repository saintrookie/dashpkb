import { useEffect } from 'react'
import L from 'leaflet'

/** Stops Leaflet's own drag/zoom/click handling from firing when interacting
 * with a custom Tailwind control rendered inside the map container. */
export function useStopMapEventPropagation(ref) {
  useEffect(() => {
    if (!ref.current) return
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [ref])
}
