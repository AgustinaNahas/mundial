"use client"

import type { ComponentType } from "react"
import dynamic from "next/dynamic"
import { LazyMount, LazySectionSkeleton } from "@/components/lazy-mount"

function deferred(importFn: () => Promise<{ default: ComponentType<object> }>) {
  return dynamic(importFn, { loading: () => <LazySectionSkeleton /> })
}

const PlayStationSectionDyn = deferred(() =>
  import("@/components/sections/playstation-section").then((m) => ({
    default: m.PlayStationSection,
  })),
)

const AlbumSectionDyn = deferred(() =>
  import("@/components/sections/album-section").then((m) => ({
    default: m.AlbumSection,
  })),
)

const PelotaSectionDyn = deferred(() =>
  import("@/components/sections/pelota-section").then((m) => ({
    default: m.PelotaSection,
  })),
)

const CamisetaSectionDyn = deferred(() =>
  import("@/components/sections/camiseta-section").then((m) => ({
    default: m.CamisetaSection,
  })),
)

const CanchaSectionDyn = deferred(() =>
  import("@/components/sections/cancha-section").then((m) => ({
    default: m.CanchaSection,
  })),
)

const MateSectionDyn = deferred(() =>
  import("@/components/sections/mate-section").then((m) => ({
    default: m.MateSection,
  })),
)

const AsadoSectionDyn = deferred(() =>
  import("@/components/sections/asado-section").then((m) => ({
    default: m.AsadoSection,
  })),
)

const FernetSectionDyn = deferred(() =>
  import("@/components/sections/fernet-section").then((m) => ({
    default: m.FernetSection,
  })),
)

const MicroSectionDyn = deferred(() =>
  import("@/components/sections/micro-section").then((m) => ({
    default: m.MicroSection,
  })),
)

const JubilacionSectionDyn = deferred(() =>
  import("@/components/sections/jubilacion-section").then((m) => ({
    default: m.JubilacionSection,
  })),
)

const DerechosSectionDyn = deferred(() =>
  import("@/components/sections/derechos-section").then((m) => ({
    default: m.DerechosSection,
  })),
)

const CierreSectionDyn = deferred(() =>
  import("@/components/sections/cierre-section").then((m) => ({
    default: m.CierreSection,
  })),
)

export function DeferredPlayStationSection() {
  return (
    <LazyMount>
      <PlayStationSectionDyn />
    </LazyMount>
  )
}

export function DeferredAlbumSection() {
  return (
    <LazyMount>
      <AlbumSectionDyn />
    </LazyMount>
  )
}

export function DeferredPelotaSection() {
  return (
    <LazyMount>
      <PelotaSectionDyn />
    </LazyMount>
  )
}

export function DeferredCamisetaSection() {
  return (
    <LazyMount>
      <CamisetaSectionDyn />
    </LazyMount>
  )
}

export function DeferredCanchaSection() {
  return (
    <LazyMount>
      <CanchaSectionDyn />
    </LazyMount>
  )
}

export function DeferredMateSection() {
  return (
    <LazyMount>
      <MateSectionDyn />
    </LazyMount>
  )
}

export function DeferredAsadoSection() {
  return (
    <LazyMount>
      <AsadoSectionDyn />
    </LazyMount>
  )
}

export function DeferredFernetSection() {
  return (
    <LazyMount>
      <FernetSectionDyn />
    </LazyMount>
  )
}

export function DeferredMicroSection() {
  return (
    <LazyMount>
      <MicroSectionDyn />
    </LazyMount>
  )
}

export function DeferredJubilacionSection() {
  return (
    <LazyMount>
      <JubilacionSectionDyn />
    </LazyMount>
  )
}

export function DeferredDerechosSection() {
  return (
    <LazyMount>
      <DerechosSectionDyn />
    </LazyMount>
  )
}

export function DeferredCierreSection() {
  return (
    <LazyMount>
      <CierreSectionDyn />
    </LazyMount>
  )
}
