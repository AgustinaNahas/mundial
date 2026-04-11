"use client"

import { useEffect, useState } from "react"
import { MapContainer, GeoJSON, Polyline, CircleMarker, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject } from "geojson"
import type { PathOptions } from "leaflet"

// Coordenadas
const BSAS: [number, number] = [-34.6037, -58.3816]
const DOHA: [number, number] = [25.2854, 51.531]
const MIAMI: [number, number] = [25.7617, -80.1918]

// Puntos a lo largo de un arco de gran círculo
function greatCirclePoints(
  from: [number, number],
  to: [number, number],
  n = 80
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI

  const lat1 = toRad(from[0])
  const lon1 = toRad(from[1])
  const lat2 = toRad(to[0])
  const lon2 = toRad(to[1])

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
      )
    )

  if (d === 0) return [from, to]

  const points: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))
    const lon = toDeg(Math.atan2(y, x))
    points.push([lat, lon])
  }
  return points
}

const routeDoha = greatCirclePoints(BSAS, DOHA)
const routeMiami = greatCirclePoints(BSAS, MIAMI)

const countryStyle: PathOptions = {
  fillColor: "#1a2540",
  fillOpacity: 1,
  color: "#0d1a2d",
  weight: 0.5,
}

interface CityMarkerProps {
  position: [number, number]
  label: string
  color: string
}

function CityMarker({ position, label, color }: CityMarkerProps) {
  return (
    <CircleMarker
      center={position}
      radius={5}
      pathOptions={{ fillColor: color, fillOpacity: 1, color: "#0a0f1e", weight: 2 }}
    >
      <Tooltip permanent direction="top" offset={[0, -8]} className="leaflet-world-tooltip">
        <span style={{ color, fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{label}</span>
      </Tooltip>
    </CircleMarker>
  )
}

export function WorldMap() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)

  useEffect(() => {
    fetch("/mundial/countries.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {
        // fallback dev path
        fetch("/countries.geojson")
          .then((r) => r.json())
          .then(setGeoData)
      })
  }, [])

  return (
    <>
      <style>{`
        .leaflet-container { background: #080e1c !important; }
        .leaflet-world-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-world-tooltip::before { display: none !important; }
      `}</style>
      <MapContainer
        center={[15, -10]}
        zoom={1.5}
        minZoom={1}
        maxZoom={4}
        style={{ height: "420px", width: "100%", borderRadius: "1rem" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        {geoData && (
          <>
            <GeoJSON
              data={geoData}
              style={() => countryStyle}
            />
            {/* Ruta BS AS → Doha (Qatar 2022) */}
            <Polyline
              positions={routeDoha}
              pathOptions={{ color: "#4eaadc", weight: 2, opacity: 0.9, dashArray: "6 4" }}
            />

            {/* Ruta BS AS → Miami (EEUU 2026) */}
            <Polyline
              positions={routeMiami}
              pathOptions={{ color: "#e8e8f0", weight: 2, opacity: 0.9, dashArray: "6 4" }}
            />

            {/* Ciudades */}
            <CityMarker position={BSAS} label="Buenos Aires" color="#4eaadc" />
            <CityMarker position={DOHA} label="Doha" color="#4eaadc" />
            <CityMarker position={MIAMI} label="Miami" color="#e8e8f0" />
          </>


        )}

        
      </MapContainer>
    </>
  )
}
