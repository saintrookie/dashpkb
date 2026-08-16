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
  const { entityType, status, kecamatan, search, bbox } = params
  return useAsyncResource(() => mapApi.getLocations({ entityType, status, kecamatan, search, bbox }), [
    entityType,
    status,
    kecamatan,
    search,
    JSON.stringify(bbox ?? null),
  ])
}

export function useMapRegions(params = {}) {
  const { level, kecamatanId, metric } = params
  return useAsyncResource(() => mapApi.getRegions({ level, kecamatanId, metric }), [level, kecamatanId, metric])
}

export function useMapRoutes(params = {}) {
  const { status, search } = params
  return useAsyncResource(() => mapApi.getRoutes({ status, search }), [status, search])
}

export function useMapHeatmap(params = {}) {
  const { metric } = params
  return useAsyncResource(() => mapApi.getHeatmapData({ metric }), [metric])
}

const REGION_TYPES = new Set(['kecamatan', 'kelurahan'])

export function useMapEntityDetail(id, type) {
  return useAsyncResource(() => {
    if (!id || !type) return Promise.resolve({ success: false, data: null, meta: null })
    if (REGION_TYPES.has(type)) return mapApi.getRegionById(id, type)
    return mapApi.getLocationById(id)
  }, [id, type])
}

export function useMapSearch(query) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!debouncedQuery || !debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    mapApi.searchMapEntities(debouncedQuery).then((res) => {
      if (cancelled) return
      setResults(res.success ? res.data : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  return { results, loading }
}
