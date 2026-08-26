import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './map.css'

import kecamatanGeo from '../../data/geo/pangkalpinang-kecamatan.json'
import { useTheme } from '../../hooks/useTheme.js'
import { useMapStore } from '../../store/mapStore.js'
import { tileProviderForTheme, BOUNDARY_DATA_ATTRIBUTION } from './config/tileProviders.js'

import RegionLayer from './layers/RegionLayer.jsx'
import MarkerLayer from './layers/MarkerLayer.jsx'
import HeatmapLayer from './layers/HeatmapLayer.jsx'
import RouteLayer from './layers/RouteLayer.jsx'
import MapControlPanel from './controls/MapControlPanel.jsx'
import MapToolbar from './controls/MapToolbar.jsx'
import MapLegend from './controls/MapLegend.jsx'

const DEFAULT_CENTER = (() => {
  const centroids = kecamatanGeo.features.map((f) => f.properties.centroid)
  const lat = centroids.reduce((a, c) => a + c[0], 0) / centroids.length
  const lng = centroids.reduce((a, c) => a + c[1], 0) / centroids.length
  return [lat, lng]
})()
const DEFAULT_ZOOM = 13

function FlyToController() {
  const map = useMap()
  const mapView = useMapStore((s) => s.mapView)

  useEffect(() => {
    if (!mapView.requestId) return
    if (mapView.bounds) {
      map.fitBounds(mapView.bounds, { padding: [40, 40], maxZoom: 16 })
    } else if (mapView.center) {
      map.flyTo(mapView.center, mapView.zoom ?? map.getZoom(), { duration: 0.8 })
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapView.requestId])

  return null
}

function ResizeAwareness() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer().parentElement
    if (!container || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

/**
 * Reusable OSM/Leaflet map component. Purely presentational: all geographic
 * and business data arrives via props (already fetched through `api/mapApi.js`
 * by the consuming page), so this component never hardcodes locations and can
 * be reused across dashboard pages with different data/config.
 */
export default function InteractiveMap({
  markers = null,
  regions = null,
  routes = null,
  heatmap = null,
  regionLevel = 'kecamatan',
  metric = 'collectionRate',
  selectedId = null,
  onMarkerClick,
  onRegionClick,
  onRouteClick,
  onSelectionChange,
  showMarkers = true,
  showRegions = true,
  showHeatmap = false,
  showRoutes = false,
  showToolbar = true,
  showControls = true,
  showLegend = true,
  layerScope,
  height = '600px',
  className = '',
}) {
  const { isDark } = useTheme()
  const tileStyleOverride = useMapStore((s) => s.tileStyleOverride)
  const selectEntity = useMapStore((s) => s.selectEntity)
  const storeSelectedId = useMapStore((s) => s.selectedEntityId)
  const storeSelectedType = useMapStore((s) => s.selectedEntityType)
  const provider = tileProviderForTheme(isDark, tileStyleOverride)
  const wrapperRef = useRef(null)
  const activeSelectedId = selectedId ?? storeSelectedId

  useEffect(() => {
    onSelectionChange?.({ id: storeSelectedId, type: storeSelectedType })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSelectedId, storeSelectedType])

  function handleMarkerClick(entity) {
    selectEntity(entity.id, entity.entityType)
    onMarkerClick?.(entity)
  }

  function handleRegionClick(feature) {
    selectEntity(feature.properties.id, feature.properties.level)
    onRegionClick?.(feature)
  }

  function handleRouteClick(route) {
    selectEntity(route.id, 'route')
    onRouteClick?.(route)
  }

  return (
    <div ref={wrapperRef} className={`relative isolate overflow-hidden rounded-card ${className}`} style={{ height }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        attributionControl
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          key={provider.id}
          url={provider.url}
          subdomains={provider.subdomains}
          maxZoom={provider.maxZoom}
          attribution={`${provider.attribution} &middot; ${BOUNDARY_DATA_ATTRIBUTION}`}
        />

        {showRegions && regions && (
          <RegionLayer data={regions} level={regionLevel} metric={metric} selectedId={activeSelectedId} onRegionClick={handleRegionClick} />
        )}
        {showHeatmap && heatmap && <HeatmapLayer points={heatmap} />}
        {showRoutes && routes && <RouteLayer routes={routes} selectedId={activeSelectedId} onRouteClick={handleRouteClick} />}
        {showMarkers && markers && <MarkerLayer entities={markers} selectedId={activeSelectedId} onEntityClick={handleMarkerClick} />}

        <FlyToController />
        <ResizeAwareness />
        {showControls && <MapControlPanel initialCenter={DEFAULT_CENTER} initialZoom={DEFAULT_ZOOM} />}
        {showToolbar && <MapToolbar layerScope={layerScope} />}
        {showLegend && <MapLegend metric={metric} />}
      </MapContainer>
    </div>
  )
}
