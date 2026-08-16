import opdSeed from '../data/mock-api/opd.json'
import servicePointsSeed from '../data/mock-api/service-points.json'
import collectionPointsSeed from '../data/mock-api/collection-points.json'
import routesSeed from '../data/mock-api/routes.json'
import kecamatanGeo from '../data/geo/pangkalpinang-kecamatan.json'
import kelurahanGeo from '../data/geo/pangkalpinang-kelurahan.json'
import { kecamatanList } from '../data/kecamatan.js'
import { kelurahanList } from '../data/kelurahan.js'
import { colorForMetricValue, colorForRate, colorForEntityStatus } from '../lib/mapMetrics.js'

/**
 * Mock geographic data API. Mirrors the conventions of `services/mockApi.ts`
 * (simulated latency, {success,data,meta} envelope) but is kept as its own
 * module because geographic/business data here is a distinct domain from the
 * rest of the dashboard's mock API, and stays swappable for a real GIS
 * backend without touching map rendering code.
 */

const MAP_API_CONFIG = { delay: 350 }

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function nowIso() {
  return new Date().toISOString()
}

function success(data, meta = null) {
  return { success: true, data, meta: { total: Array.isArray(data) ? data.length : 1, lastUpdated: nowIso(), ...meta } }
}

async function request(handler) {
  await delay(MAP_API_CONFIG.delay)
  return handler()
}

function bboxContains(bbox, lat, lng) {
  if (!bbox) return true
  const [south, west, north, east] = bbox
  return lat >= south && lat <= north && lng >= west && lng <= east
}

function matchesSearch(haystack, query) {
  if (!query) return true
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
}

// ---------------------------------------------------------------------------
// Locations (unified marker entities: OPD, tax service points, collection points)
// ---------------------------------------------------------------------------

function opdToEntity(opd) {
  return {
    id: opd.id,
    entityType: 'opd',
    name: opd.name,
    code: opd.code,
    kecamatan: opd.kecamatan,
    latitude: opd.latitude,
    longitude: opd.longitude,
    status: opd.reportingStatus,
    complianceStatus: opd.complianceStatus,
    collectionRate: opd.collectionRate,
    color: colorForRate(opd.collectionRate),
    metrics: {
      vehicleCount: opd.vehicleCount,
      paidVehicleCount: opd.paidVehicleCount,
      unpaidVehicleCount: opd.unpaidVehicleCount,
      unpaidPotential: opd.unpaidPotential,
      revenue: opd.payment.pkb + opd.payment.opsenPkb,
    },
    raw: opd,
  }
}

function servicePointToEntity(sp) {
  return {
    id: sp.id,
    entityType: 'tax_service_point',
    name: sp.name,
    code: sp.code,
    kecamatan: sp.kecamatan,
    latitude: sp.latitude,
    longitude: sp.longitude,
    status: sp.status,
    complianceStatus: null,
    collectionRate: null,
    color: colorForEntityStatus(sp.status),
    metrics: {
      servicesToday: sp.servicesToday,
      avgQueueMinutes: sp.avgQueueMinutes,
      monthlyTransactions: sp.monthlyTransactions,
      monthlyRevenue: sp.monthlyRevenue,
    },
    raw: sp,
  }
}

function collectionPointToEntity(cp) {
  return {
    id: cp.id,
    entityType: 'collection_point',
    name: cp.name,
    code: cp.code,
    kecamatan: cp.kecamatan,
    latitude: cp.latitude,
    longitude: cp.longitude,
    status: cp.status,
    complianceStatus: null,
    collectionRate: cp.collectionRate,
    color: cp.status === 'active' ? colorForRate(cp.collectionRate) : colorForEntityStatus(cp.status),
    metrics: {
      targetVehicles: cp.targetVehicles,
      vehiclesCollected: cp.vehiclesCollected,
      unpaidVehicles: cp.unpaidVehicles,
      revenueCollected: cp.revenueCollected,
    },
    raw: cp,
  }
}

function buildAllEntities() {
  return [
    ...opdSeed.map(opdToEntity),
    ...servicePointsSeed.map(servicePointToEntity),
    ...collectionPointsSeed.map(collectionPointToEntity),
  ]
}

/**
 * @param {{ entityType?: string, status?: string, kecamatan?: string, search?: string, bbox?: [number,number,number,number] }} params
 */
export async function getLocations(params = {}) {
  return request(() => {
    let rows = buildAllEntities()
    if (params.entityType) rows = rows.filter((r) => r.entityType === params.entityType)
    if (params.status) rows = rows.filter((r) => r.status === params.status)
    if (params.kecamatan) rows = rows.filter((r) => r.kecamatan === params.kecamatan)
    if (params.search) rows = rows.filter((r) => matchesSearch(`${r.name} ${r.code}`, params.search))
    if (params.bbox) rows = rows.filter((r) => bboxContains(params.bbox, r.latitude, r.longitude))
    return success(rows)
  })
}

export async function getLocationById(id) {
  return request(() => {
    const entity = buildAllEntities().find((r) => r.id === id)
    return entity ? success(entity) : { success: false, data: null, meta: null }
  })
}

// ---------------------------------------------------------------------------
// Regions (GeoJSON boundaries joined with kecamatan/kelurahan stats)
// ---------------------------------------------------------------------------

function statsRange(list, key) {
  const values = list.map((r) => r[key])
  return { min: Math.min(...values), max: Math.max(...values) }
}

/**
 * @param {{ level?: 'kecamatan'|'kelurahan', kecamatanId?: string, metric?: string }} params
 */
