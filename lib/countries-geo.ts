import type { GeoJsonObject } from "geojson"

export type CountriesGeoDetail = "lite" | "full"

const GEO_PATHS: Record<CountriesGeoDetail, string[]> = {
  lite: ["/countries-110m.geojson"],
  full: ["/countries-50m.geojson", "/countries.geojson"],
}

const cache: Partial<Record<CountriesGeoDetail, GeoJsonObject>> = {}
const inflight: Partial<Record<CountriesGeoDetail, Promise<GeoJsonObject>>> = {}

async function fetchGeo(path: string): Promise<GeoJsonObject> {
  const r = await fetch(path)
  if (!r.ok) throw new Error(`countries geo: ${path}`)
  return r.json() as Promise<GeoJsonObject>
}

async function loadDetail(detail: CountriesGeoDetail): Promise<GeoJsonObject> {
  const paths = GEO_PATHS[detail]
  let lastErr: unknown
  for (const path of paths) {
    try {
      return await fetchGeo(path)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr ?? new Error(`countries geo: ${detail}`)
}

/**
 * Geo de países con cache por nivel de detalle.
 * Por defecto **lite** (~840 KB, Natural Earth 110m).
 * **full** (~3 MB, Natural Earth 50m): fronteras nítidas en retina/4K para mapas SVG.
 */
/** Devuelve geo ya en cache (p. ej. tras preload en cancha-section). */
export function getCountriesGeoCached(detail: CountriesGeoDetail = "lite"): GeoJsonObject | null {
  return cache[detail] ?? null
}

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
