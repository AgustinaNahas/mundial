import { geoInterpolate, geoPath, type GeoPermissibleObjects, type GeoProjection } from "d3"

/**
 * Arco de gran círculo entre dos puntos [lon, lat].
 * En proyección Natural Earth se lee como curva editorial (no GIS).
 */
export function greatCircleCoords(
  from: [number, number],
  to: [number, number],
  segments = 72,
): [number, number][] {
  const interpolate = geoInterpolate(from, to)
  return Array.from({ length: segments + 1 }, (_, i) =>
    interpolate(i / segments),
  ) as [number, number][]
}

/** Convierte coordenadas geográficas a `d` SVG con la proyección activa. */
export function projectLineString(
  projection: GeoProjection,
  coords: [number, number][],
): string {
  const pathGen = geoPath(projection)
  const line: GeoPermissibleObjects = {
    type: "LineString",
    coordinates: coords,
  }
  return pathGen(line) ?? ""
}

/**
 * Curva Bézier cuadrática en espacio de pantalla (arco “dibujado a mano”).
 * Útil si se quiere más arco visible; el scrolly usa gran círculo por defecto.
 */
export function quadraticArcPath(
  projection: GeoProjection,
  from: [number, number],
  to: [number, number],
  bend = 0.22,
): string {
  const [x0, y0] = projection(from) as [number, number]
  const [x1, y1] = projection(to) as [number, number]
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * len * bend
  const cy = my + ny * len * bend
  return `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`
}
