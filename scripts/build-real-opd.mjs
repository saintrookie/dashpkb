// One-off ETL: converts the real OPD PKB billing/collection export
// (src/data/data-odp-pkb.csv) into the baseline OPD dataset the app loads
// for the baseline tax year (src/data/mock-api/opd.json). Every other
// requestable year is still derived from this baseline deterministically by
// buildOpdForYear() in mockApi.js — this script only replaces the baseline
// itself. Re-run manually whenever the source CSV changes; it is not part
// of the build or runtime.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, '../src/data/data-odp-pkb.csv')
const OUT_PATH = path.join(__dirname, '../src/data/mock-api/opd.json')

// Same threshold the dashboard config already carries for reporting
// timeliness (dashboard.json: reportingOnTimeThreshold) and compliance tiers
// (dashboard.json: complianceThresholds) — mirrored here since this script
// runs standalone, outside the app's module graph.
const REPORTING_ON_TIME_THRESHOLD = 65
const COMPLIANCE_THRESHOLDS = [
  { status: 'very_good', min: 94 },
  { status: 'good', min: 85 },
  { status: 'fair', min: 70 },
  { status: 'low', min: 50 },
  { status: 'very_low', min: 0 },
]

function resolveComplianceStatus(rate) {
  return (COMPLIANCE_THRESHOLDS.find((t) => rate >= t.min) ?? COMPLIANCE_THRESHOLDS.at(-1)).status
}

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

