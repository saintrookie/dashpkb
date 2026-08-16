import { create } from 'zustand'

const DEFAULT_ACTIVE_LAYERS = {
  opd: true,
  taxServicePoints: true,
  collectionPoints: false,
  kecamatan: true,
  kelurahan: false,
  heatmap: false,
  routes: false,
}

/**
 * Shared selection/layer state for the map feature. Bridges InteractiveMap,
 * the KPI row, mini chart, and table on PetaWilayahPage (and the lightweight
 * map instance embedded in RingkasanKecamatanPage) without threading props
 * through every level or duplicating filter state per component.
 */
export const useMapStore = create((set) => ({
  selectedEntityId: null,
  selectedEntityType: null, // 'opd' | 'tax_service_point' | 'collection_point' | 'kecamatan' | 'kelurahan' | 'route'

  activeLayers: DEFAULT_ACTIVE_LAYERS,
  activeMetric: 'collectionRate',
  regionLevel: 'kecamatan',
  tileStyleOverride: null, // null = auto-follow dashboard theme

  mapView: { center: null, zoom: null, bounds: null, requestId: 0 },
  detailPanelOpen: false,

  selectEntity: (id, type) =>
    set({ selectedEntityId: id, selectedEntityType: type, detailPanelOpen: id != null }),

  clearSelection: () => set({ selectedEntityId: null, selectedEntityType: null, detailPanelOpen: false }),

  closeDetailPanel: () => set({ detailPanelOpen: false }),

  toggleLayer: (name) =>
    set((state) => {
      const nextValue = !state.activeLayers[name]
      const nextLayers = { ...state.activeLayers, [name]: nextValue }
      // Kecamatan/kelurahan choropleths overlap geographically -- keep only
      // one active at a time so polygons never double-render on top of each other.
      if (name === 'kelurahan' && nextValue) nextLayers.kecamatan = false
      if (name === 'kecamatan' && nextValue) nextLayers.kelurahan = false
      return { activeLayers: nextLayers }
    }),

  setLayer: (name, value) => set((state) => ({ activeLayers: { ...state.activeLayers, [name]: value } })),

  setMetric: (metric) => set({ activeMetric: metric }),

  setTileStyleOverride: (style) => set({ tileStyleOverride: style }),

  setRegionLevel: (level) => set({ regionLevel: level }),

  flyTo: (center, zoom, bounds = null) =>
    set((state) => ({ mapView: { center, zoom, bounds, requestId: state.mapView.requestId + 1 } })),

  resetView: () => set((state) => ({ mapView: { center: null, zoom: null, bounds: null, requestId: state.mapView.requestId + 1 } })),
}))
