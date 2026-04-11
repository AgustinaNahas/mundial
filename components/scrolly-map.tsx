"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { MapContainer, GeoJSON, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject } from "geojson"
import type { PathOptions } from "leaflet"

/* ─── Great circle ─── */
function greatCirclePoints(from: [number, number], to: [number, number], n = 80): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const lat1 = toRad(from[0]), lon1 = toRad(from[1])
  const lat2 = toRad(to[0]),   lon2 = toRad(to[1])
  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
  ))
  if (d === 0) return [from, to]
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)
    pts.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))])
  }
  return pts
}

const BSAS:  [number, number] = [-34.6037, -58.3816]
const DOHA:  [number, number] = [25.2854,   51.531 ]
const MIAMI: [number, number] = [25.7617,  -80.1918]

const routeDoha  = greatCirclePoints(BSAS, DOHA)
const routeMiami = greatCirclePoints(BSAS, MIAMI)

const countryStyle: PathOptions = {
  fillColor: "#1a2540",
  fillOpacity: 1,
  color: "#0d1a2d",
  weight: 0.5,
}

/* ─── Vistas para cada uno de los 5 pasos ─── */
const VIEWS: Array<{ center: [number, number]; zoom: number }> = [
  { center: [-22,   -52  ], zoom: 3.2 },  // 0 · Buenos Aires
  { center: [ -2,    -3  ], zoom: 2   },  // 1 · Ruta BS AS → Doha
  { center: [ 25.3,  51.5], zoom: 5.5 },  // 2 · Zoom in Qatar
  { center: [  4,   -68  ], zoom: 2.8 },  // 3 · Ruta BS AS → Miami
  { center: [ 25.8, -80.2], zoom: 6   },  // 4 · Zoom in Miami
]

function MapController({ step }: { step: number }) {
  const map = useMap()
  const mounted = useRef(false)

  useEffect(() => {
    // skip first render — MapContainer ya tiene center/zoom iniciales
    if (!mounted.current) { mounted.current = true; return }
    const v = VIEWS[step] ?? VIEWS[0]
    map.stop()   // cancela cualquier animación en curso antes de iniciar la siguiente
    map.flyTo(v.center, v.zoom, { duration: 1.4, easeLinearity: 0.25 })
  }, [step, map])
  return null
}

/* ─── Punto de ciudad ─── */
function CityDot({
  position, label, color, active,
}: {
  position: [number, number]; label: string; color: string; active: boolean
}) {
  return (
    <CircleMarker
      center={position}
      radius={active ? 7 : 4}
      pathOptions={{ fillColor: color, fillOpacity: active ? 1 : 0.45, color: "#080e1c", weight: 2 }}
    >
      <Tooltip permanent direction="top" offset={[0, -10]} className="leaflet-scrolly-tt">
        <span style={{ color, fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>{label}</span>
      </Tooltip>
    </CircleMarker>
  )
}

/* ─── Componente principal ─── */
export interface ScrollyMapProps { step: number }

export function ScrollyMapInner({ step }: ScrollyMapProps) {
  const [geoData,   setGeoData]   = useState<GeoJsonObject | null>(null)
  // Canvas renderer: mucho más rápido que SVG para polígonos complejos (países)
  // Se crea una sola vez para no invalidar el layer en cada render
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), [])
  // incrementan cuando la ruta "entra en escena" → forzan remount del Polyline → reinician la animación CSS
  const [dohaKey,   setDohaKey]   = useState(0)
  const [miamiKey,  setMiamiKey]  = useState(0)

  useEffect(() => {
    fetch("/mundial/countries.geojson")
      .then(r => r.json()).then(setGeoData)
      .catch(() => fetch("/countries.geojson").then(r => r.json()).then(setGeoData))
  }, [])

  useEffect(() => {
    if (step === 1) setDohaKey( k => k + 1)   // ruta Doha se dibuja al entrar al paso 1
    if (step === 3) setMiamiKey(k => k + 1)   // ruta Miami se dibuja al entrar al paso 3
  }, [step])

  // Visibilidad / opacidad de las rutas
  const showDoha  = step >= 1
  const showMiami = step >= 3
  const dohaOpacity  = (step === 1 || step === 2) ? 0.85 : 0.2
  const miamiOpacity = 0.85   // siempre visible desde que aparece

  return (
    <>
      <style>{`
        .leaflet-container { background: #080e1c !important; }
        .leaflet-scrolly-tt {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-scrolly-tt::before { display: none !important; }

        @keyframes routeDraw {
          0%  { stroke-dasharray: 4000 4000; stroke-dashoffset: 4000; }
          80% { stroke-dasharray: 4000 4000; stroke-dashoffset: 0; }
          100%{ stroke-dasharray: 8 5;       stroke-dashoffset: 0; }
        }
        .route-draw { animation: routeDraw 2s ease-out forwards; }
      `}</style>

      <MapContainer
        center={VIEWS[0].center}
        zoom={VIEWS[0].zoom}
        minZoom={1}
        maxZoom={8}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <MapController step={step} />

        {geoData && <GeoJSON data={geoData} style={() => countryStyle} {...{ renderer: canvasRenderer }} />}

        {/* ── Ruta BS AS → Doha ── */}
        {showDoha && (
          <Polyline
            key={`doha-${dohaKey}`}
            className="route-draw"
            positions={routeDoha}
            pathOptions={{ color: "#4eaadc", weight: 2.5, opacity: dohaOpacity }}
          />
        )}

        {/* ── Ruta BS AS → Miami ── */}
        {showMiami && (
          <Polyline
            key={`miami-${miamiKey}`}
            className="route-draw"
            positions={routeMiami}
            pathOptions={{ color: "#c8e8ff", weight: 2.5, opacity: miamiOpacity }}
          />
        )}

        {/* ── Buenos Aires: siempre ── */}
        <CityDot position={BSAS}  label="Buenos Aires" color="#4eaadc" active={step === 0} />

        {/* ── Doha: desde step 1, activo en 1 y 2 ── */}
        {showDoha && (
          <CityDot position={DOHA}  label="Doha, Qatar"  color="#4eaadc" active={step === 1 || step === 2} />
        )}

        {/* ── Miami: desde step 3, activo en 3 y 4 ── */}
        {showMiami && (
          <CityDot position={MIAMI} label="Miami, EEUU"  color="#c8e8ff" active={step === 3 || step === 4} />
        )}
      </MapContainer>
    </>
  )
}
