import { useEffect, useMemo, useState } from 'react'
import { useDataFilters } from './useDataFilters.js'
import {
  getKecamatanListForYear,
  getKecamatanSummaryForYear,
  getKecamatanSummaryDelta,
  getTrendCollectionRateForYear,
} from '../data/kecamatan.js'
import { getKelurahanListForYear, getRateRangeDistributionForYear } from '../data/kelurahan.js'
import { getKendaraanListForYear } from '../data/kendaraan.js'
import { getPotensiRowsForYear } from '../data/potensiPenagihan.js'

// `taxYear`/`periodId` are null until useDataFilters() resolves the API's
// defaults; the getXForYear() functions already fall back to the baseline
// year/period when given undefined, so this just normalizes null -> undefined.
function useActivePeriod() {
  const { taxYear, periodId } = useDataFilters()
  return { year: taxYear ?? undefined, periodId: periodId ?? undefined }
}

export function useKecamatanData() {
  const { year, periodId } = useActivePeriod()
  return useMemo(
    () => ({
      list: getKecamatanListForYear(year, periodId),
      summary: getKecamatanSummaryForYear(year, periodId),
      summaryDelta: getKecamatanSummaryDelta(year, periodId),
      trend: getTrendCollectionRateForYear(year),
    }),
    [year, periodId],
  )
}

export function useKelurahanData() {
  const { year, periodId } = useActivePeriod()
  return useMemo(
    () => ({
      list: getKelurahanListForYear(year, periodId),
      rateRangeDistribution: getRateRangeDistributionForYear(year, periodId),
    }),
    [year, periodId],
  )
}

// Both getKendaraanListForYear() and getPotensiRowsForYear() are async —
// the baseline year's real vehicle data is a ~16MB JSON file loaded via a
// dynamic import, fetched only once one of these hooks is actually mounted
// (Data Kendaraan / Potensi Penagihan), not on every page.
export function useKendaraanListForActiveYear() {
  const { year, periodId } = useActivePeriod()
  const [state, setState] = useState({ list: [], loading: true })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ list: s.list, loading: true }))
    getKendaraanListForYear(year, periodId).then((list) => {
      if (!cancelled) setState({ list, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [year, periodId])

  return state
}

export function usePotensiRowsForActiveYear() {
  const { year, periodId } = useActivePeriod()
  const [state, setState] = useState({ list: [], loading: true })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ list: s.list, loading: true }))
    getPotensiRowsForYear(year, periodId).then((list) => {
      if (!cancelled) setState({ list, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [year, periodId])

  return state
}
