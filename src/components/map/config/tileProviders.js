/**
 * OSM-compatible tile providers. All are OpenStreetMap-data-based rasters
 * with the required attribution; swapping the active provider never touches
 * the data layers (markers/regions/heatmap/routes) above it.
 *
 * light/dark use MapTiler's raster tiles (MapTiler is the company behind
 * MapLibre GL JS) instead of CARTO. Unlike CARTO's tiles, these require a
 * free API key -- set VITE_MAPTILER_KEY in .env.local (see .env.example).
 * Without a key, light/dark fall back to the key-less OSM standard tiles so
 * the map still renders, just without the light/dark styling.
 */
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

function maptilerOrFallback(styleId, label) {
  if (!MAPTILER_KEY) {
    return {
      id: styleId,
      label,
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19,
    }
  }
  return {
    id: styleId,
    label,
    url: `https://api.maptiler.com/maps/${styleId}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    attribution:
      '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: '',
    maxZoom: 20,
  }
}

if (!MAPTILER_KEY && import.meta.env.DEV) {
  console.warn(
    '[tileProviders] VITE_MAPTILER_KEY is not set -- light/dark map styles will fall back to plain OSM tiles. See .env.example.',
  )
}

export const TILE_PROVIDERS = {
  light: maptilerOrFallback('dataviz', 'Terang'),
  dark: maptilerOrFallback('dataviz-dark', 'Gelap'),
  standard: {
    id: 'standard',
    label: 'OSM Standar',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
}

export const BOUNDARY_DATA_ATTRIBUTION = 'Batas wilayah: BPS/HDX 2020'

export function tileProviderForTheme(isDark, styleOverride) {
  if (styleOverride && TILE_PROVIDERS[styleOverride]) return TILE_PROVIDERS[styleOverride]
  return isDark ? TILE_PROVIDERS.dark : TILE_PROVIDERS.light
}
