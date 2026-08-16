import L from 'leaflet'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Building2, Landmark, Wallet, Navigation, Flag } from 'lucide-react'

const ENTITY_ICON_COMPONENT = {
  opd: Building2,
  tax_service_point: Landmark,
  collection_point: Wallet,
}

function iconSvg(Component, props) {
  return renderToStaticMarkup(createElement(Component, props))
}

/**
 * Custom divIcon for marker entities (OPD / tax service points / collection
 * points). Shape (via the Lucide glyph) plus a status/compliance color plus
 * hover/selected ring states -- color is never the only signal.
 */
export function createEntityDivIcon({ entityType, color, selected = false, hovered = false, size = 30 }) {
  const IconComponent = ENTITY_ICON_COMPONENT[entityType] ?? Building2
  const glyph = iconSvg(IconComponent, { size: Math.round(size * 0.52), strokeWidth: 2.25, color: '#ffffff' })
  const stateClass = selected ? 'is-selected' : hovered ? 'is-hovered' : ''

  const html = `<div class="map-marker ${stateClass}" style="--marker-color:${color};width:${size}px;height:${size}px;">
    <span class="map-marker__glyph">${glyph}</span>
  </div>`

  return L.divIcon({
    html,
    className: 'map-marker-wrapper',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  })
}

export function createRouteEndpointIcon(kind, color) {
  const IconComponent = kind === 'start' ? Navigation : Flag
  const glyph = iconSvg(IconComponent, { size: 13, strokeWidth: 2.5, color: '#ffffff' })
  const html = `<div class="map-route-endpoint" style="--marker-color:${color};">${glyph}</div>`
  return L.divIcon({
    html,
    className: 'map-marker-wrapper',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  })
}

/** Custom cluster badge for react-leaflet-cluster, styled to the dashboard palette. */
export function createClusterIcon(cluster) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 34 : count < 30 ? 40 : 46
  return L.divIcon({
    html: `<div class="map-cluster" style="width:${size}px;height:${size}px;"><span>${count}</span></div>`,
    className: 'map-marker-wrapper',
    iconSize: [size, size],
  })
}
