import { getKelurahanListForYear } from './kelurahan.js'
import { BASELINE_TAX_YEAR } from './kecamatan.js'
import { mulberry32, seedFromString } from '../lib/yearlyTrend.js'

function weightedPick(rand, items, weightKey = 'weight') {
  const total = items.reduce((a, item) => a + item[weightKey], 0)
  let r = rand() * total
  for (const item of items) {
    r -= item[weightKey]
    if (r <= 0) return item
  }
  return items[items.length - 1]
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)]
}

export const SWDKLLJ_PER_VEHICLE = 35_000

export const JENIS_KENDARAAN = [
  { key: 'motor', label: 'Sepeda Motor', weight: 74.13, color: '#1668e3' },
  { key: 'penumpang', label: 'Mobil Penumpang', weight: 17.45, color: '#16a34a' },
  { key: 'barang', label: 'Mobil Barang', weight: 4.42, color: '#eab308' },
  { key: 'bus', label: 'Bus', weight: 0.7, color: '#7c3aed' },
  { key: 'lainnya', label: 'Lainnya', weight: 3.3, color: '#94a3b8' },
]

const BRANDS = [
  { merk: 'Honda', weight: 48.74, color: '#1668e3' },
  { merk: 'Yamaha', weight: 28.19, color: '#16a34a' },
  { merk: 'Suzuki', weight: 10.45, color: '#eab308' },
  { merk: 'Toyota', weight: 6.63, color: '#7c3aed' },
  { merk: 'Daihatsu', weight: 5.99, color: '#f2760c' },
]

const YEAR_WEIGHTS = [
  { year: 2025, weight: 38.58 },
  { year: 2024, weight: 27.33 },
  { year: 2023, weight: 16.81 },
  { year: 2022, weight: 10.45 },
  { year: 'le2021', weight: 6.83 },
]

const PKB_RANGE_BY_JENIS = {
  motor: [150_000, 350_000],
  penumpang: [900_000, 2_600_000],
  barang: [1_200_000, 3_200_000],
  bus: [2_500_000, 5_500_000],
  lainnya: [300_000, 900_000],
}

const FIRST_NAMES = [
  'Budi', 'Siti', 'Rudi', 'Dewi', 'Agus', 'Maya', 'Heri', 'Tina', 'Yudi', 'Lina',
  'Andi', 'Rina', 'Bambang', 'Sri', 'Joko', 'Ani', 'Dedi', 'Wati', 'Hendra', 'Yuli',
  'Fajar', 'Ratna', 'Eko', 'Nur',
]

const LAST_NAMES = [
  'Santoso', 'Aminah', 'Hermawan', 'Lestari', 'Setiawan', 'Anggraini', 'Prayogo',
  'Marlina', 'Kurniawan', 'Wati', 'Wijaya', 'Puspita', 'Saputra', 'Handayani',
  'Firmansyah', 'Rahmawati', 'Gunawan', 'Kusuma', 'Pratama', 'Susanti',
]

const STREETS = [
  'Jl. Bukit Raya', 'Jl. Kenanga', 'Jl. Melati', 'Jl. Mawar', 'Jl. Pemuda',
  'Jl. Merdeka', 'Jl. Sudirman', 'Jl. Diponegoro', 'Jl. Kartini', 'Jl. Veteran',
  'Jl. Pahlawan', 'Jl. Anggrek',
]

function yearLabel(year) {
  return year === 'le2021' ? '≤ 2021' : String(year)
}

function padNumber(n, width) {
  return String(n).padStart(width, '0')
}

function shuffledLunasFlags(kel, rand) {
  const flags = new Array(kel.jumlahKendaraan)
  for (let i = 0; i < kel.jumlahKendaraan; i++) flags[i] = i < kel.sudahBayar
  for (let i = flags.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[flags[i], flags[j]] = [flags[j], flags[i]]
  }
  return flags
}

