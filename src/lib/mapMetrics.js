import { COMPLIANCE_STATUS_LABELS } from './complianceStatus.js'

// Same 5-band semantic taxonomy the rest of the dashboard already uses
// (very_good/good/fair/low/very_low), colored as requested for map contexts:
// green -> blue -> yellow -> orange -> red.
export const METRIC_BAND_COLORS = {
  very_good: '#16a34a',
  good: '#1668e3',
  fair: '#eab308',
  low: '#f2760c',
  very_low: '#e0332f',
}

const BAND_ORDER = ['very_good', 'good', 'fair', 'low', 'very_low']

export function bandForRate(value) {
  if (value >= 90) return 'very_good'
  if (value >= 75) return 'good'
  if (value >= 60) return 'fair'
  if (value >= 45) return 'low'
  return 'very_low'
}

export function colorForBand(band) {
  return METRIC_BAND_COLORS[band] ?? '#94a3b8'
}

export function colorForRate(value) {
  return colorForBand(bandForRate(value))
}

export const RATE_BAND_LEGEND = BAND_ORDER.map((band) => ({
  band,
  label: COMPLIANCE_STATUS_LABELS[band],
  color: METRIC_BAND_COLORS[band],
  threshold:
    band === 'very_good' ? '≥ 90%' : band === 'good' ? '75% – 89%' : band === 'fair' ? '60% – 74%' : band === 'low' ? '45% – 59%' : '< 45%',
}))

// Metrics that can drive region choropleth / heatmap coloring. `direction`
// tells the quantile banding below whether high values are good (green) or
// bad (red) for that particular metric.
export const MAP_METRICS = {
  collectionRate: { id: 'collectionRate', label: 'Collection Rate', unit: '%', kind: 'percent', direction: 'higher-better' },
  vehicleCount: { id: 'vehicleCount', label: 'Jumlah Kendaraan', unit: 'unit', kind: 'count', direction: 'higher-better' },
  unpaidVehicles: { id: 'unpaidVehicles', label: 'Kendaraan Belum Bayar', unit: 'unit', kind: 'count', direction: 'lower-better' },
  unpaidPotential: { id: 'unpaidPotential', label: 'Potensi Belum Bayar', unit: 'Rp', kind: 'currency', direction: 'lower-better' },
  revenue: { id: 'revenue', label: 'Penerimaan PKB', unit: 'Rp', kind: 'currency', direction: 'higher-better' },
}

export function metricLegend(metricId) {
  const metric = MAP_METRICS[metricId] ?? MAP_METRICS.collectionRate
  if (metric.kind === 'percent') return RATE_BAND_LEGEND

  const order = metric.direction === 'higher-better' ? BAND_ORDER : [...BAND_ORDER].reverse()
  const quintileLabel = ['Tertinggi', 'Tinggi', 'Menengah', 'Rendah', 'Terendah']
  return order.map((band, i) => ({
    band,
    label: `${quintileLabel[i]} (${COMPLIANCE_STATUS_LABELS[BAND_ORDER[i]]})`,
    color: METRIC_BAND_COLORS[BAND_ORDER[i]],
  }))
}

/**
 * Bands a raw value into one of the 5 semantic colors relative to a dataset's
 * [min,max] range (equal-interval quintiles), honoring metric direction.
 */
export function bandForValueInRange(value, min, max, direction = 'higher-better') {
  if (max <= min) return 'fair'
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const ranked = direction === 'higher-better' ? t : 1 - t
  if (ranked >= 0.8) return 'very_good'
  if (ranked >= 0.6) return 'good'
  if (ranked >= 0.4) return 'fair'
  if (ranked >= 0.2) return 'low'
  return 'very_low'
}

export function colorForMetricValue(metricId, value, range) {
  const metric = MAP_METRICS[metricId] ?? MAP_METRICS.collectionRate
  if (metric.kind === 'percent') return colorForRate(value)
  const { min, max } = range ?? { min: 0, max: Math.max(1, value) }
  return colorForBand(bandForValueInRange(value, min, max, metric.direction))
}

export const STATUS_COLORS = {
  active: '#1668e3',
  maintenance: '#f2760c',
  planned: '#94a3b8',
  inactive: '#64748b',
}

export function colorForEntityStatus(status) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.inactive
}
