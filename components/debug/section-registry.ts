import type { ComponentType } from "react"

export type DebugSectionSlug = keyof typeof debugSectionRegistry

export interface DebugSectionConfig {
  label: string
  load: () => Promise<ComponentType>
}

export const debugSectionRegistry = {
  album: {
    label: "Album",
    load: () => import("@/components/sections/album-section").then((m) => m.AlbumSection),
  },
  camiseta: {
    label: "Camiseta",
    load: () => import("@/components/sections/camiseta-section").then((m) => m.CamisetaSection),
  },
  pelota: {
    label: "Pelota",
    load: () => import("@/components/sections/pelota-section").then((m) => m.PelotaSection),
  },
  playstation: {
    label: "PlayStation",
    load: () => import("@/components/sections/playstation-section").then((m) => m.PlayStationSection),
  },
  cancha: {
    label: "Cancha",
    load: () => import("@/components/sections/cancha-section").then((m) => m.CanchaSection),
  },
  mate: {
    label: "Mate",
    load: () => import("@/components/sections/mate-section").then((m) => m.MateSection),
  },
  asado: {
    label: "Asado",
    load: () => import("@/components/sections/asado-section").then((m) => m.AsadoSection),
  },
  fernet: {
    label: "Fernet",
    load: () => import("@/components/sections/fernet-section").then((m) => m.FernetSection),
  },
  micro: {
    label: "Micro",
    load: () => import("@/components/sections/micro-section").then((m) => m.MicroSection),
  },
  jubilacion: {
    label: "Jubilacion",
    load: () => import("@/components/sections/jubilacion-section").then((m) => m.JubilacionSection),
  },
  derechos: {
    label: "Derechos",
    load: () => import("@/components/sections/derechos-section").then((m) => m.DerechosSection),
  },
  cierre: {
    label: "Cierre",
    load: () => import("@/components/sections/cierre-section").then((m) => m.CierreSection),
  },
  viaje: {
    label: "Viaje",
    load: () => import("@/components/sections/viaje-section").then((m) => m.ViajeSection),
  },
  trabajo: {
    label: "Trabajo",
    load: () => import("@/components/sections/trabajo-section").then((m) => m.TrabajoSection),
  },
  alquiler: {
    label: "Alquiler",
    load: () => import("@/components/sections/alquiler-section").then((m) => m.AlquilerSection),
  },
  timeline: {
    label: "Timeline",
    load: () => import("@/components/sections/timeline-section").then((m) => m.TimelineSection),
  },
} satisfies Record<string, DebugSectionConfig>

export const debugSectionSlugs = Object.keys(debugSectionRegistry) as DebugSectionSlug[]

export function isDebugSectionSlug(section: string): section is DebugSectionSlug {
  return section in debugSectionRegistry
}
