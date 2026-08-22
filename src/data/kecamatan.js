import { seededRandom, scaleCountForYear, shiftRateForYear } from '../lib/yearlyTrend.js'
import dashboardMeta from './mock-api/dashboard.json'
import realKecamatanData from './mock-api/kecamatan-real-2026.json'

// The baseline tax year's per-kecamatan figures are real aggregates (summed
// from data-kendaraan.csv, see scripts/build-real-kendaraan.mjs) rather than
// hand-tuned numbers — already in full row shape, no derivation needed.
// Every other year is still generated synthetically, scaled relative to
// this real baseline.
const SWDKLLJ_PER_VEHICLE = 35_000
// Single source of truth shared with mockApi.js — whichever tax year the
// dashboard treats as "current" is also the exact, hand-tuned year here;
// every other year is generated relative to it.
export const BASELINE_TAX_YEAR = dashboardMeta.taxYear

// Potensi belum bayar isn't tracked per tax type at the source, so it's
// split back out here: the SWDKLLJ share uses the same fixed per-vehicle
// rate as penerimaanSwdkllj (capped at the row's own total so it can never
// exceed it), and the remainder is split PKB/Opsen in proportion to each
// type's own share of what's already been collected. Exported so any
// per-row consumer (tables, role-based revenue filtering) can read a type's
// unpaid share without re-deriving this formula.
export function splitPotensiByType(row) {
  const swdkllj = Math.min(row.potensiBelumBayar, row.belumBayar * SWDKLLJ_PER_VEHICLE)
  const remainder = Math.max(0, row.potensiBelumBayar - swdkllj)
  const pkbShare = row.penerimaanPkb + row.opsenPkb > 0 ? row.penerimaanPkb / (row.penerimaanPkb + row.opsenPkb) : 0.5
  const pkb = Math.round(remainder * pkbShare)
  return { potensiBelumBayarPkb: pkb, potensiBelumBayarOpsen: remainder - pkb, potensiBelumBayarSwdkllj: swdkllj }
}

function finalizeList(rows) {
  return rows
    .sort((a, b) => b.collectionRate - a.collectionRate)
    .map((row, index) => ({ ...row, no: index + 1, ...splitPotensiByType(row) }))
}

const baselineRows = realKecamatanData

function buildKecamatanListForYear(year) {
  if (year === BASELINE_TAX_YEAR) return finalizeList(baselineRows)

  const yearsFromBaseline = year - BASELINE_TAX_YEAR
  const rows = baselineRows.map((base) => {
    const rand = seededRandom(`${base.kecamatan}-${year}`)
    const jumlahKendaraan = scaleCountForYear(base.jumlahKendaraan, yearsFromBaseline, rand)
    const collectionRate = shiftRateForYear(base.collectionRate, yearsFromBaseline, rand)
    const sudahBayar = Math.round((jumlahKendaraan * collectionRate) / 100)
    const belumBayar = jumlahKendaraan - sudahBayar

    // Per-unit rates derived from the baseline keep money figures internally
    // consistent as the underlying vehicle/payment counts scale per year —
    // including SWDKLLJ, whose real per-vehicle rate varies by vehicle type
    // (motorcycles vs. cars) rather than being a flat Rp35.000 everywhere.
    const pkbPerPaid = base.penerimaanPkb / base.sudahBayar
    const opsenPerPaid = base.opsenPkb / base.sudahBayar
    const swdklljPerPaid = base.penerimaanSwdkllj / base.sudahBayar
    const potensiPerUnpaid = base.belumBayar > 0 ? base.potensiBelumBayar / base.belumBayar : 0

    return {
      kecamatan: base.kecamatan,
      jumlahKendaraan,
      collectionRate,
      sudahBayar,
      belumBayar,
      penerimaanPkb: Math.round(pkbPerPaid * sudahBayar),
      opsenPkb: Math.round(opsenPerPaid * sudahBayar),
      potensiBelumBayar: Math.round(potensiPerUnpaid * belumBayar),
      penerimaanSwdkllj: Math.round(swdklljPerPaid * sudahBayar),
    }
  })

  return finalizeList(rows)
}

const kecamatanListByYear = new Map()

function getBaseKecamatanListForYear(year) {
  if (!kecamatanListByYear.has(year)) {
    kecamatanListByYear.set(year, buildKecamatanListForYear(year))
  }
  return kecamatanListByYear.get(year)
}