export async function getRegions(params = {}) {
  return request(() => {
    const level = params.level ?? 'kecamatan'
    const metric = params.metric ?? 'collectionRate'
    const geo = level === 'kelurahan' ? kelurahanGeo : kecamatanGeo
    const statsList = level === 'kelurahan' ? kelurahanList : kecamatanList
    const nameKey = level === 'kelurahan' ? 'kelurahan' : 'kecamatan'

    const metricKeyMap = {
      collectionRate: 'collectionRate',
      vehicleCount: 'jumlahKendaraan',
      unpaidVehicles: 'belumBayar',
      unpaidPotential: 'potensiBelumBayar',
      revenue: 'penerimaanPkb',
    }
    const statsKey = metricKeyMap[metric] ?? 'collectionRate'
    const range = statsRange(statsList, statsKey)

    const statsByName = new Map(statsList.map((row) => [row[nameKey], row]))

    let features = geo.features
      .filter((f) => !params.kecamatanId || f.properties.kecamatanId === params.kecamatanId || f.properties.id === params.kecamatanId)
      .map((f) => {
        const stats = statsByName.get(f.properties.name)
        const metricValue = stats ? stats[statsKey] : 0
        return {
          ...f,
          properties: {
            ...f.properties,
            level,
            metric,
            metricValue,
            metricColor: colorForMetricValue(metric, metricValue, range),
            stats: stats ?? null,
          },
        }
      })

    return success({ type: 'FeatureCollection', features }, { total: features.length })
  })
}

export async function getRegionById(id, level = 'kecamatan') {
  return request(() => {
    const geo = level === 'kelurahan' ? kelurahanGeo : kecamatanGeo
    const statsList = level === 'kelurahan' ? kelurahanList : kecamatanList
    const nameKey = level === 'kelurahan' ? 'kelurahan' : 'kecamatan'
    const feature = geo.features.find((f) => f.properties.id === id)
    if (!feature) return { success: false, data: null, meta: null }
    const stats = statsList.find((row) => row[nameKey] === feature.properties.name) ?? null
    return success({ ...feature.properties, level, stats })
  })
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export async function getRoutes(params = {}) {
  return request(() => {
    let rows = routesSeed
    if (params.status) rows = rows.filter((r) => r.status === params.status)
    if (params.search) rows = rows.filter((r) => matchesSearch(r.name, params.search))
    return success(rows)
  })
}

// ---------------------------------------------------------------------------
// Heatmap (derived from marker entities, weighted per selected metric)
// ---------------------------------------------------------------------------

const HEATMAP_VALUE_GETTERS = {
  vehicleCount: (e) => e.metrics.vehicleCount ?? e.metrics.targetVehicles ?? 0,
  unpaidVehicles: (e) => e.metrics.unpaidVehicleCount ?? e.metrics.unpaidVehicles ?? 0,
  unpaidPotential: (e) => e.metrics.unpaidPotential ?? 0,
  revenue: (e) => e.metrics.revenue ?? e.metrics.monthlyRevenue ?? e.metrics.revenueCollected ?? 0,
  collectionRate: (e) => e.collectionRate ?? 0,
  paymentDensity: (e) => e.metrics.paidVehicleCount ?? e.metrics.vehiclesCollected ?? 0,
}

/**
 * @param {{ metric?: string }} params
 */
export async function getHeatmapData(params = {}) {
  return request(() => {
    const metric = params.metric ?? 'unpaidPotential'
    const getValue = HEATMAP_VALUE_GETTERS[metric] ?? HEATMAP_VALUE_GETTERS.unpaidPotential
    const entities = buildAllEntities().filter((e) => e.latitude && e.longitude)
    const values = entities.map(getValue)
    const max = Math.max(1, ...values)

    const points = entities.map((entity) => ({
      latitude: entity.latitude,
      longitude: entity.longitude,
      weight: Math.round((getValue(entity) / max) * 100) / 100,
      entityId: entity.id,
      entityName: entity.name,
    }))

    return success(points, { total: points.length, metric })
  })
}

// ---------------------------------------------------------------------------
// Search (OPD, kecamatan, kelurahan, service/collection points)
// ---------------------------------------------------------------------------

export async function searchMapEntities(query) {
  return request(() => {
    const q = query?.trim().toLowerCase()
    if (!q) return success([])

    const results = []

    for (const entity of buildAllEntities()) {
      if (`${entity.name} ${entity.code}`.toLowerCase().includes(q)) {
        results.push({
          id: entity.id,
          type: entity.entityType,
          label: entity.name,
          sublabel: entity.kecamatan,
          latitude: entity.latitude,
          longitude: entity.longitude,
          bbox: null,
        })
      }
    }

    for (const feature of kecamatanGeo.features) {
      if (feature.properties.name.toLowerCase().includes(q)) {
        results.push({
          id: feature.properties.id,
          type: 'kecamatan',
          label: feature.properties.name,
          sublabel: 'Kecamatan',
          latitude: feature.properties.centroid[0],
          longitude: feature.properties.centroid[1],
          bbox: feature.properties.bbox,
        })
      }
    }

    for (const feature of kelurahanGeo.features) {
      if (feature.properties.name.toLowerCase().includes(q)) {
        results.push({
          id: feature.properties.id,
          type: 'kelurahan',
          label: feature.properties.name,
          sublabel: `Kelurahan · ${feature.properties.kecamatanName}`,
          latitude: feature.properties.centroid[0],
          longitude: feature.properties.centroid[1],
          bbox: feature.properties.bbox,
        })
      }
    }

    return success(results.slice(0, 12))
  })
}
