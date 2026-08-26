import { useCallback, useEffect, useState } from 'react'
import * as mapApi from '../api/mapApi.js'
import { useDebouncedValue } from './useDebouncedValue.js'

function useAsyncResource(fetcher, deps) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setError('Gagal memuat data peta')
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data peta')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])
  return { data, loading, error, refetch }
}

export function useMapEntities(params = {}) {
  const { entityType, status, kecamatan, search, bbox, taxYear } = params
  return useAsyncResource(() => mapApi.getLocations({ entityType, status, kecamatan, search, bbox, taxYear }), [
    entityType,
    status,
    kecamatan,
    search,
    JSON.stringify(bbox ?? null),
    taxYear,
  ])
}

export function useMapRegions(params = {}) {
  const { level, kecamatanId, metric, taxYear, periodId } = params
  return useAsyncResource(() => mapApi.getRegions({ level, kecamatanId, metric, taxYear, periodId }), [
    level,
    kecamatanId,
    metric,
    taxYear,
    periodId,
  ])
}

export function useMapRoutes(params = {}) {
  const { status, search } = params
  return useAsyncResource(() => mapApi.getRoutes({ status, search }), [status, search])
}

export function useMapHeatmap(params = {}) {
  const { metric, taxYear } = params
  return useAsyncResource(() => mapApi.getHeatmapData({ metric, taxYear }), [metric, taxYear])
}

const REGION_TYPES = new Set(['kecamatan', 'kelurahan'])

export function useMapEntityDetail(id, type, taxYear, periodId) {
  return useAsyncResource(() => {
    if (!id || !type) return Promise.resolve({ success: false, data: null, meta: null })
    if (REGION_TYPES.has(type)) return mapApi.getRegionById(id, type, taxYear, periodId)
    return mapApi.getLocationById(id, taxYear)
  }, [id, type, taxYear, periodId])
}

export function useMapSearch(query, { types } = {}) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const typesKey = types ? types.join(',') : ''

  useEffect(() => {
    if (!debouncedQuery || !debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    mapApi.searchMapEntities(debouncedQuery, { types }).then((res) => {
      if (cancelled) return
      setResults(res.success ? res.data : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, typesKey])

  return { results, loading }
}
