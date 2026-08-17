import { useMemo } from 'react'
import { useDataFilters } from './useDataFilters.js'
import {
  getKecamatanListForYear,
  getKecamatanSummaryForYear,
  getTrendCollectionRateForYear,
} from '../data/kecamatan.js'
import { getKelurahanListForYear, getRateRangeDistributionForYear } from '../data/kelurahan.js'
import { getKendaraanListForYear } from '../data/kendaraan.js'
import { getPotensiRowsForYear } from '../data/potensiPenagihan.js'

// `taxYear` is null until useDataFilters() resolves the API's default; the
// getXForYear() functions already fall back to the baseline year when given
// undefined, so this just normalizes null -> undefined for them.
function useActiveTaxYear() {
  const { taxYear } = useDataFilters()
  return taxYear ?? undefined
}

export function useKecamatanData() {
  const year = useActiveTaxYear()
  return useMemo(
    () => ({
      list: getKecamatanListForYear(year),
      summary: getKecamatanSummaryForYear(year),
      trend: getTrendCollectionRateForYear(year),
    }),
    [year],
  )
}

export function useKelurahanData() {
  const year = useActiveTaxYear()
  return useMemo(
    () => ({
      list: getKelurahanListForYear(year),
      rateRangeDistribution: getRateRangeDistributionForYear(year),
    }),
    [year],
  )
}

export function useKendaraanListForActiveYear() {
  const year = useActiveTaxYear()
  return useMemo(() => getKendaraanListForYear(year), [year])
}

export function usePotensiRowsForActiveYear() {
  const year = useActiveTaxYear()
  return useMemo(() => getPotensiRowsForYear(year), [year])
}
