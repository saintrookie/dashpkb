import kecamatanGeo from '../data/geo/pangkalpinang-kecamatan.json'

export const kecamatanGeoByName = new Map(kecamatanGeo.features.map((f) => [f.properties.name, f.properties]))
export const kecamatanNameById = new Map(kecamatanGeo.features.map((f) => [f.properties.id, f.properties.name]))
