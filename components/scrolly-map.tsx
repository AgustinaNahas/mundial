"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { MapContainer, GeoJSON, Polyline, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject } from "geojson"
import type { PathOptions } from "leaflet"
import { loadCountriesGeo } from "@/lib/countries-geo"
import { debugLog } from "@/lib/debug-log"
import { RoutePlaneMarker } from "@/components/route-plane-marker"

/* ─── Great circle ─── */
function greatCirclePoints(from: [number, number], to: [number, number], n = 80): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const lat1 = toRad(from[0]), lon1 = toRad(from[1])
  const lat2 = toRad(to[0]), lon2 = toRad(to[1])
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

const BSAS: [number, number] = [-34.6037, -58.3816]
const DOHA: [number, number] = [25.2854, 51.531]
const MIAMI: [number, number] = [25.7617, -80.1918]

const routeDoha = greatCirclePoints(BSAS, DOHA)
const routeMiami = greatCirclePoints(BSAS, MIAMI)

const countryStyle: PathOptions = {
  fillColor: "#1a2540",
  fillOpacity: 1,
  color: "#0d1a2d",
  weight: 0.5,
}

/** Menos vértices al reproyectar en cada zoom → flyTo más liviano (visual casi igual a estos niveles). */
const countryStyleForMap = (): PathOptions =>
  ({ ...countryStyle, smoothFactor: 1.35 } as PathOptions)

/* ─── Vistas para cada uno de los 5 pasos ─── */
const VIEWS: Array<{ center: [number, number]; zoom: number }> = [
  { center: [-34.6037, -58.3816], zoom: 5.5 }, // 0 · Buenos Aires (zoom metropolitano)
  { center: [-5, -5], zoom: 1.5 },    // 1 · Ruta BS AS → Doha (zoom reducido: muestra ambos extremos en mobile portrait)
  { center: [25.3, 51.5], zoom: 5.5 }, // 2 · Zoom in Qatar
  { center: [-4, -68], zoom: 2.3 },   // 3 · Ruta BS AS → Miami (zoom reducido: muestra ambos extremos en mobile)
  { center: [25.8, -80.2], zoom: 6 }, // 4 · Zoom in Miami
]

function useNarrowMap() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return narrow
}

function viewForStep(step: number, narrow: boolean) {
  if (step === 0) {
    return { center: [-34.6037, -58.3816] as [number, number], zoom: narrow ? 5 : 2 }
  }
  return VIEWS[step] ?? VIEWS[0]
}

function MapController({ step }: { step: number }) {
  const map = useMap()
  const mounted = useRef(false)
  const narrow = useNarrowMap()

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const v = viewForStep(step, narrow)
    map.stop()
    map.flyTo(v.center, v.zoom, { duration: 1.4, easeLinearity: 0.25 })
  }, [step, narrow, map])
  return null
}

type PolylineLeafletInternal = L.Polyline & { _update: () => void }

/** Tras zoomend Leaflet hace _project() pero _parts puede quedar desfasado hasta moveend; alinea el trazo al vuelo. */
function PolylineZoomSync({
  dohaRef,
  miamiRef,
}: {
  dohaRef: React.RefObject<L.Polyline | null>
  miamiRef: React.RefObject<L.Polyline | null>
}) {
  useMapEvents({
    zoomend() {
      queueMicrotask(() => {
        for (const ref of [dohaRef, miamiRef]) {
          const pl = ref.current as PolylineLeafletInternal | null
          pl?._update()
        }
      })
    },
  })
  return null
}

/* ─── Punto de ciudad ─── */
function CityDot({
  position,
  label,
  color,
  active,
}: {
  position: [number, number]
  label: string
  color: string
  active: boolean
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
export interface ScrollyMapProps {
  step: number
}

function routeOpacity(step: number, route: "doha" | "miami"): number {
  if (step <= 0) return 0.22
  if (route === "doha") return step <= 2 ? 0.88 : 0.22
  return step >= 3 ? 0.88 : 0.22
}

export function ScrollyMapInner({ step }: ScrollyMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)
  const dohaPolyRef = useRef<L.Polyline | null>(null)
  const miamiPolyRef = useRef<L.Polyline | null>(null)
  const svgRenderer = useMemo(() => L.svg({ padding: 6 }), [])

  useEffect(() => {
    const t0 = Date.now()
    void loadCountriesGeo({ detail: "lite" })
      .then((data) => {
        setGeoData(data)
        // #region agent log
        debugLog(
          "scrolly-map.tsx",
          "geo loaded in map",
          { ms: Date.now() - t0 },
          "H7",
        )
        // #endregion
      })
      .catch((err) => {
        // #region agent log
        debugLog(
          "scrolly-map.tsx",
          "geo load failed in map",
          { err: String(err), ms: Date.now() - t0 },
          "H7",
        )
        // #endregion
      })
  }, [])

  const dohaOpacity = routeOpacity(step, "doha")
  const miamiOpacity = routeOpacity(step, "miami")

  if (!geoData) {
    return <div className="h-full w-full rounded-2xl bg-[#080e1c] animate-pulse" aria-hidden />
  }

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
        .leaflet-overlay-pane svg { overflow: visible !important; }
        .route-plane-icon { background: transparent !important; border: none !important; }
      `}</style>

      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={5.5}
        minZoom={1}
        maxZoom={5.5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <MapController step={step} />
        <PolylineZoomSync dohaRef={dohaPolyRef} miamiRef={miamiPolyRef} />

        <GeoJSON data={geoData} style={countryStyleForMap} {...{ renderer: svgRenderer }} />

        <Polyline
          ref={dohaPolyRef}
          positions={routeDoha}
          pathOptions={
            {
              color: "#e8e8f0",
              weight: 2.5,
              opacity: dohaOpacity,
              dashArray: "8 6",
              noClip: true,
              smoothFactor: 0,
              renderer: svgRenderer,
            } as PathOptions
          }
        />
        <Polyline
          ref={miamiPolyRef}
          positions={routeMiami}
          pathOptions={
            {
              color: "#4eaadc",
              weight: 2.5,
              opacity: miamiOpacity,
              dashArray: "8 6",
              noClip: true,
              smoothFactor: 0,
              renderer: svgRenderer,
            } as PathOptions
          }
        />
        <RoutePlaneMarker
          positions={routeDoha}
          color="#e8e8f0"
          opacity={dohaOpacity}
          startOffset={0}
          durationMs={12_000}
        />
        <RoutePlaneMarker
          positions={routeMiami}
          color="#4eaadc"
          opacity={miamiOpacity}
          startOffset={0.45}
          durationMs={9_000}
        />

        <CityDot position={BSAS} label="Buenos Aires" color="#4eaadc" active={step === 0} />
        <CityDot position={DOHA} label="Doha, Qatar" color="#e8e8f0" active={step === 1 || step === 2} />
        <CityDot position={MIAMI} label="Miami, EEUU" color="#4eaadc" active={step === 3 || step === 4} />
      </MapContainer>
    </>
  )
}
