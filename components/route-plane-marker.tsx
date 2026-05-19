"use client"

import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

function computeBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lon2 - lon1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

function interpolateAlongRoute(
  positions: [number, number][],
  t: number,
): { position: L.LatLngExpression; bearing: number } {
  if (positions.length < 2) {
    const p = positions[0] ?? [0, 0]
    return { position: p, bearing: 0 }
  }
  const total = positions.length - 1
  const scaled = t * total
  const i = Math.min(Math.floor(scaled), total - 1)
  const frac = scaled - i
  const from = positions[i]
  const to = positions[i + 1]
  const lat = from[0] + (to[0] - from[0]) * frac
  const lon = from[1] + (to[1] - from[1]) * frac
  return {
    position: [lat, lon],
    bearing: computeBearing(from[0], from[1], to[0], to[1]),
  }
}

function planeIconHtml(color: string): string {
  return `<div class="route-plane-inner" style="color:${color};display:flex;align-items:center;justify-content:center;width:22px;height:22px;transform-origin:center center;will-change:transform">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2 10.5 9 4 11v2l6.5 1.5V18l-2 2v2.5L12 21l3.5-.5V20l-2-2v-5.5L20 13v-2l-6.5-2L12 2z"/>
    </svg>
  </div>`
}

export interface RoutePlaneMarkerProps {
  positions: [number, number][]
  color: string
  /** Duración de un ciclo completo BS AS → destino (ms). */
  durationMs?: number
  /** Desfase inicial 0–1 para no superponer dos aviones en el origen. */
  startOffset?: number
  opacity?: number
}

/** Avión animado que recorre un arco de gran círculo (mismo color que la ruta). */
export function RoutePlaneMarker({
  positions,
  color,
  durationMs = 10_000,
  startOffset = 0,
  opacity = 1,
}: RoutePlaneMarkerProps) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const rafRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const icon = L.divIcon({
      className: "route-plane-icon",
      html: planeIconHtml(color),
      iconSize: [40, 40],
      iconAnchor: [11, 11],
    })

    const { position, bearing } = interpolateAlongRoute(
      positions,
      reducedMotion ? 0.55 : startOffset,
    )
    const marker = L.marker(position, {
      icon,
      interactive: false,
      keyboard: false,
      zIndexOffset: 1200,
    })
    marker.addTo(map)
    markerRef.current = marker

    const applyFrame = (t: number) => {
      const { position: pos, bearing: brg } = interpolateAlongRoute(positions, t)
      marker.setLatLng(pos)
      const el = marker.getElement()
      const inner = el?.querySelector(".route-plane-inner") as HTMLElement | null
      if (inner) {
        inner.style.transform = `rotate(${brg}deg) scale(1.5)`
        inner.style.opacity = String(opacity)
      }
    }

    if (reducedMotion) {
      applyFrame(0.55)
      return () => {
        marker.remove()
        markerRef.current = null
      }
    }

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now
      const elapsed = now - startTimeRef.current
      const t = ((elapsed / durationMs + startOffset) % 1 + 1) % 1
      applyFrame(t)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      marker.remove()
      markerRef.current = null
      startTimeRef.current = 0
    }
  }, [map, positions, color, durationMs, startOffset, opacity])

  return null
}
