import { Calendar, RefreshCw } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader.jsx'
import FilterCard from '../components/filters/FilterCard.jsx'
import KpiRow from '../components/kpi/KpiRow.jsx'
import ChartsRow from '../components/charts/ChartsRow.jsx'
import ComplianceTable from '../components/table/ComplianceTable.jsx'
import InfoPanel from '../components/footer/InfoPanel.jsx'
import { useDashboard } from '../hooks/useDashboard'
import { useDataFilters } from '../hooks/useDataFilters.js'
import { formatDateLongID } from '../lib/format.js'

export default function TingkatKepatuhanOpdPage() {
  const filters = useDataFilters()
  const { data, loading, error, refetch } = useDashboard({
    taxYear: filters.taxYear ?? undefined,
    periodId: filters.periodId ?? undefined,
  })

  return (
    <>
      <PageHeader
        title="Tingkat Kepatuhan OPD"
        subtitle="Monitoring Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ Per OPD"
      >
        <FilterCard
          icon={Calendar}
          label="Tahun Pajak"
          value={data ? String(data.taxYear) : '—'}
          options={filters.taxYearOptions}
          onChange={filters.setTaxYear}
          showReset={!filters.isTaxYearDefault}
          onReset={filters.resetTaxYear}
        />
        <FilterCard
          icon={Calendar}
          label="Periode Data"
          value={data?.period.label ?? '—'}
          options={filters.periodOptions}
          onChange={filters.setPeriodByLabel}
          showReset={!filters.isPeriodDefault}
          onReset={filters.resetPeriod}
        />
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
      <ComplianceTable taxYear={filters.taxYear ?? undefined} />
      <InfoPanel />
    </>
  )
}
