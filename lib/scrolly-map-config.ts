/** Paleta y geometría del mapa scrolly (misma que el Leaflet anterior). */
export const MAP_COLORS = {
  ocean: "#080e1c",
  landFill: "#1a2540",
  landStroke: "#0d1a2d",
  routeDoha: "#e8e8f0",
  routeMiami: "#4eaadc",
  cityPrimary: "#4eaadc",
  cityAccent: "#e8e8f0",
  cityRing: "#080e1c",
} as const

/** Coordenadas [longitud, latitud] — orden D3/geo. */
export const BSAS: [number, number] = [-58.3816, -34.6037]
export const DOHA: [number, number] = [51.531, 25.2854]
export const MIAMI: [number, number] = [-80.1918, 25.7617]

export type CityId = "bsas" | "doha" | "miami"

export const CITIES: Array<{
  id: CityId
  coords: [number, number]
  label: string
  color: typeof MAP_COLORS.cityPrimary | typeof MAP_COLORS.cityAccent
}> = [
  { id: "bsas", coords: BSAS, label: "Buenos Aires", color: MAP_COLORS.cityPrimary },
  { id: "doha", coords: DOHA, label: "Doha, Qatar", color: MAP_COLORS.cityAccent },
  { id: "miami", coords: MIAMI, label: "Miami, EEUU", color: MAP_COLORS.cityPrimary },
]

/** Tamaño visual en pantalla (px); no escala con el zoom del mapa. */
export const LABEL_FONT_PX = 11
export const CITY_DOT_R = 4
export const CITY_DOT_R_ACTIVE = 7
export const CITY_DOT_STROKE = 2
/** Grosor objetivo en pantalla (px); se divide por la escala de cámara. */
export const COUNTRY_STROKE_PX = 0.5
export const ROUTE_STROKE_PX = 2.5
export const ROUTE_DASH_PX: [number, number] = [8, 6]
export const PLANE_SIZE_PX = 27
/** Offset de autoRotate: el ícono apunta hacia arriba en el viewBox. */
export const PLANE_ROTATE_OFFSET = 90

/**
 * “Cámara falsa”: centro [lon, lat] + escala relativa al fit mundial inicial.
 * Escala > 1 = acercar. Rutas (pasos 1 y 3) más cerca; ciudades (0, 2, 4) sin quedar lejanas.
 */
export const CAMERA_BY_STEP: Array<{
  center: [number, number]
  scale: { narrow: number; wide: number }
}> = [
  { center: BSAS, scale: { narrow: 40, wide: 35 } },
  { center: [-8, -8], scale: { narrow: 2.2, wide: 2.5 } },
  { center: DOHA, scale: { narrow: 16, wide: 12 } },
  { center: [-69, -5], scale: { narrow: 6, wide: 4 } },
  { center: MIAMI, scale: { narrow: 40, wide: 15 } },
]

export function routeOpacity(step: number, route: "doha" | "miami"): number {
  if (step <= 0) return 0.22
  if (route === "doha") return step <= 2 ? 0.88 : 0.22
  return step >= 3 ? 0.88 : 0.22
}

export function cityActive(step: number, id: CityId): boolean {
  if (id === "bsas") return step === 0
  if (id === "doha") return step === 1 || step === 2
  return step === 3 || step === 4
}