function parseDMY(str) {
  const [d, m, y] = (str ?? '').split('/').map(Number)
  if (!d || !m || !y) return null
  return new Date(y, m - 1, d)
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// The CSV's "Instansi" column is already how the office is officially
// referred to in the source export (all-caps, acronyms included) — most of
// these acronyms (BAKEUDA, DPPPAKB, SETDAKO, ...) don't have one universally
// agreed full expansion available here, so rather than guess at a "prettier"
// full name, this keeps the office's own text as-is (just trims stray
// whitespace/trailing punctuation) rather than risk publishing a wrong one.
function cleanInstansiName(raw) {
  return raw.replace(/\.$/, '').replace(/\s+/g, ' ').trim()
}

// Short codes for the sidebar/table — literal existing abbreviations where
// the Instansi text already reads as one (SETWAN, BAPPERIDA, KESBANGPOL,
// SETDAKO), a conventional "DIS-" abbreviation for city dinas, and a
// KEC-<name> tag for the three sub-district (kecamatan) offices.
const CODE_OVERRIDES = {
  SETWAN: 'SETWAN',
  BAPPERIDA: 'BAPPERIDA',
  KESBANGPOL: 'KESBANGPOL',
  SETDAKO: 'SETDAKO',
  INSPEKTORAT: 'ITDA',
  'DINAS PARAWISATA KOTA PANGKALPINANG': 'DISPAR',
  'DISNAKER KOTA PANGKAL PINANG': 'DISNAKER',
  'DIKBUD KOTA PANGKALPINANG': 'DIKBUD',
  'BAKEUDA KOTA PANGKALPINANG': 'BAKEUDA',
  'DISKOMINFO PANGKALPINANG': 'DISKOMINFO',
  'DINAS PANGAN & PERTANIAN KOTA PANGKALPINANG': 'DKP3',
  'DPPPAKB KOTA PANGKALPINANG': 'DPPPAKB',
  'SATPOL PP KOTA PANGKAL PINANG': 'SATPOLPP',
  'DISHUB KOTA PANGKALPINANG': 'DISHUB',
  'DINAS PERUMAHAN DAN KAWASAN PERMUKIMAN (DISPERKIM) KOTA PANGKALPINANG.': 'DISPERKIM',
  'DINSOS KOTA PANGKALPINANG': 'DINSOS',
  'DISPORA KOTA PANGKAL PINANG': 'DISPORA',
  'KECAMATAN GIRIMAYA KOTA PANGKALPINANG': 'KEC-GIRIMAYA',
  'KECAMATAN RANGKUI KOTA PANGKALPINANG': 'KEC-RANGKUI',
  'KECAMATAN TAMAN SARI KOTA PANGKALPINANG': 'KEC-TAMANSARI',
}

// Instansi -> kecamatan. The three sub-district offices sit in their own
// kecamatan by definition; every other (city-level) office is round-robined
// across all seven so the map/kecamatan filter still exercises all of them —
// the CSV carries no office address to resolve this from.
const KECAMATAN_OVERRIDES = {
  'KECAMATAN GIRIMAYA KOTA PANGKALPINANG': 'Girimaya',
  'KECAMATAN RANGKUI KOTA PANGKALPINANG': 'Rangkui',
  'KECAMATAN TAMAN SARI KOTA PANGKALPINANG': 'Taman Sari',
}
const KECAMATAN_ROTATION = [
  'Gerunggang',
  'Rangkui',
  'Taman Sari',
  'Bukit Intan',
  'Gabek',
  'Girimaya',
  'Pangkal Balam',
]

// Approximate kecamatan-center coordinates (averaged from the previous
// synthetic seed) — real per-office addresses aren't in the CSV, so each
// office is placed near its kecamatan's center with a small deterministic
// jitter to keep map markers from stacking exactly on top of each other.
const KECAMATAN_CENTERS = {
  Gerunggang: [-2.098816, 106.075044],
  Rangkui: [-2.139559, 106.102728],
  'Taman Sari': [-2.125377, 106.112839],
  'Bukit Intan': [-2.125684, 106.145841],
  Gabek: [-2.090172, 106.106864],
  Girimaya: [-2.142714, 106.117485],
  'Pangkal Balam': [-2.107405, 106.125731],
}

function jitter(seedIndex) {
  // Small deterministic spiral offset, distinct per office within a
  // kecamatan, capped well within the kecamatan's own area.
  const angle = seedIndex * 2.399963229728653 // golden angle, spreads points evenly
  const radius = 0.006 + (seedIndex % 5) * 0.0015
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

const csvText = readFileSync(CSV_PATH, 'utf8')
const rows = parseCSV(csvText)
const header = rows[0]
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

const agg = new Map()
for (let i = 1; i < rows.length; i++) {
  const f = rows[i]
  if (f.length < header.length) continue
  const instansi = f[idx.Instansi]?.trim()
  if (!instansi) continue

  if (!agg.has(instansi)) {
    agg.set(instansi, {
      vehicleCount: 0,
      paidVehicleCount: 0,
      unpaidVehicleCount: 0,
      billingPkb: 0,
      billingOpsenPkb: 0,
      billingSwdkllj: 0,
      paymentPkb: 0,
      paymentOpsenPkb: 0,
      paymentSwdkllj: 0,
      lastPaymentDate: null,
    })
  }
  const a = agg.get(instansi)

  const status = f[idx.STATUS]?.trim()
  const isPaid = status === 'SUDAH BAYAR'
  a.vehicleCount += 1
  if (isPaid) a.paidVehicleCount += 1
  else a.unpaidVehicleCount += 1

  a.billingPkb += Number(f[idx['Pokok PKB']]) || 0
  a.billingOpsenPkb += Number(f[idx['Opsen PKB']]) || 0
  a.billingSwdkllj += Number(f[idx['Pokok SWDKLLJ']]) || 0
  a.paymentPkb += Number(f[idx.PKB_BAYAR]) || 0
  a.paymentOpsenPkb += Number(f[idx.OPSEN_BAYAR]) || 0
  a.paymentSwdkllj += Number(f[idx.SWDKLLJ_BAYAR]) || 0

  if (isPaid) {
    const paidDate = parseDMY(f[idx['Tanggal Bayar']])
    if (paidDate && (!a.lastPaymentDate || paidDate > a.lastPaymentDate)) {
      a.lastPaymentDate = paidDate
    }
  }
}

const instansiNames = [...agg.keys()].sort()
let kecamatanCursor = 0
const opdList = instansiNames.map((instansi, i) => {
  const a = agg.get(instansi)
  const billing = {
    pkb: Math.round(a.billingPkb),
    opsenPkb: Math.round(a.billingOpsenPkb),
    swdkllj: Math.round(a.billingSwdkllj),
  }
  const payment = {
    pkb: Math.round(a.paymentPkb),
    opsenPkb: Math.round(a.paymentOpsenPkb),
    swdkllj: Math.round(a.paymentSwdkllj),
  }
  const totalBilling = billing.pkb + billing.opsenPkb + billing.swdkllj
  const totalPayment = payment.pkb + payment.opsenPkb + payment.swdkllj
  const collectionRate = totalBilling > 0 ? Math.round((totalPayment / totalBilling) * 1000) / 10 : 0

  const kecamatan = KECAMATAN_OVERRIDES[instansi] ?? KECAMATAN_ROTATION[kecamatanCursor++ % KECAMATAN_ROTATION.length]
  const [baseLat, baseLng] = KECAMATAN_CENTERS[kecamatan]
  const [dLat, dLng] = jitter(i)

  return {
    id: `opd-${String(i + 1).padStart(3, '0')}`,
    code: CODE_OVERRIDES[instansi] ?? instansi.split(' ')[0],
    name: cleanInstansiName(instansi),
    kecamatan,
    latitude: Math.round((baseLat + dLat) * 1e6) / 1e6,
    longitude: Math.round((baseLng + dLng) * 1e6) / 1e6,
    vehicleCount: a.vehicleCount,
    paidVehicleCount: a.paidVehicleCount,
    unpaidVehicleCount: a.unpaidVehicleCount,
    collectionRate,
    billing,
    payment,
    unpaidPotential: totalBilling - totalPayment,
    reportingStatus: collectionRate >= REPORTING_ON_TIME_THRESHOLD ? 'on_time' : 'late',
    complianceStatus: resolveComplianceStatus(collectionRate),
    lastPaymentDate: a.lastPaymentDate ? toIso(a.lastPaymentDate) : null,
  }
})

writeFileSync(OUT_PATH, JSON.stringify(opdList, null, 2) + '\n')
console.log(`wrote ${opdList.length} OPD rows to ${OUT_PATH}`)
