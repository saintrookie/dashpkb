import opdSeed from '../data/mock-api/opd.json'
import dashboardMeta from '../data/mock-api/dashboard.json'
import notificationsSeed from '../data/mock-api/notifications.json'
import usersSeed from '../data/mock-api/users.json'
import filtersSeed from '../data/mock-api/filters.json'
import metadataSeed from '../data/mock-api/metadata.json'

/**
 * Mock API adapter. This module is the only thing in the app that knows the
 * "backend" is local JSON — everything upstream (hooks, components) talks to
 * it through plain async functions that mirror a real REST client.
 */

export const MOCK_API_CONFIG = {
  enabled: true,
  delay: 500,
  failureRate: 0,
  simulateNetworkError: false,
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function nowIso() {
  return new Date().toISOString()
}

function success(data, message = 'Data retrieved successfully', meta = null) {
  return { success: true, message, data, meta, timestamp: nowIso() }
}

function failure(message, code, status) {
  return { success: false, message, error: { code, status }, timestamp: nowIso() }
}

async function request(handler) {
  if (MOCK_API_CONFIG.enabled) {
    await delay(MOCK_API_CONFIG.delay)
    if (MOCK_API_CONFIG.simulateNetworkError) {
      throw new Error('Network Error: tidak dapat terhubung ke server')
    }
    if (MOCK_API_CONFIG.failureRate > 0 && Math.random() < MOCK_API_CONFIG.failureRate) {
      return failure('Terjadi kesalahan pada server. Silakan coba lagi.', 'INTERNAL_SERVER_ERROR', 500)
    }
  }
  return handler()
}

function paginateList(items, query) {
  let result = query.filter ? items.filter(query.filter) : items

  const q = query.search?.trim().toLowerCase()
  if (q && query.searchFields?.length) {
    result = result.filter((item) =>
      query.searchFields.some((field) => String(item[field]).toLowerCase().includes(q)),
    )
  }

  if (query.sortBy) {
    const dir = query.sortDirection === 'asc' ? 1 : -1
    const key = query.sortBy
    result = [...result].sort((a, b) => {
      const av = query.getSortValue ? query.getSortValue(a, key) : a[key]
      const bv = query.getSortValue ? query.getSortValue(b, key) : b[key]
      if (av === bv) return 0
      return av < bv ? -1 * dir : 1 * dir
    })
  }

  const perPage = query.perPage ?? 10
  const page = Math.max(1, query.page ?? 1)
  const total = result.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const rows = result.slice((safePage - 1) * perPage, safePage * perPage)

  return { rows, meta: { page: safePage, perPage, total, totalPages } }
}

const opdList = opdSeed

function opdSortValue(opd, key) {
  if (key === 'totalBilling') return opd.billing.pkb + opd.billing.opsenPkb + opd.billing.swdkllj
  if (key === 'totalPayment') return opd.payment.pkb + opd.payment.opsenPkb + opd.payment.swdkllj
  return opd[key]
}

export async function getOpd(params = {}) {
  return request(() => {
    const { rows, meta } = paginateList(opdList, {
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      searchFields: ['name', 'code'],
      sortBy: params.sortBy ?? 'collectionRate',
      sortDirection: params.sortDirection ?? 'desc',
      getSortValue: opdSortValue,
      filter: (opd) =>
        (!params.status || opd.complianceStatus === params.status) &&
        (!params.reportingStatus || opd.reportingStatus === params.reportingStatus) &&
        (!params.kecamatan || opd.kecamatan === params.kecamatan),
    })
    const message = rows.length === 0 ? 'Tidak ada OPD yang cocok dengan pencarian' : 'Data OPD berhasil diambil'
    return success(rows, message, meta)
  })
}

export async function getOpdById(id) {
  return request(() => {
    const opd = opdList.find((row) => row.id === id)
    if (!opd) return failure('Data OPD tidak ditemukan', 'OPD_NOT_FOUND', 404)
    return success(opd, 'Data OPD berhasil diambil')
  })
}

function computeSummary(list) {
  const totalTagihan = list.reduce((a, o) => a + o.billing.pkb + o.billing.opsenPkb + o.billing.swdkllj, 0)
  const totalSudahBayar = list.reduce((a, o) => a + o.payment.pkb + o.payment.opsenPkb + o.payment.swdkllj, 0)
  const totalPenerimaanPkb = list.reduce((a, o) => a + o.payment.pkb, 0)
  const totalOpsenPkb = list.reduce((a, o) => a + o.payment.opsenPkb, 0)
  return {
    totalOpd: list.length,
    opdOnTime: list.filter((o) => o.reportingStatus === 'on_time').length,
    avgCollectionRate: Math.round((totalSudahBayar / totalTagihan) * 1000) / 10,
    totalTagihan,
    totalSudahBayar,
    totalPenerimaanPkb,
    totalOpsenPkb,
    totalPotensiBelumBayar: totalTagihan - totalSudahBayar,
  }
}

function deltaPercent(value, target) {
  return Math.round(((value - target) / target) * 1000) / 10
}

function buildKpi(summary, targets) {
  const avgCollectionRateDelta = deltaPercent(summary.avgCollectionRate, targets.avgCollectionRatePercent)
  const totalPkbDelta = deltaPercent(summary.totalPenerimaanPkb, targets.totalPenerimaanPkb)
  const totalOpsenDelta = deltaPercent(summary.totalOpsenPkb, targets.totalOpsenPkb)
  const unpaidPotentialDelta = deltaPercent(summary.totalPotensiBelumBayar, targets.maxPotensiBelumBayar)
  const onTimeDelta = deltaPercent(summary.opdOnTime, summary.totalOpd)

  return {
    avgCollectionRate: {
      value: summary.avgCollectionRate,
      target: targets.avgCollectionRatePercent,
      deltaPercent: avgCollectionRateDelta,
      negative: avgCollectionRateDelta < 0,
    },
    totalPkb: {
      value: summary.totalPenerimaanPkb,
      target: targets.totalPenerimaanPkb,
      deltaPercent: totalPkbDelta,
      negative: totalPkbDelta < 0,
    },
    totalOpsen: {
      value: summary.totalOpsenPkb,
      target: targets.totalOpsenPkb,
      deltaPercent: totalOpsenDelta,
      negative: totalOpsenDelta < 0,
    },
    unpaidPotential: {
      value: summary.totalPotensiBelumBayar,
      target: targets.maxPotensiBelumBayar,
      deltaPercent: unpaidPotentialDelta,
      negative: unpaidPotentialDelta > 0,
    },
    onTimeReporting: {
      value: summary.opdOnTime,
      target: summary.totalOpd,
      total: summary.totalOpd,
      deltaPercent: onTimeDelta,
      negative: onTimeDelta < 0,
    },
  }
}

function buildCharts(list) {
  const collectionRate = [...list]
    .sort((a, b) => b.collectionRate - a.collectionRate)
    .slice(0, 9)
    .map((o) => ({ opd: o.name, value: o.collectionRate, status: o.complianceStatus }))

  const revenue = [...list]
    .sort((a, b) => b.payment.pkb + b.payment.opsenPkb - (a.payment.pkb + a.payment.opsenPkb))
    .slice(0, 5)
    .map((o) => ({ opd: o.name, pkb: o.payment.pkb, opsenPkb: o.payment.opsenPkb }))

  const unpaidPotential = [...list]
    .sort((a, b) => b.unpaidPotential - a.unpaidPotential)
    .slice(0, 5)
    .map((o) => ({ opd: o.name, potential: o.unpaidPotential }))

  return { collectionRate, revenue, unpaidPotential }
}

export async function getDashboard(params = {}) {
  return request(() => {
    const summary = computeSummary(opdList)
    const kpi = buildKpi(summary, dashboardMeta.targets)
    const charts = buildCharts(opdList)
    const period = params.periodId
      ? (filtersSeed.periods.find((p) => p.id === params.periodId) ?? dashboardMeta.period)
      : dashboardMeta.period

    const data = {
      taxYear: params.taxYear ?? dashboardMeta.taxYear,
      period,
      lastUpdatedAt: dashboardMeta.lastUpdatedAt,
      summary,
      kpi,
      charts,
    }
    return success(data, 'Data dashboard berhasil diambil')
  })
}

export async function getDashboardSummary(params = {}) {
  const res = await getDashboard(params)
  if (!res.success) return res
  return success(res.data.summary, 'Ringkasan dashboard berhasil diambil')
}

export async function getCollectionRate(params = {}) {
  return request(() => {
    const points = buildCharts(opdList).collectionRate
    return success(params.limit ? points.slice(0, params.limit) : points, 'Data collection rate berhasil diambil')
  })
}

export async function getRevenue(params = {}) {
  return request(() => {
    const points = buildCharts(opdList).revenue
    return success(params.limit ? points.slice(0, params.limit) : points, 'Data penerimaan berhasil diambil')
  })
}

export async function getUnpaidPotential(params = {}) {
  return request(() => {
    const points = buildCharts(opdList).unpaidPotential
    return success(
      params.limit ? points.slice(0, params.limit) : points,
      'Data potensi belum bayar berhasil diambil',
    )
  })
}

let notificationsStore = notificationsSeed.map((n) => ({ ...n }))

export async function getNotifications(params = {}) {
  return request(() => {
    const { rows, meta } = paginateList(notificationsStore, {
      page: params.page,
      perPage: params.perPage ?? notificationsStore.length,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      filter: (n) => (params.isRead === undefined || n.isRead === params.isRead) && (!params.type || n.type === params.type),
    })
    return success(rows, 'Data notifikasi berhasil diambil', meta)
  })
}

export async function markNotificationAsRead(id) {
  return request(() => {
    const notification = notificationsStore.find((n) => n.id === id)
    if (!notification) return failure('Notifikasi tidak ditemukan', 'NOTIFICATION_NOT_FOUND', 404)
    notification.isRead = true
    return success(notification, 'Notifikasi ditandai sudah dibaca')
  })
}

export async function markAllNotificationsAsRead() {
  return request(() => {
    notificationsStore = notificationsStore.map((n) => ({ ...n, isRead: true }))
    return success(notificationsStore, 'Semua notifikasi ditandai sudah dibaca')
  })
}

const usersList = usersSeed
let sessionUserId = null

function toSafeUser(user) {
  const { password: _password, username: _username, ...safe } = user
  void _password
  void _username
  return safe
}

export function setSession(id) {
  sessionUserId = id
}

export async function login(params) {
  return request(() => {
    const identifier = params.identifier.trim().toLowerCase()
    const match = usersList.find(
      (u) =>
        (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) &&
        u.password === params.password,
    )
    if (!match) return failure('Username/email atau password yang Anda masukkan salah.', 'INVALID_CREDENTIALS', 401)
    sessionUserId = match.id
    return success(toSafeUser(match), 'Login berhasil')
  })
}

export async function logout() {
  return request(() => {
    sessionUserId = null
    return success(null, 'Logout berhasil')
  })
}

export async function getCurrentUser(id) {
  return request(() => {
    const targetId = id ?? sessionUserId
    if (!targetId) return failure('Sesi tidak ditemukan. Silakan masuk kembali.', 'UNAUTHENTICATED', 401)
    const match = usersList.find((u) => u.id === targetId)
    if (!match) return failure('Pengguna tidak ditemukan', 'USER_NOT_FOUND', 404)
    return success(toSafeUser(match), 'Data pengguna berhasil diambil')
  })
}

export async function getDemoAccounts() {
  return request(() => {
    const accounts = usersList.map((u) => ({ name: u.name, username: u.username, password: u.password, role: u.role }))
    return success(accounts, 'Daftar akun demo berhasil diambil')
  })
}

export async function getFilters() {
  return request(() => success(filtersSeed, 'Data filter berhasil diambil'))
}

export async function getMetadata() {
  return request(() => success(metadataSeed, 'Metadata aplikasi berhasil diambil'))
}
