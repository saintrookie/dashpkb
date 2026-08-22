// One-off ETL: converts the real vehicle-tax export (src/data/data-kendaraan.csv)
// into the compact dataset the app loads for the baseline tax year. Re-run
// this manually whenever the source CSV changes — it is not part of the
// build or runtime, only its output (kendaraan-real-2026.json) is imported.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, '../src/data/data-kendaraan.csv')
const GEO_PATH = path.join(__dirname, '../src/data/geo/pangkalpinang-kelurahan.json')
const OUT_PATH = path.join(__dirname, '../src/data/mock-api/kendaraan-real-2026.json')
const OUT_KECAMATAN_PATH = path.join(__dirname, '../src/data/mock-api/kecamatan-real-2026.json')
const OUT_KELURAHAN_PATH = path.join(__dirname, '../src/data/mock-api/kelurahan-real-2026.json')

// The CSV's free-text Kelurahan spellings don't all match the GeoJSON's
// official boundary names one-for-one — these four are the only mismatches
// found (spacing/typo variants aside from "Bukit Intan", which the CSV uses
// for the kelurahan the GeoJSON calls "Batu Intan").
const KELURAHAN_ALIASES = {
  'Rejo Sari': 'Rejosari',
  'Bukit Merapen': 'Bukit Merapin',
  'Tua Tunu Indah': 'Tuatunu Indah',
  'Bukit Intan': 'Batu Intan',
}

// "Now" for computing arrears — pinned to the same as-of moment the rest of
// the app's baseline (2026) dataset is built around (dashboardMeta.period),
// so re-running this script later doesn't shift every arrears count.
const REFERENCE_DATE = new Date(2026, 4, 20) // 20 May 2026

function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  const n = text.length
  while (i < n) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (c === '\r') {
      i++
      continue
    }
    if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += c
    i++
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const KECAMATAN_MAP = {
  'BUKIT INTAN': 'Bukit Intan',
  GERUNGGANG: 'Gerunggang',
  RANGKUI: 'Rangkui',
  'PANGKAL BALAM': 'Pangkal Balam',
  GABEK: 'Gabek',
  GIRIMAYA: 'Girimaya',
  TAMANSARI: 'Taman Sari',
}

function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

const JENIS_LABELS = {
  motor: 'Sepeda Motor',
  penumpang: 'Mobil Penumpang',
  barang: 'Mobil Barang',
  bus: 'Bus',
  lainnya: 'Lainnya',
}

function classifyJenis(raw) {
  const s = raw.toUpperCase()
  if (s.startsWith('SEPEDA MOTOR')) return 'motor'
  if (s.includes('RANSUS') || s.includes('PELAYANAN')) return 'lainnya'
  if (/BUS/.test(s) && !s.includes('MINIBUS') && !s.includes('MICROBUS')) return 'bus'
  if (
    s.includes('TRUCK') ||
    s.includes('TRONTON') ||
    s.includes('PICK UP') ||
    s.includes('PICKUP') ||
    s.includes('VAN') ||
    s.includes('TANGKI') ||
    s.includes('CRANE') ||
    s.includes('MIXER') ||
    s.includes('DUMP') ||
    s.includes('BOX') ||
    s.includes('TRAILER') ||
    s.includes('SELF LOADER') ||
    s.includes('FLAT DECK') ||
    s.includes('BESTEL WAGON') ||
    s.includes('KARGO')
  )
    return 'barang'
  if (
    s.includes('MINIBUS') ||
    s.includes('JEEP') ||
    s.includes('SEDAN') ||
    s.includes('MICROBUS') ||
    s.includes('STATION WAGON') ||
    s.includes('PENUMPANG')
  )
    return 'penumpang'
  return 'lainnya'
}

function parseDMY(str) {
  const [d, m, y] = str.split('/').map(Number)
  if (!d || !m || !y) return null
  return new Date(y, m - 1, d)
}

function yearsOverdue(dueDate) {
  if (!dueDate) return 1
  const years =
    REFERENCE_DATE.getFullYear() -
    dueDate.getFullYear() -
    (REFERENCE_DATE.getMonth() < dueDate.getMonth() ||
    (REFERENCE_DATE.getMonth() === dueDate.getMonth() && REFERENCE_DATE.getDate() < dueDate.getDate())
      ? 1
      : 0)
  return Math.max(1, years)
}

const csvText = readFileSync(CSV_PATH, 'utf8')
const rows = parseCSV(csvText)
const header = rows[0]
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

// Columnar (array-of-arrays) output: cuts the JSON roughly in half versus
// array-of-objects by not repeating field names 83k times. The app expands
// each row back into a plain object at import time.
const FIELDS = [
  'noPolisi',
  'namaPemilik',
  'alamat',
  'kelurahan',
  'kecamatan',
  'jenisKey',
  'merk',
  'tahunBuat',
  'tglJatuhTempo',
  'statusBayar',
  'tunggakanTahun',
  'pkb',
  'opsenPkb',
  'swdkllj',
]

