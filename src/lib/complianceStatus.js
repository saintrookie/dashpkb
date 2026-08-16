export const COMPLIANCE_STATUS_LABELS = {
  very_good: 'Sangat Baik',
  good: 'Baik',
  fair: 'Cukup',
  low: 'Rendah',
  very_low: 'Sangat Rendah',
}

export function complianceStatusLabel(status) {
  return COMPLIANCE_STATUS_LABELS[status] ?? status
}

export const COMPLIANCE_STATUS_COLORS = {
  very_good: '#16a34a',
  good: '#86d78c',
  fair: '#eab308',
  low: '#f2760c',
  very_low: '#e0332f',
}

export function complianceStatusFromRate(rate) {
  if (rate >= 90) return 'very_good'
  if (rate >= 75) return 'good'
  if (rate >= 60) return 'fair'
  if (rate >= 45) return 'low'
  return 'very_low'
}
