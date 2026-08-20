import { useMemo } from 'react'
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

export function useKendaraanListForActiveYear() {
  const { year, periodId } = useActivePeriod()
  return useMemo(() => getKendaraanListForYear(year, periodId), [year, periodId])
}

export function usePotensiRowsForActiveYear() {
  const { year, periodId } = useActivePeriod()
  return useMemo(() => getPotensiRowsForYear(year, periodId), [year, periodId])
}
