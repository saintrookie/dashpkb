import { useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import { useTheme } from '../../../hooks/useTheme.js'
import { formatPercent, formatNumberID, formatRupiahAuto } from '../../../lib/format.js'
import { MAP_METRICS } from '../../../lib/mapMetrics.js'

function formatMetricValue(metric, value) {
  const config = MAP_METRICS[metric] ?? MAP_METRICS.collectionRate
  if (config.kind === 'percent') return formatPercent(value)
  if (config.kind === 'currency') return formatRupiahAuto(value)
  return `${formatNumberID(value)} unit`
}

export default function RegionLayer({ data, level, metric, selectedId, onRegionClick }) {
  const map = useMap()
  const { isDark } = useTheme()

  const strokeColor = isDark ? '#3b5a9a' : '#ffffff'
  const strokeColorSelected = '#1668e3'

  const style = useMemo(
    () => (feature) => {
      const isSelected = feature.properties.id === selectedId
      return {
        fillColor: feature.properties.metricColor,
        fillOpacity: isSelected ? 0.72 : 0.5,
        color: isSelected ? strokeColorSelected : strokeColor,
        weight: isSelected ? 3 : 1.25,
      }
    },
    [selectedId, strokeColor],
  )

  function onEachFeature(feature, layer) {
    const { name, metricValue } = feature.properties
    layer.bindTooltip(`<strong>${name}</strong><br/>${formatMetricValue(metric, metricValue)}`, {
      sticky: true,
      className: 'map-region-tooltip',
    })

    layer.on({
      mouseover: () => {
        layer.setStyle({ fillOpacity: 0.78, weight: 2.5 })
        layer.bringToFront()
      },
      mouseout: () => {
        layer.setStyle(style(feature))
      },
      click: () => {
        onRegionClick?.(feature)
        const bounds = layer.getBounds()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 })
      },
    })
  }

  if (!data) return null

  return (
    <GeoJSON
      key={`${level}-${metric}-${data.features.length}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
      className="map-region-path"
    />
  )
}
