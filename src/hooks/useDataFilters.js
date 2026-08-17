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

  const periods = filtersData?.periods ?? []
  const taxYearOptions = filtersData ? [...filtersData.taxYears].sort((a, b) => b - a).map(String) : []
  const periodOptions = periods.map((p) => p.label)
  const periodLabel = periods.find((p) => p.id === periodId)?.label ?? ''
  const periodIdByLabel = Object.fromEntries(periods.map((p) => [p.label, p.id]))

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
