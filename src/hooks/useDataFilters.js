import { useEffect } from 'react'
import * as mockApi from '../services/mockApi'
import { useDataFilterStore } from '../store/dataFilterStore.js'
import { useFilters } from './useFilters.js'

export function useDataFilters() {
  const { data: filtersData } = useFilters()
  const taxYear = useDataFilterStore((s) => s.taxYear)
  const periodId = useDataFilterStore((s) => s.periodId)
  const initialized = useDataFilterStore((s) => s.initialized)
  const initializeDefaults = useDataFilterStore((s) => s.initializeDefaults)
  const setTaxYearRaw = useDataFilterStore((s) => s.setTaxYear)
  const setPeriodId = useDataFilterStore((s) => s.setPeriodId)
  const resetTaxYear = useDataFilterStore((s) => s.resetTaxYear)
  const resetPeriod = useDataFilterStore((s) => s.resetPeriod)
  const isTaxYearDefault = useDataFilterStore((s) => s.taxYear === s.defaultTaxYear)
  const isPeriodDefault = useDataFilterStore((s) => s.periodId === s.defaultPeriodId)

  useEffect(() => {
    if (initialized) return
    let cancelled = false
    mockApi.getDashboard({}).then((res) => {
      if (cancelled || !res.success) return
      initializeDefaults(res.data.taxYear, res.data.period.id)
    })
    return () => {
      cancelled = true
    }
  }, [initialized, initializeDefaults])

  // Periods are year-scoped (e.g. "2026-04-30" only makes sense while
  // "Tahun Pajak" is 2026), so once a tax year is picked, only offer that
  // year's own periods and snap the selection onto one of them.
  useEffect(() => {
    if (!initialized || taxYear == null || !filtersData) return
    const validPeriods = filtersData.periods.filter((p) => p.id.startsWith(`${taxYear}-`))
    if (validPeriods.length === 0 || validPeriods.some((p) => p.id === periodId)) return
    setPeriodId(validPeriods[0].id)
  }, [initialized, taxYear, filtersData, periodId, setPeriodId])

  const periods = filtersData?.periods ?? []
  const periodsForYear = taxYear != null ? periods.filter((p) => p.id.startsWith(`${taxYear}-`)) : periods
  const taxYearOptions = filtersData ? [...filtersData.taxYears].sort((a, b) => b - a).map(String) : []
  const periodOptions = periodsForYear.map((p) => p.label)
  const periodLabel = periodsForYear.find((p) => p.id === periodId)?.label ?? ''
  const periodIdByLabel = Object.fromEntries(periodsForYear.map((p) => [p.label, p.id]))

  return {
    ready: initialized && !!filtersData,
    taxYear,
    periodId,
    taxYearLabel: taxYear != null ? String(taxYear) : '',
    periodLabel,
    taxYearOptions,
    periodOptions,
    setTaxYear: (value) => setTaxYearRaw(Number(value)),
    setPeriodByLabel: (label) => setPeriodId(periodIdByLabel[label] ?? periodId),
    isTaxYearDefault,
    isPeriodDefault,
    resetTaxYear,
    resetPeriod,
  }
}
