/**
 * OSM-compatible tile providers. All are OpenStreetMap-data-based rasters
 * with the required attribution; swapping the active provider never touches
 * the data layers (markers/regions/heatmap/routes) above it.
 */
export const TILE_PROVIDERS = {
  light: {
    id: 'light',
    label: 'Terang',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  dark: {
    id: 'dark',
    label: 'Gelap',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_matter/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
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
