import { seededRandom, scaleCountForYear, shiftRateForYear } from '../lib/yearlyTrend.js'
import dashboardMeta from './mock-api/dashboard.json'

const BASE = [
  {
    kecamatan: 'Gerunggang',
    jumlahKendaraan: 12542,
    collectionRate: 85.92,
    penerimaanPkb: 4_520_000_000,
    opsenPkb: 2_120_000_000,
    potensiBelumBayar: 1_120_000_000,
  },
  {
    kecamatan: 'Rangkui',
    jumlahKendaraan: 10321,
    collectionRate: 81.23,
    penerimaanPkb: 3_860_000_000,
    opsenPkb: 1_900_000_000,
    potensiBelumBayar: 890_450_000,
  },
  {
    kecamatan: 'Taman Sari',
    jumlahKendaraan: 8762,
    collectionRate: 78.73,
    penerimaanPkb: 3_240_000_000,
    opsenPkb: 1_600_000_000,
    potensiBelumBayar: 905_210_000,
  },
  {
    kecamatan: 'Bukit Intan',
    jumlahKendaraan: 7654,
    collectionRate: 76.84,
    penerimaanPkb: 2_880_000_000,
    opsenPkb: 1_500_000_000,
    potensiBelumBayar: 960_330_000,
  },
  {
    kecamatan: 'Gabek',
    jumlahKendaraan: 5200,
    collectionRate: 73.5,
    penerimaanPkb: 1_520_000_000,
    opsenPkb: 760_000_000,
    potensiBelumBayar: 420_000_000,
  },
  {
    kecamatan: 'Girimaya',
    jumlahKendaraan: 4200,
    collectionRate: 68.9,
    penerimaanPkb: 1_220_000_000,
    opsenPkb: 610_000_000,
    potensiBelumBayar: 300_000_000,
  },
  {
    kecamatan: 'Pangkal Balam',
    jumlahKendaraan: 3464,
    collectionRate: 58.3,
    penerimaanPkb: 1_010_000_000,
    opsenPkb: 505_000_000,
    potensiBelumBayar: 224_000_000,
  },
]

const SWDKLLJ_PER_VEHICLE = 35_000
// Single source of truth shared with mockApi.js — whichever tax year the
// dashboard treats as "current" is also the exact, hand-tuned year here;
// every other year is generated relative to it.
export const BASELINE_TAX_YEAR = dashboardMeta.taxYear

function deriveRow(row, index) {
  const sudahBayar = Math.round((row.jumlahKendaraan * row.collectionRate) / 100)
  const belumBayar = row.jumlahKendaraan - sudahBayar
  const penerimaanSwdkllj = sudahBayar * SWDKLLJ_PER_VEHICLE
  return {
    no: index + 1,
    ...row,
    collectionRate: Math.round((sudahBayar / row.jumlahKendaraan) * 1000) / 10,
    sudahBayar,
    belumBayar,
    penerimaanSwdkllj,
  }
}

function finalizeList(rows) {
  return rows
    .sort((a, b) => b.collectionRate - a.collectionRate)
    .map((row, index) => ({ ...row, no: index + 1 }))
}

const baselineRows = BASE.map(deriveRow)

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
    // consistent as the underlying vehicle/payment counts scale per year.
    const pkbPerPaid = base.penerimaanPkb / base.sudahBayar
    const opsenPerPaid = base.opsenPkb / base.sudahBayar
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
      penerimaanSwdkllj: sudahBayar * SWDKLLJ_PER_VEHICLE,
    }
  })

  return finalizeList(rows)
}

const kecamatanListByYear = new Map()

export function getKecamatanListForYear(year = BASELINE_TAX_YEAR) {
  if (!kecamatanListByYear.has(year)) {
    kecamatanListByYear.set(year, buildKecamatanListForYear(year))
  }
  return kecamatanListByYear.get(year)
}

function sum(list, key) {
  return list.reduce((acc, row) => acc + row[key], 0)
}

export function getKecamatanSummaryForYear(year = BASELINE_TAX_YEAR) {
  const list = getKecamatanListForYear(year)
  const totalKendaraan = sum(list, 'jumlahKendaraan')
  const totalSudahBayar = sum(list, 'sudahBayar')
  const totalBelumBayar = sum(list, 'belumBayar')

  return {
    collectionRate: Math.round((totalSudahBayar / totalKendaraan) * 1000) / 10,
    collectionRateTarget: 90,
    totalKendaraan,
    totalSudahBayar,
    totalBelumBayar,
    penerimaanPkb: sum(list, 'penerimaanPkb'),
    penerimaanPkbTarget: 23_250_000_000,
    opsenPkb: sum(list, 'opsenPkb'),
    opsenPkbTarget: 14_250_000_000,
    potensiBelumBayar: sum(list, 'potensiBelumBayar'),
    penerimaanSwdkllj: sum(list, 'penerimaanSwdkllj'),
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
    return [...BASELINE_TREND, { bulan: 'Mei (YTD)', rate: ytdRate }]
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
