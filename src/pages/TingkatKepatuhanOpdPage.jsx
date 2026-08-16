import { Calendar, RefreshCw } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRow from '../components/kpi/KpiRow.jsx'
import ChartsRow from '../components/charts/ChartsRow.jsx'
import ComplianceTable from '../components/table/ComplianceTable.jsx'
import InfoPanel from '../components/footer/InfoPanel.jsx'
import { useDashboard } from '../hooks/useDashboard'
import { formatDateLongID } from '../lib/format.js'

export default function TingkatKepatuhanOpdPage() {
  const { data, loading, error, refetch } = useDashboard()

  return (
    <>
      <PageHeader
        title="Tingkat Kepatuhan OPD"
        subtitle="Monitoring Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ Per OPD"
      >
        <FilterCard icon={Calendar} label="Tahun Pajak" value={data ? String(data.taxYear) : '—'} />
        <FilterCard icon={Calendar} label="Periode Data" value={data?.period.label ?? '—'} />
        <FilterCard
          icon={({ className = '', ...rest }) => (
            <RefreshCw
              {...rest}
              className={`${className} ${loading ? 'animate-spin' : ''}`}
            />
          )}
          label="Terakhir Update"
          value={data ? formatDateLongID(data.lastUpdatedAt) : '—'}
          onIconClick={refetch}
        />
      </PageHeader>

      <KpiRow data={data} loading={loading} error={error} />
      <ChartsRow data={data} loading={loading} error={error} />
      <ComplianceTable />
      <InfoPanel />
    </>
  )
}
