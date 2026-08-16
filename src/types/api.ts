export interface ApiMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ApiError {
  code: string
  status: number
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
  meta: ApiMeta | null
  timestamp: string
}

export interface ApiFailure {
  success: false
  message: string
  error: ApiError
  timestamp: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type ComplianceStatus = 'very_good' | 'good' | 'fair' | 'low' | 'very_low'
export type ReportingStatus = 'on_time' | 'late'

export interface OpdBreakdown {
  pkb: number
  opsenPkb: number
  swdkllj: number
}

export interface Opd {
  id: string
  code: string
  name: string
  kecamatan: string
  vehicleCount: number
  paidVehicleCount: number
  unpaidVehicleCount: number
  collectionRate: number
  billing: OpdBreakdown
  payment: OpdBreakdown
  unpaidPotential: number
  reportingStatus: ReportingStatus
  complianceStatus: ComplianceStatus
  lastPaymentDate: string
}

export interface OpdQueryParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: keyof Opd | 'totalBilling' | 'totalPayment'
  sortDirection?: 'asc' | 'desc'
  status?: ComplianceStatus
  reportingStatus?: ReportingStatus
  kecamatan?: string
}

export interface DashboardPeriod {
  id: string
  label: string
  startDate: string
  endDate: string
}

export interface KpiCardData {
  value: number
  target: number
  deltaPercent: number
  negative: boolean
}

export interface DashboardKpi {
  avgCollectionRate: KpiCardData
  totalPkb: KpiCardData
  totalOpsen: KpiCardData
  unpaidPotential: KpiCardData
  onTimeReporting: KpiCardData & { total: number }
}

export interface DashboardSummary {
  totalOpd: number
  opdOnTime: number
  avgCollectionRate: number
  totalTagihan: number
  totalSudahBayar: number
  totalPenerimaanPkb: number
  totalOpsenPkb: number
  totalPotensiBelumBayar: number
}

export interface CollectionRatePoint {
  opd: string
  value: number
  status: ComplianceStatus
}

export interface RevenuePoint {
  opd: string
  pkb: number
  opsenPkb: number
}

export interface UnpaidPotentialPoint {
  opd: string
  potential: number
}

export interface DashboardCharts {
  collectionRate: CollectionRatePoint[]
  revenue: RevenuePoint[]
  unpaidPotential: UnpaidPotentialPoint[]
}

export interface DashboardData {
  taxYear: number
  period: DashboardPeriod
  lastUpdatedAt: string
  summary: DashboardSummary
  kpi: DashboardKpi
  charts: DashboardCharts
}

export interface DashboardQueryParams {
  taxYear?: number
  periodId?: string
}

export type NotificationType =
  | 'payment_alert'
  | 'system_update'
  | 'data_update'
  | 'report_ready'
  | 'reminder'
  | 'information'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  relatedOpdId: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationQueryParams {
  page?: number
  perPage?: number
  isRead?: boolean
  type?: NotificationType
}

export interface CurrentUser {
  id: string
  name: string
  username: string
  email: string
  role: string
  department: string
  avatar: string
  permissions: string[]
}

export interface LoginParams {
  identifier: string
  password: string
}

export interface FilterPeriod {
  id: string
  label: string
  date: string
}

export interface FilterOption {
  value: string
  label: string
}

export interface FiltersData {
  taxYears: number[]
  periods: FilterPeriod[]
  complianceStatuses: FilterOption[]
  reportingStatuses: FilterOption[]
  kecamatan: string[]
  kelurahan: Record<string, string[]>
}
