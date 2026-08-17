import kelurahanGeo from './geo/pangkalpinang-kelurahan.json'
import { getKecamatanListForYear, BASELINE_TAX_YEAR } from './kecamatan.js'
import { seededRandom, mulberry32, seedFromString } from '../lib/yearlyTrend.js'
import { complianceStatusFromRate } from '../lib/complianceStatus.js'

const villagesByKecamatan = new Map()
for (const feature of kelurahanGeo.features) {
  const { kecamatanName } = feature.properties
  if (!villagesByKecamatan.has(kecamatanName)) villagesByKecamatan.set(kecamatanName, [])
  villagesByKecamatan.get(kecamatanName).push(feature.properties)
}

const SWDKLLJ_PER_VEHICLE = 35_000

function buildKelurahanRows(kecamatanList, year) {
  const rows = []

  for (const kec of kecamatanList) {
    const villages = villagesByKecamatan.get(kec.kecamatan) ?? []
    if (villages.length === 0) continue

    const weights = villages.map((v) => 0.55 + mulberry32(seedFromString(v.id))() * 0.9)
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    villages.forEach((village, i) => {
      // Baseline year keeps its exact original (unsuffixed) seed so the
      // default view stays byte-identical to before this was year-aware.
      const seedKey = year === BASELINE_TAX_YEAR ? `${village.id}:stats` : `${village.id}:stats:${year}`
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
        status: complianceStatusFromRate(collectionRate),
      })
    })
  }

  return rows.sort((a, b) => b.collectionRate - a.collectionRate).map((row, index) => ({ ...row, no: index + 1 }))
}

const kelurahanListByYear = new Map()

export function getKelurahanListForYear(year = BASELINE_TAX_YEAR) {
  if (!kelurahanListByYear.has(year)) {
    kelurahanListByYear.set(year, buildKelurahanRows(getKecamatanListForYear(year), year))
  }
  return kelurahanListByYear.get(year)
}

export function kelurahanByKecamatanForYear(kecamatanName, year = BASELINE_TAX_YEAR) {
  return getKelurahanListForYear(year).filter((row) => row.kecamatan === kecamatanName)
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

export function getRateRangeDistributionForYear(year = BASELINE_TAX_YEAR) {
  const list = getKelurahanListForYear(year)
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
