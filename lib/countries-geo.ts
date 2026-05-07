import type { GeoJsonObject } from "geojson"

export type CountriesGeoDetail = "lite" | "full"

const cache: Partial<Record<CountriesGeoDetail, GeoJsonObject>> = {}
const inflight: Partial<Record<CountriesGeoDetail, Promise<GeoJsonObject>>> = {}

async function fetchGeo(path: string): Promise<GeoJsonObject> {
  const r = await fetch(path)
  if (!r.ok) throw new Error(`countries geo: ${path}`)
  return r.json() as Promise<GeoJsonObject>
}

async function loadDetail(detail: CountriesGeoDetail): Promise<GeoJsonObject> {
  if (detail === "lite") {
    try {
      return await fetchGeo("/mundial/countries-110m.geojson")
    } catch {
      return fetchGeo("/countries-110m.geojson")
    }
  }
  try {
    return await fetchGeo("/mundial/countries.geojson")
  } catch {
    return fetchGeo("/countries.geojson")
  }
}

/**
 * Geo de países con cache por nivel de detalle.
 * Por defecto **lite** (~840 KB, Natural Earth 110m): suficiente para zoom mundial y flyTo fluido.
 * `full` (~12 MB) solo si hace falta máximo detalle en fronteras.
 */
export function loadCountriesGeo(options?: { detail?: CountriesGeoDetail }): Promise<GeoJsonObject> {
  const detail = options?.detail ?? "lite"
  if (cache[detail]) return Promise.resolve(cache[detail]!)
  if (!inflight[detail]) {
    inflight[detail] = (async () => {
      try {
        const data = await loadDetail(detail)
        cache[detail] = data
        return data
      } finally {
        delete inflight[detail]
      }
    })()
  }
  return inflight[detail]!
}
