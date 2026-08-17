import { kendaraanList, getKendaraanListForYear } from './kendaraan.js'
import { BASELINE_TAX_YEAR } from './kecamatan.js'

export const potensiRows = kendaraanList.filter((row) => row.statusBayar === 'Belum Lunas')

export function getPotensiRowsForYear(year = BASELINE_TAX_YEAR) {
  return getKendaraanListForYear(year).filter((row) => row.statusBayar === 'Belum Lunas')
}

export const TUNGGAKAN_BUCKETS = [
  { key: 'y1_2', label: '1 - 2 Tahun', min: 1, max: 2, color: '#f2760c' },
  { key: 'y3_5', label: '3 - 5 Tahun', min: 3, max: 5, color: '#eab308' },
  { key: 'y6plus', label: '> 5 Tahun', min: 6, max: Infinity, color: '#16a34a' },
]

export function bucketForTunggakan(years) {
  return TUNGGAKAN_BUCKETS.find((b) => years >= b.min && years <= b.max)
}

function rowPotensi(row) {
  return row.pkb + row.opsenPkb + row.swdkllj
}

function groupByRegion(rows, keyFn, labelFields) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (!groups.has(key)) {
      groups.set(key, { ...labelFields(row), potensi: 0, kendaraan: 0, tunggakanTotal: 0 })
    }
    const g = groups.get(key)
    g.potensi += rowPotensi(row)
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

export function summarizePotensi(rows) {
  const total = rows.length
  let potensiPkb = 0
  let potensiOpsenPkb = 0
  let potensiSwdkllj = 0

  for (const row of rows) {
    potensiPkb += row.pkb
    potensiOpsenPkb += row.opsenPkb
    potensiSwdkllj += row.swdkllj
  }

  const totalPotensi = potensiPkb + potensiOpsenPkb + potensiSwdkllj

  const byKecamatan = groupByRegion(
    rows,
    (row) => row.kecamatan,
    (row) => ({ kecamatan: row.kecamatan }),
  )

  const byKelurahan = groupByRegion(
    rows,
    (row) => `${row.kecamatan}::${row.kelurahan}`,
    (row) => ({ kelurahan: row.kelurahan, kecamatan: row.kecamatan }),
  )

  const byTunggakanBucket = TUNGGAKAN_BUCKETS.map((bucket) => {
    const rowsInBucket = rows.filter((row) => bucketForTunggakan(row.tunggakanTahun)?.key === bucket.key)
    const potensi = rowsInBucket.reduce((a, row) => a + rowPotensi(row), 0)
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
