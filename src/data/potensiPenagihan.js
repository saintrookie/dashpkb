import { getKendaraanListForYear } from './kendaraan.js'
import { BASELINE_TAX_YEAR } from './kecamatan.js'

export async function getPotensiRowsForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const rows = await getKendaraanListForYear(year, periodId)
  return rows.filter((row) => row.statusBayar === 'Belum Lunas')
}

export const TUNGGAKAN_BUCKETS = [
  { key: 'y1_2', label: '1 - 2 Tahun', min: 1, max: 2, color: '#f2760c' },
  { key: 'y3_5', label: '3 - 5 Tahun', min: 3, max: 5, color: '#eab308' },
  { key: 'y6plus', label: '> 5 Tahun', min: 6, max: Infinity, color: '#16a34a' },
]

export function bucketForTunggakan(years) {
  return TUNGGAKAN_BUCKETS.find((b) => years >= b.min && years <= b.max)
}

export const REVENUE_TYPES = ['Semua', 'PKB', 'Opsen PKB', 'SWDKLLJ']

// Selecting a revenue type doesn't drop any rows (every unpaid vehicle owes
// all three at once) — it changes which of the three amounts counts toward
// "potensi" everywhere below, so e.g. filtering to "Opsen PKB" zeroes out
// the PKB/SWDKLLJ shares rather than filtering out vehicles.
function revenueAmounts(row, revenueType) {
  if (revenueType === 'PKB') return { pkb: row.pkb, opsenPkb: 0, swdkllj: 0 }
  if (revenueType === 'Opsen PKB') return { pkb: 0, opsenPkb: row.opsenPkb, swdkllj: 0 }
  if (revenueType === 'SWDKLLJ') return { pkb: 0, opsenPkb: 0, swdkllj: row.swdkllj }
  return { pkb: row.pkb, opsenPkb: row.opsenPkb, swdkllj: row.swdkllj }
}

function rowPotensi(row, revenueType) {
  const amt = revenueAmounts(row, revenueType)
  return amt.pkb + amt.opsenPkb + amt.swdkllj
}

function groupByRegion(rows, revenueType, keyFn, labelFields) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (!groups.has(key)) {
      groups.set(key, { ...labelFields(row), potensi: 0, kendaraan: 0, tunggakanTotal: 0 })
    }
    const g = groups.get(key)
    g.potensi += rowPotensi(row, revenueType)
    g.kendaraan += 1
    g.tunggakanTotal += row.tunggakanTahun
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      avgPotensiPerKendaraan: g.kendaraan ? g.potensi / g.kendaraan : 0,
      avgTunggakanTahun: g.kendaraan ? g.tunggakanTotal / g.kendaraan : 0,
    }))
    .sort((a, b) => b.potensi - a.potensi)
}

export function summarizePotensi(rows, revenueType = 'Semua') {
  const total = rows.length
  let potensiPkb = 0
  let potensiOpsenPkb = 0
  let potensiSwdkllj = 0

  for (const row of rows) {
    const amt = revenueAmounts(row, revenueType)
    potensiPkb += amt.pkb
    potensiOpsenPkb += amt.opsenPkb
    potensiSwdkllj += amt.swdkllj
  }

  const totalPotensi = potensiPkb + potensiOpsenPkb + potensiSwdkllj

  const byKecamatan = groupByRegion(
    rows,
    revenueType,
    (row) => row.kecamatan,
    (row) => ({ kecamatan: row.kecamatan }),
  )

  const byKelurahan = groupByRegion(
    rows,
    revenueType,
    (row) => `${row.kecamatan}::${row.kelurahan}`,
    (row) => ({ kelurahan: row.kelurahan, kecamatan: row.kecamatan }),
  )

  const byTunggakanBucket = TUNGGAKAN_BUCKETS.map((bucket) => {
    const rowsInBucket = rows.filter((row) => bucketForTunggakan(row.tunggakanTahun)?.key === bucket.key)
    const potensi = rowsInBucket.reduce((a, row) => a + rowPotensi(row, revenueType), 0)
    return {
      ...bucket,
      count: rowsInBucket.length,
      potensi,
      percent: totalPotensi ? (potensi / totalPotensi) * 100 : 0,
    }
  })

  return {
    total,
    potensiPkb,
    potensiOpsenPkb,
    potensiSwdkllj,
    totalPotensi,
    potensiPkbPercent: totalPotensi ? (potensiPkb / totalPotensi) * 100 : 0,
    potensiOpsenPkbPercent: totalPotensi ? (potensiOpsenPkb / totalPotensi) * 100 : 0,
    potensiSwdklljPercent: totalPotensi ? (potensiSwdkllj / totalPotensi) * 100 : 0,
    avgPotensiPerKendaraan: total ? totalPotensi / total : 0,
    byKecamatan,
    byKelurahan,
    byTunggakanBucket,
  }
}

const DELTA_FIELDS = ['totalPotensi', 'potensiPkb', 'potensiOpsenPkb', 'potensiSwdkllj', 'avgPotensiPerKendaraan']

function percentDelta(curr, prev) {
  if (!prev) return 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

// Potensi (unpaid) figures are the "bad" direction, so a rise vs the prior
// month is always flagged negative, unlike collection-rate/revenue metrics.
export function getPotensiSummaryDelta(current, previous) {
  return Object.fromEntries(
    DELTA_FIELDS.map((key) => [
      key,
      { deltaPercent: percentDelta(current[key], previous[key]), negative: current[key] > previous[key] },
    ]),
  )
}
