import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import * as mockApi from '../services/mockApi.js'
import { getKecamatanListForYear } from '../data/kecamatan.js'
import { getKelurahanListForYear } from '../data/kelurahan.js'
import { getKendaraanListForYear } from '../data/kendaraan.js'
import { getPotensiRowsForYear } from '../data/potensiPenagihan.js'
import { complianceStatusLabel } from './complianceStatus.js'
import { formatNumberID, formatRupiahFull, formatPercent } from './format.js'

const REPORTING_STATUS_LABELS = { on_time: 'Tepat Waktu', late: 'Terlambat' }

// Client-side PDF/XLSX generation gets impractically slow (and the file
// unreasonably large) past a few thousand rows, so per-vehicle reports are
// capped to a representative slice rather than every synthetic record.
const MAX_DETAIL_ROWS = 1000

function col(label, value, { numeric = false, format } = {}) {
  return { label, value, numeric, format: format ?? ((v) => (v == null ? '' : String(v))) }
}

async function getOpdRows(taxYear) {
  const res = await mockApi.getOpd({ taxYear, perPage: 1000 })
  return res.success ? res.data : []
}

async function getReportData(reportType, taxYear, periodId) {
  switch (reportType) {
    case 'Ringkasan Kepatuhan OPD': {
      const rows = await getOpdRows(taxYear)
      return {
        title: 'Ringkasan Kepatuhan OPD',
        rows,
        columns: [
          col('Kode', (r) => r.code),
          col('Nama OPD', (r) => r.name),
          col('Kecamatan', (r) => r.kecamatan),
          col('Jumlah Kendaraan', (r) => r.vehicleCount, { numeric: true, format: formatNumberID }),
          col('Sudah Bayar', (r) => r.paidVehicleCount, { numeric: true, format: formatNumberID }),
          col('Belum Bayar', (r) => r.unpaidVehicleCount, { numeric: true, format: formatNumberID }),
          col('Collection Rate (%)', (r) => r.collectionRate, { numeric: true, format: (v) => formatPercent(v, 1) }),
          col('Penerimaan PKB', (r) => r.payment.pkb, { numeric: true, format: formatRupiahFull }),
          col('Opsen PKB', (r) => r.payment.opsenPkb, { numeric: true, format: formatRupiahFull }),
          col('Potensi Belum Bayar', (r) => r.unpaidPotential, { numeric: true, format: formatRupiahFull }),
          col('Status Kepatuhan', (r) => complianceStatusLabel(r.complianceStatus)),
          col('Status Lapor', (r) => REPORTING_STATUS_LABELS[r.reportingStatus] ?? r.reportingStatus),
        ],
      }
    }

    case 'Ringkasan Kecamatan': {
      const rows = getKecamatanListForYear(taxYear, periodId)
      return {
        title: 'Ringkasan Kecamatan',
        rows,
        columns: [
          col('No', (r) => r.no, { numeric: true }),
          col('Kecamatan', (r) => r.kecamatan),
          col('Jumlah Kendaraan', (r) => r.jumlahKendaraan, { numeric: true, format: formatNumberID }),
          col('Sudah Bayar', (r) => r.sudahBayar, { numeric: true, format: formatNumberID }),
          col('Belum Bayar', (r) => r.belumBayar, { numeric: true, format: formatNumberID }),
          col('Collection Rate (%)', (r) => r.collectionRate, { numeric: true, format: (v) => formatPercent(v, 1) }),
          col('Penerimaan PKB', (r) => r.penerimaanPkb, { numeric: true, format: formatRupiahFull }),
          col('Opsen PKB', (r) => r.opsenPkb, { numeric: true, format: formatRupiahFull }),
          col('Potensi Belum Bayar', (r) => r.potensiBelumBayar, { numeric: true, format: formatRupiahFull }),
          col('Penerimaan SWDKLLJ', (r) => r.penerimaanSwdkllj, { numeric: true, format: formatRupiahFull }),
        ],
      }
    }

    case 'Ringkasan Kelurahan': {
      const rows = getKelurahanListForYear(taxYear, periodId)
      return {
        title: 'Ringkasan Kelurahan',
        rows,
        columns: [
          col('No', (r) => r.no, { numeric: true }),
          col('Kelurahan', (r) => r.kelurahan),
          col('Kecamatan', (r) => r.kecamatan),
          col('Jumlah Kendaraan', (r) => r.jumlahKendaraan, { numeric: true, format: formatNumberID }),
          col('Sudah Bayar', (r) => r.sudahBayar, { numeric: true, format: formatNumberID }),
          col('Belum Bayar', (r) => r.belumBayar, { numeric: true, format: formatNumberID }),
          col('Collection Rate (%)', (r) => r.collectionRate, { numeric: true, format: (v) => formatPercent(v, 1) }),
          col('Penerimaan PKB', (r) => r.penerimaanPkb, { numeric: true, format: formatRupiahFull }),
          col('Opsen PKB', (r) => r.opsenPkb, { numeric: true, format: formatRupiahFull }),
          col('Potensi Belum Bayar', (r) => r.potensiBelumBayar, { numeric: true, format: formatRupiahFull }),
          col('Status', (r) => complianceStatusLabel(r.status)),
        ],
      }
    }

    case 'Data Kendaraan': {
      const all = getKendaraanListForYear(taxYear, periodId)
      const rows = all.slice(0, MAX_DETAIL_ROWS)
      return {
        title: 'Data Kendaraan',
        note:
          all.length > rows.length
            ? `Menampilkan ${formatNumberID(rows.length)} dari ${formatNumberID(all.length)} kendaraan`
            : undefined,
        rows,
        columns: vehicleColumns(),
      }
    }

    case 'Potensi Penagihan': {
      const all = getPotensiRowsForYear(taxYear, periodId)
      const rows = all.slice(0, MAX_DETAIL_ROWS)
      return {
        title: 'Potensi Penagihan',
        note:
          all.length > rows.length
            ? `Menampilkan ${formatNumberID(rows.length)} dari ${formatNumberID(all.length)} kendaraan belum lunas`
            : undefined,
        rows,
        columns: vehicleColumns(),
      }
    }

    default:
      throw new Error(`Jenis laporan tidak dikenal: ${reportType}`)
  }
}