function buildKendaraanList(kelurahanList, taxYear) {
  const rows = []
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  // Baseline year keeps its exact original (unsuffixed) seeds so the default
  // view stays byte-identical to before this was year-aware.
  const isBaseline = taxYear === BASELINE_TAX_YEAR

  for (const kel of kelurahanList) {
    const shuffleSeed = isBaseline ? `${kel.id}:lunas-shuffle` : `${kel.id}:lunas-shuffle:${taxYear}`
    const shuffleRand = mulberry32(seedFromString(shuffleSeed))
    const lunasFlags = shuffledLunasFlags(kel, shuffleRand)

    for (let i = 0; i < kel.jumlahKendaraan; i++) {
      const rowSeed = isBaseline ? `${kel.id}:${i}` : `${kel.id}:${i}:${taxYear}`
      const rand = mulberry32(seedFromString(rowSeed))
      const jenis = weightedPick(rand, JENIS_KENDARAAN)
      const brand = weightedPick(rand, BRANDS)
      const yearPick = weightedPick(rand, YEAR_WEIGHTS)
      const tahunBuat = yearPick.year === 'le2021' ? 2015 + Math.floor(rand() * 7) : yearPick.year

      const isLunas = lunasFlags[i]
      const [pkbMin, pkbMax] = PKB_RANGE_BY_JENIS[jenis.key]
      const pkb = Math.round(pkbMin + rand() * (pkbMax - pkbMin))
      const opsenPkb = Math.round(pkb * (0.46 + rand() * 0.06))
      const swdkllj = SWDKLLJ_PER_VEHICLE
      const tunggakanTahun = isLunas ? 0 : 1 + Math.floor(rand() * 7)

      const dueDay = 1 + Math.floor(rand() * 28)
      const dueMonth = 1 + Math.floor(rand() * 12)
      const dueYear = isLunas ? 2025 + Math.floor(rand() * 2) : 2025 - (tunggakanTahun - 1)

      rows.push({
        id: `${kel.id}-${i}`,
        noPolisi: `BN ${padNumber(1000 + Math.floor(rand() * 9000), 4)} ${pick(rand, alphabet.split(''))}${pick(rand, alphabet.split(''))}`,
        namaPemilik: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
        alamat: `${pick(rand, STREETS)} No. ${1 + Math.floor(rand() * 150)}`,
        kelurahan: kel.kelurahan,
        kecamatan: kel.kecamatan,
        jenisKey: jenis.key,
        jenisLabel: jenis.label,
        merk: brand.merk,
        tahunBuat,
        tglJatuhTempo: `${padNumber(dueDay, 2)}/${padNumber(dueMonth, 2)}/${dueYear}`,
        statusBayar: isLunas ? 'Lunas' : 'Belum Lunas',
        tunggakanTahun,
        pkb,
        opsenPkb,
        swdkllj,
        total: pkb + opsenPkb + swdkllj,
      })
    }
  }

  return rows
}

const kendaraanListByYearPeriod = new Map()

export function getKendaraanListForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  const key = `${year}:${periodId ?? ''}`
  if (!kendaraanListByYearPeriod.has(key)) {
    kendaraanListByYearPeriod.set(key, buildKendaraanList(getKelurahanListForYear(year, periodId), year))
  }
  return kendaraanListByYearPeriod.get(key)
}

export const kendaraanList = getKendaraanListForYear(BASELINE_TAX_YEAR)

export function summarizeKendaraan(rows) {
  const total = rows.length
  let lunas = 0
  let potensiPkb = 0
  let potensiOpsenPkb = 0
  let potensiSwdkllj = 0

  const jenisCounts = new Map()
  const yearCounts = new Map()
  const brandCounts = new Map()

  for (const row of rows) {
    if (row.statusBayar === 'Lunas') {
      lunas += 1
    } else {
      potensiPkb += row.pkb
      potensiOpsenPkb += row.opsenPkb
      potensiSwdkllj += row.swdkllj
    }
    jenisCounts.set(row.jenisKey, (jenisCounts.get(row.jenisKey) ?? 0) + 1)
    const yearKey = row.tahunBuat >= 2022 ? row.tahunBuat : 'le2021'
    yearCounts.set(yearKey, (yearCounts.get(yearKey) ?? 0) + 1)
    brandCounts.set(row.merk, (brandCounts.get(row.merk) ?? 0) + 1)
  }

  const belumLunas = total - lunas

  const jenisBreakdown = JENIS_KENDARAAN.map((j) => ({
    key: j.key,
    label: j.label,
    color: j.color,
    count: jenisCounts.get(j.key) ?? 0,
    percent: total ? ((jenisCounts.get(j.key) ?? 0) / total) * 100 : 0,
  }))

  const yearBreakdown = YEAR_WEIGHTS.map((y) => ({
    key: y.year,
    label: yearLabel(y.year),
    count: yearCounts.get(y.year) ?? 0,
  }))

  const brandBreakdown = BRANDS.map((b) => ({
    merk: b.merk,
    color: b.color,
    count: brandCounts.get(b.merk) ?? 0,
    percent: total ? ((brandCounts.get(b.merk) ?? 0) / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count)

  return {
    total,
    lunas,
    belumLunas,
    lunasPercent: total ? (lunas / total) * 100 : 0,
    belumLunasPercent: total ? (belumLunas / total) * 100 : 0,
    potensiPkb,
    potensiOpsenPkb,
    potensiSwdkllj,
    totalPotensi: potensiPkb + potensiOpsenPkb + potensiSwdkllj,
    jenisBreakdown,
    yearBreakdown,
    brandBreakdown,
  }
}
