import kecamatanGeo from '../data/geo/pangkalpinang-kecamatan.json'
import kelurahanGeo from '../data/geo/pangkalpinang-kelurahan.json'
import { slugify } from './slug.js'

export const kecamatanGeoByName = new Map(kecamatanGeo.features.map((f) => [f.properties.name, f.properties]))
export const kecamatanNameById = new Map(kecamatanGeo.features.map((f) => [f.properties.id, f.properties.name]))
export const kelurahanGeoByName = new Map(kelurahanGeo.features.map((f) => [f.properties.name, f.properties]))

// URL-facing slugs for the /kecamatan/:kecamatanSlug and
// /kecamatan/:kecamatanSlug/:kelurahanSlug detail pages — derived from the
// name rather than the internal geo `id` (kec-bukit-intan, kel-...) to keep
// the URLs short and readable.
export function kecamatanSlug(name) {
  return slugify(name)
}

export function kelurahanSlug(name) {
  return slugify(name)
}

export function kecamatanNameBySlug(slug) {
  for (const name of kecamatanGeoByName.keys()) {
    if (slugify(name) === slug) return name
  }
  return null
}

export function kelurahanNameBySlug(kecamatanName, slug) {
  for (const props of kelurahanGeoByName.values()) {
    if (props.kecamatanName === kecamatanName && slugify(props.name) === slug) return props.name
  }
  return null
}