// "Periode Data" picks an as-of cutoff *within* the tax year (only the
// current tax year has more than one — every earlier year's only period is
// its own Dec 31). We scale each row's collection-rate-derived figures down
// to that cutoff using the shape of the year's own monthly trend, anchored
// so the year's default period reproduces today's unscaled numbers exactly.
function monthFromPeriodId(periodId) {
  if (typeof periodId !== 'string' || periodId.length < 7) return null
  const month = Number(periodId.slice(5, 7))
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null
}

function defaultPeriodMonth(year) {
  return year === BASELINE_TAX_YEAR ? Number(dashboardMeta.period.id.slice(5, 7)) : 12
}

export function getPeriodRatio(year, periodId) {
  if (!periodId || !periodId.startsWith(String(year))) return 1
  const month = monthFromPeriodId(periodId)
  const defaultMonth = defaultPeriodMonth(year)
  if (month == null || month === defaultMonth) return 1

  const trend = getTrendCollectionRateForYear(year)
  const monthRate = trend[month - 1]?.rate
  const defaultRate = trend[defaultMonth - 1]?.rate
  if (!monthRate || !defaultRate) return 1
  return monthRate / defaultRate
}

// Exported for kelurahan.js — the real per-kelurahan baseline rows need the
// exact same period-cutoff scaling as the kecamatan rows do, applied
// directly rather than re-derived from the (already-scaled) parent kecamatan.
export function applyPeriodRatio(rows, ratio) {
  return rows.map((row) => {
    const collectionRate = Math.round(Math.min(99.5, Math.max(10, row.collectionRate * ratio)) * 10) / 10
    const sudahBayar = Math.round((row.jumlahKendaraan * collectionRate) / 100)
    const belumBayar = row.jumlahKendaraan - sudahBayar
    const paidRatio = row.sudahBayar > 0 ? sudahBayar / row.sudahBayar : 0
    const unpaidRatio = row.belumBayar > 0 ? belumBayar / row.belumBayar : 1

    return {
      ...row,
      collectionRate,
      sudahBayar,
      belumBayar,
      penerimaanPkb: Math.round(row.penerimaanPkb * paidRatio),
      opsenPkb: Math.round(row.opsenPkb * paidRatio),
      potensiBelumBayar: Math.round(row.potensiBelumBayar * unpaidRatio),
      penerimaanSwdkllj: Math.round(row.penerimaanSwdkllj * paidRatio),
    }
  })
}

const kecamatanListByYearPeriod = new Map()

export function getKecamatanListForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const baseList = getBaseKecamatanListForYear(year)
  const ratio = getPeriodRatio(year, periodId)
  if (ratio === 1) return baseList

  const key = `${year}:${periodId}`
  if (!kecamatanListByYearPeriod.has(key)) {
    kecamatanListByYearPeriod.set(key, finalizeList(applyPeriodRatio(baseList, ratio)))
  }
  return kecamatanListByYearPeriod.get(key)
}

function sum(list, key) {
  return list.reduce((acc, row) => acc + row[key], 0)
}

export function getKecamatanSummaryForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const list = getKecamatanListForYear(year, periodId)
  const totalKendaraan = sum(list, 'jumlahKendaraan')
  const totalSudahBayar = sum(list, 'sudahBayar')
  const totalBelumBayar = sum(list, 'belumBayar')
  const penerimaanPkb = sum(list, 'penerimaanPkb')
  const opsenPkb = sum(list, 'opsenPkb')
  const potensiBelumBayar = sum(list, 'potensiBelumBayar')
  const collectionRateTarget = 90

  // Each row already carries its own PKB/Opsen/SWDKLLJ potensi split
  // (finalizeList), so the aggregate is just their sum — keeps the
  // city-wide split exactly consistent with what any per-row table shows.
  const potensiBelumBayarPkb = sum(list, 'potensiBelumBayarPkb')
  const potensiBelumBayarOpsen = sum(list, 'potensiBelumBayarOpsen')
  const potensiBelumBayarSwdkllj = sum(list, 'potensiBelumBayarSwdkllj')

  return {
    collectionRate: Math.round((totalSudahBayar / totalKendaraan) * 1000) / 10,
    collectionRateTarget,
    totalKendaraan,
    totalSudahBayar,
    totalBelumBayar,
    penerimaanPkb,
    penerimaanPkbTarget: 23_250_000_000,
    opsenPkb,
    opsenPkbTarget: 14_250_000_000,
    potensiBelumBayar,
    potensiBelumBayarPkb,
    potensiBelumBayarOpsen,
    potensiBelumBayarSwdkllj,
    penerimaanSwdkllj: sum(list, 'penerimaanSwdkllj'),
    // TODO: placeholder pending a confirmed SWDKLLJ budget target from the
    // city — derived from the fleet size and the existing collection-rate
    // target so it scales sensibly with the current data instead of a
    // hardcoded guess.
    penerimaanSwdklljTarget: Math.round(totalKendaraan * (collectionRateTarget / 100) * SWDKLLJ_PER_VEHICLE),
  }
}

