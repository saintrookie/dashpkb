import { getKelurahanListForYear } from './kelurahan.js'
import { BASELINE_TAX_YEAR, getPeriodRatio } from './kecamatan.js'
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

// Used only to color the "top 5 by actual count" breakdown below — real data
// has far more distinct brands than the synthetic generator's fixed BRANDS
// list above, so which 5 end up on top isn't fixed.
const BRAND_CHART_COLORS = ['#1668e3', '#16a34a', '#eab308', '#7c3aed', '#f2760c']

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

// The baseline tax year (2026) uses the real vehicle-tax export instead of
// the synthetic generator below; every other year keeps the synthetic model
// (there's no real historical data to fall back to for them). The export is
// a ~16MB JSON file, so it's loaded via a dynamic import — a separate chunk
// fetched only when a baseline-year vehicle list is actually requested —
// instead of shipping it in every page's bundle.
function expandRealRow(values, fields, jenisLabels) {
  const row = {}
  fields.forEach((key, i) => {
    row[key] = values[i]
  })
  row.id = row.noPolisi
  row.jenisLabel = jenisLabels[row.jenisKey] ?? 'Lainnya'
  row.total = row.pkb + row.opsenPkb + row.swdkllj
  return row
}

let realKendaraanBaseListPromise = null
function getRealKendaraanBaseListAsync() {
  if (!realKendaraanBaseListPromise) {
    realKendaraanBaseListPromise = import('./mock-api/kendaraan-real-2026.json').then(({ default: data }) =>
      data.rows.map((values) => expandRealRow(values, data.fields, data.jenisLabels)),
    )
  }
  return realKendaraanBaseListPromise
}

// Real data is a single point-in-time snapshot with no per-vehicle payment
// date, so earlier "Periode Data" cutoffs are simulated the same way the
// kecamatan/kelurahan aggregates are: scale down how many vehicles count as
// paid using the shared trend-derived ratio, walking a stable per-vehicle
// score so an earlier period's paid set is always a subset of a later one's.
function realRowPeriodScore(row) {
  return mulberry32(seedFromString(`${row.id}:real-period`))()
}

function applyPeriodToRealRows(rows, ratio) {
  if (ratio >= 1) return rows
  const paidRows = rows.filter((r) => r.statusBayar === 'Lunas')
  const targetPaidCount = Math.round(paidRows.length * ratio)
  if (targetPaidCount >= paidRows.length) return rows

  const keepPaid = new Set(
    paidRows
      .map((row) => ({ row, score: realRowPeriodScore(row) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, targetPaidCount)
      .map((s) => s.row.id),
  )
  return rows.map((row) => {
    if (row.statusBayar !== 'Lunas' || keepPaid.has(row.id)) return row
    return { ...row, statusBayar: 'Belum Lunas', tunggakanTahun: row.tunggakanTahun || 1 }
  })
}

const realKendaraanByPeriod = new Map()

async function getRealKendaraanForPeriodAsync(periodId) {
  const ratio = getPeriodRatio(BASELINE_TAX_YEAR, periodId)
  const base = await getRealKendaraanBaseListAsync()
  if (ratio >= 1) return base
  const key = periodId ?? ''
  if (!realKendaraanByPeriod.has(key)) {
    realKendaraanByPeriod.set(key, applyPeriodToRealRows(base, ratio))
  }
  return realKendaraanByPeriod.get(key)
}

const kendaraanListByYearPeriod = new Map()

// Always async — even the synthetic-year path, which has no real work to
// await — so every caller uses one consistent API regardless of year.
export async function getKendaraanListForYear(year = BASELINE_TAX_YEAR, periodId = undefined) {
  if (year === BASELINE_TAX_YEAR) return getRealKendaraanForPeriodAsync(periodId)

  const key = `${year}:${periodId ?? ''}`
  if (!kendaraanListByYearPeriod.has(key)) {
    kendaraanListByYearPeriod.set(key, buildKendaraanList(getKelurahanListForYear(year, periodId), year))
  }
  return kendaraanListByYearPeriod.get(key)
}

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

  const brandBreakdown = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([merk, count], i) => ({
      merk,
      color: BRAND_CHART_COLORS[i],
      count,
      percent: total ? (count / total) * 100 : 0,
    }))

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
