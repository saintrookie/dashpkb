import kelurahanGeo from './geo/pangkalpinang-kelurahan.json'
import {
  getKecamatanListForYear,
  BASELINE_TAX_YEAR,
  getPeriodRatio,
  applyPeriodRatio,
  splitPotensiByType,
} from './kecamatan.js'
import realKelurahanData from './mock-api/kelurahan-real-2026.json'
import { seededRandom, mulberry32, seedFromString } from '../lib/yearlyTrend.js'
import { complianceStatusFromRate } from '../lib/complianceStatus.js'

const villagesByKecamatan = new Map()
const villagesByName = new Map()
for (const feature of kelurahanGeo.features) {
  const { kecamatanName, name } = feature.properties
  if (!villagesByKecamatan.has(kecamatanName)) villagesByKecamatan.set(kecamatanName, [])
  villagesByKecamatan.get(kecamatanName).push(feature.properties)
  villagesByName.set(name, feature.properties)
}

const SWDKLLJ_PER_VEHICLE = 35_000

function finalizeKelurahanList(rows) {
  return rows
    .sort((a, b) => b.collectionRate - a.collectionRate)
    .map((row, index) => ({
      ...row,
      no: index + 1,
      status: complianceStatusFromRate(row.collectionRate),
      ...splitPotensiByType(row),
    }))
}

// The baseline tax year's per-kelurahan figures are real aggregates (summed
// from data-kendaraan.csv, joined against the real GeoJSON boundaries by
// name — see scripts/build-real-kendaraan.mjs), not derived by splitting the
// parent kecamatan's total across villages with random jitter.
function buildRealKelurahanBaseRows() {
  return realKelurahanData.map((row) => {
    const village = villagesByName.get(row.kelurahan)
    return {
      id: village?.id ?? `${row.kecamatan}-${row.kelurahan}`,
      kelurahan: row.kelurahan,
      kecamatan: row.kecamatan,
      kecamatanId: village?.kecamatanId,
      latitude: village?.centroid?.[0],
      longitude: village?.centroid?.[1],
      bbox: village?.bbox,
      jumlahKendaraan: row.jumlahKendaraan,
      collectionRate: row.collectionRate,
      sudahBayar: row.sudahBayar,
      belumBayar: row.belumBayar,
      penerimaanPkb: row.penerimaanPkb,
      opsenPkb: row.opsenPkb,
      potensiBelumBayar: row.potensiBelumBayar,
      penerimaanSwdkllj: row.penerimaanSwdkllj,
    }
  })
}

let realKelurahanBaseRows = null
function getRealKelurahanBaseRows() {
  if (!realKelurahanBaseRows) {
    realKelurahanBaseRows = buildRealKelurahanBaseRows()
  }
  return realKelurahanBaseRows
}

// Every other tax year still splits that year's synthetic kecamatan totals
// across villages with deterministic jitter — there's no real historical
// per-kelurahan data to anchor them to.
function buildKelurahanRows(kecamatanList, year) {
  const rows = []

  for (const kec of kecamatanList) {
    const villages = villagesByKecamatan.get(kec.kecamatan) ?? []
    if (villages.length === 0) continue

    const weights = villages.map((v) => 0.55 + mulberry32(seedFromString(v.id))() * 0.9)
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    villages.forEach((village, i) => {
      const seedKey = `${village.id}:stats:${year}`
      const rand = seededRandom(seedKey)
      const share = weights[i] / totalWeight
      const jumlahKendaraan = Math.max(180, Math.round(kec.jumlahKendaraan * share))
      const rateJitter = (rand() - 0.5) * 16 // +/- 8 points around parent kecamatan
      const collectionRate = Math.min(99.5, Math.max(28, kec.collectionRate + rateJitter))
      const sudahBayar = Math.round((jumlahKendaraan * collectionRate) / 100)
      const belumBayar = jumlahKendaraan - sudahBayar
      const penerimaanPkb = Math.round(kec.penerimaanPkb * share)
      const opsenPkb = Math.round(kec.opsenPkb * share)
      const potensiBelumBayar = Math.round(kec.potensiBelumBayar * share)
      const penerimaanSwdkllj = sudahBayar * SWDKLLJ_PER_VEHICLE

      rows.push({
        id: village.id,
        kelurahan: village.name,
        kecamatan: kec.kecamatan,
        kecamatanId: village.kecamatanId,
        latitude: village.centroid[0],
        longitude: village.centroid[1],
        bbox: village.bbox,
        jumlahKendaraan,
        collectionRate: Math.round(collectionRate * 10) / 10,
        sudahBayar,
        belumBayar,
        penerimaanPkb,
        opsenPkb,
        potensiBelumBayar,
        penerimaanSwdkllj,
      })
    })
  }

  return rows
}

const kelurahanListByYearPeriod = new Map()

export function getKelurahanListForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const key = `${year}:${periodId ?? ''}`
  if (!kelurahanListByYearPeriod.has(key)) {
    if (year === BASELINE_TAX_YEAR) {
      const ratio = getPeriodRatio(year, periodId)
      const base = getRealKelurahanBaseRows()
      kelurahanListByYearPeriod.set(key, finalizeKelurahanList(ratio === 1 ? base : applyPeriodRatio(base, ratio)))
    } else {
      kelurahanListByYearPeriod.set(
        key,
        finalizeKelurahanList(buildKelurahanRows(getKecamatanListForYear(year, periodId), year)),
      )
    }
  }
  return kelurahanListByYearPeriod.get(key)
}

export function kelurahanByKecamatanForYear(kecamatanName, year = BASELINE_TAX_YEAR, periodId = undefined) {
  return getKelurahanListForYear(year, periodId).filter((row) => row.kecamatan === kecamatanName)
}

const RATE_RANGES = [
  { key: 'ge90', label: '≥ 90%', min: 90, color: '#16a34a' },
  { key: 'r75_89', label: '75% - 89%', min: 75, color: '#86d78c' },
  { key: 'r60_74', label: '60% - 74%', min: 60, color: '#eab308' },
  { key: 'lt60', label: '< 60%', min: 0, color: '#f2760c' },
]

function rangeForRate(rate) {
  return RATE_RANGES.find((band) => rate >= band.min)
}

export function getRateRangeDistributionForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const list = getKelurahanListForYear(year, periodId)
  return RATE_RANGES.map((band) => {
    const rows = list.filter((row) => rangeForRate(row.collectionRate).key === band.key)
    return {
      ...band,
      kelurahanCount: rows.length,
      vehicleCount: rows.reduce((a, row) => a + row.jumlahKendaraan, 0),
    }
  })
}

// Baseline exports kept for components that only need option lists (names
// don't vary by year) or a non-reactive default snapshot.
export const kelurahanList = getKelurahanListForYear(BASELINE_TAX_YEAR)

export function kelurahanByKecamatan(kecamatanName) {
  return kelurahanList.filter((row) => row.kecamatan === kecamatanName)
}

export const kelurahanSummary = {
  totalKelurahan: kelurahanList.length,
}

export const rateRangeDistribution = getRateRangeDistributionForYear(BASELINE_TAX_YEAR)
