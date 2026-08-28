import { useEffect } from 'react'
import * as mockApi from '../services/mockApi'
import { useDataFilterStore } from '../store/dataFilterStore.js'
import { useFilters } from './useFilters.js'

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useDataFilters() {
  const { data: filtersData } = useFilters()
  const taxYear = useDataFilterStore((s) => s.taxYear)
  const periodId = useDataFilterStore((s) => s.periodId)
  const fromDateOverride = useDataFilterStore((s) => s.fromDate)
  const toDateOverride = useDataFilterStore((s) => s.toDate)
  const initialized = useDataFilterStore((s) => s.initialized)
  const initializeDefaults = useDataFilterStore((s) => s.initializeDefaults)
  const setTaxYearRaw = useDataFilterStore((s) => s.setTaxYear)
  const setPeriodId = useDataFilterStore((s) => s.setPeriodId)
  const setFromDate = useDataFilterStore((s) => s.setFromDate)
  const setToDate = useDataFilterStore((s) => s.setToDate)
  const resetTaxYear = useDataFilterStore((s) => s.resetTaxYear)
  const resetPeriod = useDataFilterStore((s) => s.resetPeriod)
  const isTaxYearDefault = useDataFilterStore((s) => s.taxYear === s.defaultTaxYear)
  const isPeriodDefault = useDataFilterStore(
    (s) => s.periodId === s.defaultPeriodId && s.fromDate == null && s.toDate == null,
  )

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
  const periodsForYear = taxYear != null ? periods.filter((p) => p.id.startsWith(`${taxYear}-`)) : periods
  const taxYearOptions = filtersData ? [...filtersData.taxYears].sort((a, b) => b - a).map(String) : []
  const periodOptions = periodsForYear.map((p) => p.label)
  const periodByLabel = Object.fromEntries(periodsForYear.map((p) => [p.label, p]))
  const periodLabel = periodsForYear.find((p) => p.id === periodId)?.label ?? ''

  // Free range bounds for the current tax year: Jan 1 through today for the
  // active year, or through Dec 31 for a past one. The user can pick ANY day
  // in that window — the picker never snaps to a fixed period snapshot.
  const currentRealYear = new Date().getFullYear()
  const minPeriodDate = taxYear != null ? `${taxYear}-01-01` : undefined
  const maxPeriodDate =
    taxYear != null ? (taxYear >= currentRealYear ? todayIso() : `${taxYear}-12-31`) : undefined

  const fromDate = fromDateOverride ?? minPeriodDate ?? ''
  const toDate = toDateOverride ?? maxPeriodDate ?? ''
  const isFromDateDefault = fromDateOverride == null
  const isToDateDefault = toDateOverride == null

  // The mock data only has discrete period snapshots to compute its
  // paid/unpaid ratios from, so whichever snapshot sits on/before "to"
  // drives those numbers — this only updates `periodId`, it never rewrites
  // what the date inputs display.
  useEffect(() => {
    if (!initialized || periodsForYear.length === 0 || !toDate) return
    const onOrBefore = periodsForYear.filter((p) => p.date <= toDate)
    const chosen =
      onOrBefore.length > 0
        ? onOrBefore.reduce((latest, p) => (p.date > latest.date ? p : latest))
        : periodsForYear.reduce((earliest, p) => (p.date < earliest.date ? p : earliest))
    if (chosen.id !== periodId) setPeriodId(chosen.id)
  }, [initialized, toDate, periodsForYear, periodId, setPeriodId])

  return {
    ready: initialized && !!filtersData,
    taxYear,
    periodId,
    taxYearLabel: taxYear != null ? String(taxYear) : '',
    periodLabel,
    fromDate,
    toDate,
    minPeriodDate,
    maxPeriodDate,
    isFromDateDefault,
    isToDateDefault,
    taxYearOptions,
    periodOptions,
    setTaxYear: (value) => setTaxYearRaw(Number(value)),
    // Also pins `toDate` to the picked period's own date — otherwise the
    // toDate-driven effect above would see `toDate` unchanged on the next
    // render and immediately snap `periodId` back to whatever it resolves
    // to from the old toDate, undoing this selection (used by the sidebar's
    // and Unduh Laporan's period dropdowns, which pick by label/snapshot
    // rather than through the free date-range picker).
    setPeriodByLabel: (label) => {
      const target = periodByLabel[label]
      if (!target) return
      setPeriodId(target.id)
      setToDate(target.date)
    },
    setFromDate,
    setToDate,
    isTaxYearDefault,
    isPeriodDefault,
    resetTaxYear,
    resetPeriod,
  }
}
