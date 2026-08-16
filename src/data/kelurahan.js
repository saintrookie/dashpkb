import kelurahanGeo from './geo/pangkalpinang-kelurahan.json'
import { kecamatanList } from './kecamatan.js'
import { complianceStatusFromRate } from '../lib/complianceStatus.js'

// Deterministic PRNG (mulberry32) seeded from a string, so kelurahan-level
// stats are stable across reloads without shipping a giant hand-authored table.
function seedFromString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const villagesByKecamatan = new Map()
for (const feature of kelurahanGeo.features) {
  const { kecamatanName } = feature.properties
  if (!villagesByKecamatan.has(kecamatanName)) villagesByKecamatan.set(kecamatanName, [])
  villagesByKecamatan.get(kecamatanName).push(feature.properties)
}

const SWDKLLJ_PER_VEHICLE = 35_000

function buildKelurahanRows() {
  const rows = []

  for (const kec of kecamatanList) {
    const villages = villagesByKecamatan.get(kec.kecamatan) ?? []
    if (villages.length === 0) continue

    const weights = villages.map((v) => 0.55 + mulberry32(seedFromString(v.id))() * 0.9)
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    villages.forEach((village, i) => {
      const rand = mulberry32(seedFromString(village.id + ':stats'))
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

export const kelurahanList = buildKelurahanRows()

export function kelurahanByKecamatan(kecamatanName) {
  return kelurahanList.filter((row) => row.kecamatan === kecamatanName)
}

export const kelurahanSummary = {
  totalKelurahan: kelurahanList.length,
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

export const rateRangeDistribution = RATE_RANGES.map((band) => {
  const rows = kelurahanList.filter((row) => rangeForRate(row.collectionRate).key === band.key)
  return {
    ...band,
    kelurahanCount: rows.length,
    vehicleCount: rows.reduce((a, row) => a + row.jumlahKendaraan, 0),
  }
})
