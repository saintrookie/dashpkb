import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

const GRADIENT = { 0.2: '#1668e3', 0.4: '#16a34a', 0.6: '#eab308', 0.8: '#f2760c', 1.0: '#e0332f' }

export default function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points || points.length === 0) return undefined

    const latlngs = points.map((p) => [p.latitude, p.longitude, Math.max(0.08, p.weight)])
    const layer = L.heatLayer(latlngs, {
      radius: 30,
      blur: 24,
      maxZoom: 17,
      minOpacity: 0.35,
      gradient: GRADIENT,
    })
    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}