// The period one calendar month before the given one, wrapping into the
// prior tax year when it falls before January (only reachable from 2026's
// earliest period, since every other year has just a single Dec 31 period).
export function getPreviousMonthPeriod(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const month = monthFromPeriodId(periodId) ?? defaultPeriodMonth(year)
  let prevMonth = month - 1
  let prevYear = year
  if (prevMonth < 1) {
    prevMonth = 12
    prevYear = year - 1
  }
  return { year: prevYear, periodId: `${prevYear}-${String(prevMonth).padStart(2, '0')}-01` }
}

function percentDelta(curr, prev) {
  if (!prev) return 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

export function getKecamatanSummaryDelta(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const { year: prevYear, periodId: prevPeriodId } = getPreviousMonthPeriod(year, periodId)
  const current = getKecamatanSummaryForYear(year, periodId)
  const previous = getKecamatanSummaryForYear(prevYear, prevPeriodId)

  return {
    collectionRate: {
      deltaPercent: percentDelta(current.collectionRate, previous.collectionRate),
      negative: current.collectionRate < previous.collectionRate,
    },
    penerimaanPkb: {
      deltaPercent: percentDelta(current.penerimaanPkb, previous.penerimaanPkb),
      negative: current.penerimaanPkb < previous.penerimaanPkb,
    },
    opsenPkb: {
      deltaPercent: percentDelta(current.opsenPkb, previous.opsenPkb),
      negative: current.opsenPkb < previous.opsenPkb,
    },
    potensiBelumBayar: {
      deltaPercent: percentDelta(current.potensiBelumBayar, previous.potensiBelumBayar),
      negative: current.potensiBelumBayar > previous.potensiBelumBayar,
    },
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const BASELINE_TREND = [
  { bulan: 'Jan', rate: 64.13 },
  { bulan: 'Feb', rate: 65.48 },
  { bulan: 'Mar', rate: 67.45 },
  { bulan: 'Apr', rate: 70.18 },
  { bulan: 'Mei', rate: 73.1 },
  { bulan: 'Jun', rate: 75.32 },
  { bulan: 'Jul', rate: 76.81 },
  { bulan: 'Agu', rate: 78.45 },
  { bulan: 'Sep', rate: 79.9 },
  { bulan: 'Okt', rate: 81.2 },
  { bulan: 'Nov', rate: 82.4 },
  { bulan: 'Des', rate: 83.5 },
]

export function getTrendCollectionRateForYear(year = BASELINE_TAX_YEAR) {
  const ytdRate = getKecamatanSummaryForYear(year).collectionRate

  if (year === BASELINE_TAX_YEAR) {
    // BASELINE_TREND is a pacing *shape* (how collection typically ramps up
    // across the year), not an absolute level — it's rescaled here so the
    // curve actually ends on the real baseline's current rate instead of a
    // hand-tuned one. getPeriodRatio() only ever divides two of these
    // points, so this rescale doesn't change any period-cutoff ratio.
    const anchorRate = BASELINE_TREND[defaultPeriodMonth(year) - 1].rate
    const scaled = BASELINE_TREND.map((point) => ({
      ...point,
      rate: Math.round(((point.rate / anchorRate) * ytdRate) * 100) / 100,
    }))
    return [...scaled, { bulan: 'Mei (YTD)', rate: ytdRate }]
  }

  // Walk backward from the year's current rate so the trend line still ends
  // exactly on that year's computed collection rate.
  const rand = seededRandom(`trend-${year}`)
  const monthly = []
  let rate = ytdRate
  for (let i = MONTHS.length - 1; i >= 0; i--) {
    monthly[i] = Math.round(rate * 100) / 100
    rate -= 1.1 + rand() * 1.4
  }
  return [...monthly.map((rate, i) => ({ bulan: MONTHS[i], rate })), { bulan: 'Mei (YTD)', rate: ytdRate }]
}

// Baseline exports kept for components that only need option lists (names
// don't vary by year) or a non-reactive default snapshot.
export const kecamatanList = getKecamatanListForYear(BASELINE_TAX_YEAR)
export const kecamatanSummary = getKecamatanSummaryForYear(BASELINE_TAX_YEAR)
export const trendCollectionRate = getTrendCollectionRateForYear(BASELINE_TAX_YEAR)