const out = []
let skipped = 0
for (let i = 1; i < rows.length; i++) {
  const f = rows[i]
  const kecamatanRaw = f[idx.Kecamatan]?.trim().toUpperCase()
  const kecamatan = KECAMATAN_MAP[kecamatanRaw]
  if (!kecamatan) {
    skipped++
    continue
  }

  const statusRaw = f[idx.STATUS]?.trim()
  const statusBayar = statusRaw === 'SUDAH BAYAR' ? 'Lunas' : 'Belum Lunas'
  const dueDate = parseDMY(f[idx['Tgl.Akhir yl']])
  const pkb = Number(f[idx['Pokok PKB']]) || 0
  const opsenPkb = Number(f[idx['Opsen PKB']]) || 0
  const swdkllj = Number(f[idx['Pokok SWDKLLJ']]) || 0
  let kelurahan = titleCase(f[idx.Kelurahan])
  kelurahan = KELURAHAN_ALIASES[kelurahan] ?? kelurahan

  out.push([
    f[idx['No. Polisi']],
    f[idx['Nama Pemilik']],
    f[idx.Alamat],
    kelurahan,
    kecamatan,
    classifyJenis(f[idx.Jenis]),
    titleCase(f[idx.Merek]),
    Number(f[idx.Tahun]) || null,
    f[idx['Tgl.Akhir yad']],
    statusBayar,
    statusBayar === 'Lunas' ? 0 : yearsOverdue(dueDate),
    pkb,
    opsenPkb,
    swdkllj,
  ])
}

writeFileSync(OUT_PATH, JSON.stringify({ fields: FIELDS, jenisLabels: JENIS_LABELS, rows: out }))
console.log(`wrote ${out.length} rows (skipped ${skipped}) to ${OUT_PATH}`)

// --- Kecamatan / kelurahan aggregates -------------------------------------
// Ringkasan Kelurahan/Kecamatan/Perbandingan Kelurahan only ever need these
// small rollups (7 kecamatan, 42 kelurahan), not the full 83k-row dataset —
// computing them here means those pages load a few KB instead of the 16MB
// vehicle export.

function newAgg() {
  return { jumlahKendaraan: 0, sudahBayar: 0, belumBayar: 0, penerimaanPkb: 0, opsenPkb: 0, penerimaanSwdkllj: 0, potensiBelumBayar: 0 }
}

function addRow(agg, row) {
  const [, , , , , , , , , statusBayar, , pkb, opsenPkb, swdkllj] = row
  agg.jumlahKendaraan += 1
  if (statusBayar === 'Lunas') {
    agg.sudahBayar += 1
    agg.penerimaanPkb += pkb
    agg.opsenPkb += opsenPkb
    agg.penerimaanSwdkllj += swdkllj
  } else {
    agg.belumBayar += 1
    agg.potensiBelumBayar += pkb + opsenPkb + swdkllj
  }
}

function finalizeAgg(agg) {
  return {
    ...agg,
    penerimaanPkb: Math.round(agg.penerimaanPkb),
    opsenPkb: Math.round(agg.opsenPkb),
    penerimaanSwdkllj: Math.round(agg.penerimaanSwdkllj),
    potensiBelumBayar: Math.round(agg.potensiBelumBayar),
    collectionRate: agg.jumlahKendaraan ? Math.round((agg.sudahBayar / agg.jumlahKendaraan) * 1000) / 10 : 0,
  }
}

const kecamatanAgg = new Map()
const kelurahanAgg = new Map()

for (const row of out) {
  const kelurahan = row[3]
  const kecamatan = row[4]

  if (!kecamatanAgg.has(kecamatan)) kecamatanAgg.set(kecamatan, newAgg())
  addRow(kecamatanAgg.get(kecamatan), row)

  const kelKey = `${kecamatan}::${kelurahan}`
  if (!kelurahanAgg.has(kelKey)) kelurahanAgg.set(kelKey, { kelurahan, kecamatan, ...newAgg() })
  addRow(kelurahanAgg.get(kelKey), row)
}

const kecamatanRows = [...kecamatanAgg.entries()].map(([kecamatan, agg]) => ({
  kecamatan,
  ...finalizeAgg(agg),
}))
writeFileSync(OUT_KECAMATAN_PATH, JSON.stringify(kecamatanRows))
console.log(`wrote ${kecamatanRows.length} kecamatan rows to ${OUT_KECAMATAN_PATH}`)

const kelurahanRows = [...kelurahanAgg.values()].map(({ kelurahan, kecamatan, ...agg }) => ({
  kelurahan,
  kecamatan,
  ...finalizeAgg(agg),
}))
writeFileSync(OUT_KELURAHAN_PATH, JSON.stringify(kelurahanRows))
console.log(`wrote ${kelurahanRows.length} kelurahan rows to ${OUT_KELURAHAN_PATH}`)

// Sanity check: every kelurahan name should resolve to a real GeoJSON village
// (kecamatan.js/kelurahan.js join against it at runtime for map geometry).
const geo = JSON.parse(readFileSync(GEO_PATH, 'utf8'))
const geoNames = new Set(geo.features.map((f) => f.properties.name))
const unmatched = kelurahanRows.filter((r) => !geoNames.has(r.kelurahan))
if (unmatched.length > 0) {
  console.warn(
    `WARNING: ${unmatched.length} kelurahan names have no GeoJSON match:`,
    unmatched.map((r) => r.kelurahan),
  )
}