function vehicleColumns() {
  return [
    col('No Polisi', (r) => r.noPolisi),
    col('Nama Pemilik', (r) => r.namaPemilik),
    col('Alamat', (r) => r.alamat),
    col('Kelurahan', (r) => r.kelurahan),
    col('Kecamatan', (r) => r.kecamatan),
    col('Jenis Kendaraan', (r) => r.jenisLabel),
    col('Merk', (r) => r.merk),
    col('Tahun Buat', (r) => r.tahunBuat, { numeric: true }),
    col('Jatuh Tempo', (r) => r.tglJatuhTempo),
    col('Status Bayar', (r) => r.statusBayar),
    col('Tunggakan (Tahun)', (r) => r.tunggakanTahun, { numeric: true }),
    col('PKB', (r) => r.pkb, { numeric: true, format: formatRupiahFull }),
    col('Opsen PKB', (r) => r.opsenPkb, { numeric: true, format: formatRupiahFull }),
    col('SWDKLLJ', (r) => r.swdkllj, { numeric: true, format: formatRupiahFull }),
    col('Total', (r) => r.total, { numeric: true, format: formatRupiahFull }),
  ]
}

function csvCell(value) {
  const str = String(value ?? '')
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function toCsv(columns, rows) {
  // Semicolon delimiter: id-ID number formatting uses a comma as the decimal
  // separator (e.g. "78,0%"), which a comma-delimited CSV would split on —
  // Excel's Indonesian locale expects ";" for exactly this reason.
  const header = columns.map((c) => csvCell(c.label)).join(';')
  const lines = rows.map((row) => columns.map((c) => csvCell(c.format(c.value(row)))).join(';'))
  return '﻿' + [header, ...lines].join('\r\n')
}

async function toXlsxBlob(title, columns, rows) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title.slice(0, 31) || 'Laporan')
  sheet.columns = columns.map((c) => ({ header: c.label, key: c.label, width: Math.max(12, c.label.length + 4) }))
  rows.forEach((row) => {
    const record = {}
    columns.forEach((c) => {
      const raw = c.value(row)
      record[c.label] = c.numeric ? raw : c.format(raw)
    })
    sheet.addRow(record)
  })
  sheet.getRow(1).font = { bold: true }
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function toPdfBlob({ title, meta, columns, rows }) {
  const doc = new jsPDF({ orientation: columns.length > 7 ? 'landscape' : 'portrait', unit: 'pt' })
  doc.setFontSize(14)
  doc.text(title, 30, 32)
  doc.setFontSize(9)
  doc.text(meta, 30, 48)
  autoTable(doc, {
    startY: 48 + meta.length * 12,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => c.format(c.value(row)))),
    styles: { fontSize: 7, cellPadding: 3 },
    headStyles: { fillColor: [22, 104, 227] },
    margin: { left: 30, right: 30 },
  })
  return doc.output('blob')
}

const FORMAT_EXT = { pdf: 'pdf', xlsx: 'xlsx', csv: 'csv' }

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function generateReportFile({ reportType, format, taxYear, periodId, periodLabel }) {
  const { title, columns, rows, note } = await getReportData(reportType, taxYear, periodId)
  const meta = [`Tahun Pajak: ${taxYear}`, `Periode Data: ${periodLabel ?? '-'}`, note].filter(Boolean)

  let blob
  if (format === 'csv') blob = new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' })
  else if (format === 'xlsx') blob = await toXlsxBlob(title, columns, rows)
  else blob = toPdfBlob({ title, meta, columns, rows })

  const filename = `${slugify(title)}-${taxYear}-${periodId ?? 'default'}.${FORMAT_EXT[format]}`
  return { blob, filename }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
