import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Table2, Loader2, Inbox } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { formatDateTimeID } from '../lib/format.js'

const REPORT_TYPES = [
  'Ringkasan Kepatuhan OPD',
  'Ringkasan Kecamatan',
  'Ringkasan Kelurahan',
  'Data Kendaraan',
  'Potensi Penagihan',
]

const FORMATS = [
  { key: 'pdf', label: 'PDF', icon: FileText, sizeRange: [400, 1200] },
  { key: 'xlsx', label: 'Excel (XLSX)', icon: FileSpreadsheet, sizeRange: [800, 2600] },
  { key: 'csv', label: 'CSV', icon: Table2, sizeRange: [150, 900] },
]

const INITIAL_HISTORY = [
  {
    id: 'h1',
    name: 'Ringkasan Kepatuhan OPD',
    format: 'xlsx',
    size: '1,4 MB',
    taxYear: '2026',
    period: 's.d. 20 Mei 2026',
    date: '2026-05-19T14:20:00+07:00',
  },
  {
    id: 'h2',
    name: 'Data Kendaraan',
    format: 'csv',
    size: '3,1 MB',
    taxYear: '2026',
    period: 's.d. 20 Mei 2026',
    date: '2026-05-15T09:05:00+07:00',
  },
  {
    id: 'h3',
    name: 'Potensi Penagihan',
    format: 'pdf',
    size: '820 KB',
    taxYear: '2025',
    period: 's.d. 31 Desember 2025',
    date: '2026-04-30T11:40:00+07:00',
  },
]

function randomSizeLabel([min, max]) {
  const kb = Math.round(min + Math.random() * (max - min))
  return kb >= 1024 ? `${(kb / 1024).toFixed(1).replace('.', ',')} MB` : `${kb} KB`
}

export default function UnduhLaporanPage() {
  const dataFilters = useDataFilters()
  const [reportType, setReportType] = useState(REPORT_TYPES[0])
  const [format, setFormat] = useState('xlsx')
  const [generating, setGenerating] = useState(false)
  const [history, setHistory] = useState(INITIAL_HISTORY)

  function handleDownload() {
    if (generating) return
    setGenerating(true)
    window.setTimeout(() => {
      const meta = FORMATS.find((f) => f.key === format)
      setHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          name: reportType,
          format,
          size: randomSizeLabel(meta.sizeRange),
          taxYear: dataFilters.taxYearLabel || '—',
          period: dataFilters.periodLabel || '—',
          date: new Date().toISOString(),
        },
        ...prev,
      ])
      setGenerating(false)
    }, 1200)
  }

  return (
    <>
      <PageHeader title="Unduh Laporan" subtitle="Unduh Laporan Kepatuhan Pajak Kendaraan" />

      <Card className="p-5 mb-4">
        <h2 className="text-[13px] font-bold text-navy-900 dark:text-white tracking-wide mb-4">
          KONFIGURASI LAPORAN
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Select label="Jenis Laporan" value={reportType} onChange={setReportType} options={REPORT_TYPES} />
          <Select
            label="Tahun Pajak"
            value={dataFilters.taxYearLabel}
            onChange={dataFilters.setTaxYear}
            options={dataFilters.taxYearOptions}
          />
          <Select
            label="Periode Data"
            value={dataFilters.periodLabel}
            onChange={dataFilters.setPeriodByLabel}
            options={dataFilters.periodOptions}
          />
          <div>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Format File
            </span>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => {
                const Icon = f.icon
                const active = format === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFormat(f.key)}
                    aria-pressed={active}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                      active
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/15'
                        : 'border-surface-border dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-brand-blue/40 hover:text-brand-blue'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-surface-border dark:border-white/10">
          <Button variant="primary" icon={generating ? undefined : Download} onClick={handleDownload} disabled={generating}>
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Menyiapkan berkas...
              </span>
            ) : (
              'Unduh Laporan'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-[13px] font-bold text-navy-900 dark:text-white tracking-wide mb-4">
          RIWAYAT UNDUHAN
        </h2>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-surface-border dark:border-white/10">
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nama Laporan
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tahun Pajak
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Periode Data
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Format
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-right">
                  Ukuran
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tanggal Unduh
                </th>
                <th className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                      <Inbox size={26} strokeWidth={1.5} />
                      <p className="text-sm">Belum ada laporan yang diunduh.</p>
                    </div>
                  </td>
                </tr>
              )}
              {history.map((row) => {
                const meta = FORMATS.find((f) => f.key === row.format)
                const Icon = meta.icon
                return (
                  <tr
                    key={row.id}
                    className="border-b border-surface-border dark:border-white/10 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-2.5 py-2.5 text-[12px] font-semibold text-navy-900 dark:text-white whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {row.taxYear}
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {row.period}
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon size={13} className="text-slate-400 dark:text-slate-500" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 text-right whitespace-nowrap">
                      {row.size}
                    </td>
                    <td className="px-2.5 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateTimeID(row.date)}
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      <Badge>Berhasil</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
