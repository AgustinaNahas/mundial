"use client"

import type { ComponentType } from "react"
import dynamic from "next/dynamic"
import { LazyMount, LazySectionSkeleton } from "@/components/lazy-mount"
import { debugLog } from "@/lib/debug-log"
import { withConcurrentImport } from "@/lib/concurrent-import"

function deferred(
  sectionId: string,
  importFn: () => Promise<{ default: ComponentType<object> }>,
) {
  return dynamic(
    () => {
      const t0 = Date.now()
      // #region agent log
      debugLog(
        "deferred-sections.tsx",
        "dynamic import start",
        { sectionId, t0 },
        "H1",
      )
      // #endregion
      return withConcurrentImport(sectionId, importFn)
        .then((m) => {
          // #region agent log
          debugLog(
            "deferred-sections.tsx",
            "dynamic import done",
            { sectionId, ms: Date.now() - t0 },
            "H1",
            "post-fix-v3",
          )
          // #endregion
          return m
        })
        .catch((err) => {
          // #region agent log
          debugLog(
            "deferred-sections.tsx",
            "dynamic import failed",
            { sectionId, err: String(err), ms: Date.now() - t0 },
            "H1",
            "post-fix-v3",
          )
          // #endregion
          throw err
        })
    },
    {
      ssr: false,
      loading: () => <LazySectionSkeleton />,
    },
  )
}

const PlayStationSectionDyn = deferred("playstation", () =>
  import("@/components/sections/playstation-section").then((m) => ({
    default: m.PlayStationSection,
  })),
)

const AlbumSectionDyn = deferred("album", () =>
  import("@/components/sections/album-section").then((m) => ({
    default: m.AlbumSection,
  })),
)

const PelotaSectionDyn = deferred("pelota", () =>
  import("@/components/sections/pelota-section").then((m) => ({
    default: m.PelotaSection,
  })),
)

const CamisetaSectionDyn = deferred("camiseta", () =>
  import("@/components/sections/camiseta-section").then((m) => ({
    default: m.CamisetaSection,
  })),
)

const CanchaSectionDyn = deferred("cancha", () =>
  import("@/components/sections/cancha-section").then((m) => ({
    default: m.CanchaSection,
  })),
)

const MateSectionDyn = deferred("mate", () =>
  import("@/components/sections/mate-section").then((m) => ({
    default: m.MateSection,
  })),
)

const AsadoSectionDyn = deferred("asado", () =>
  import("@/components/sections/asado-section").then((m) => ({
    default: m.AsadoSection,
  })),
)

const FernetSectionDyn = deferred("fernet", () =>
  import("@/components/sections/fernet-section").then((m) => ({
    default: m.FernetSection,
  })),
)

const MicroSectionDyn = deferred("micro", () =>
  import("@/components/sections/micro-section").then((m) => ({
    default: m.MicroSection,
  })),
)

const JubilacionSectionDyn = deferred("jubilacion", () =>
  import("@/components/sections/jubilacion-section").then((m) => ({
    default: m.JubilacionSection,
  })),
)

const NinosSectionDyn = deferred("ninos", () =>
  import("@/components/sections/ninos-section").then((m) => ({
    default: m.NinosSection,
  })),
)

const DerechosSectionDyn = deferred("derechos", () =>
  import("@/components/sections/derechos-section").then((m) => ({
    default: m.DerechosSection,
  })),
)

const CierreSectionDyn = deferred("cierre", () =>
  import("@/components/sections/cierre-section").then((m) => ({
    default: m.CierreSection,
  })),
)

export function DeferredPlayStationSection() {
  return (
    <LazyMount sectionId="playstation">
      <PlayStationSectionDyn />
    </LazyMount>
  )
}

export function DeferredAlbumSection() {
  return (
    <LazyMount sectionId="album">
      <AlbumSectionDyn />
    </LazyMount>
  )
}

export function DeferredPelotaSection() {
  return (
    <LazyMount sectionId="pelota">
      <PelotaSectionDyn />
    </LazyMount>
  )
}

export function DeferredCamisetaSection() {
  return (
    <LazyMount sectionId="camiseta">
      <CamisetaSectionDyn />
    </LazyMount>
  )
}

export function DeferredCanchaSection() {
  return (
    <LazyMount sectionId="cancha" rootMargin="0px 0px 120px 0px">
      <CanchaSectionDyn />
    </LazyMount>
  )
}

export function DeferredMateSection() {
  return (
    <LazyMount sectionId="mate">
      <MateSectionDyn />
    </LazyMount>
  )
}

export function DeferredAsadoSection() {
  return (
    <LazyMount sectionId="asado">
      <AsadoSectionDyn />
    </LazyMount>
  )
}

export function DeferredFernetSection() {
  return (
    <LazyMount sectionId="fernet">
      <FernetSectionDyn />
    </LazyMount>
  )
}

export function DeferredMicroSection() {
  return (
    <LazyMount sectionId="micro">
      <MicroSectionDyn />
    </LazyMount>
  )
}

export function DeferredJubilacionSection() {
  return (
    <LazyMount sectionId="jubilacion">
      <JubilacionSectionDyn />
    </LazyMount>
  )
}

export function DeferredNinosSection() {
  return (
    <LazyMount sectionId="ninos">
      <NinosSectionDyn />
    </LazyMount>
  )
}

export function DeferredDerechosSection() {
  return (
    <LazyMount sectionId="derechos">
      <DerechosSectionDyn />
    </LazyMount>
  )
}

export function DeferredCierreSection() {
  return (
    <LazyMount sectionId="cierre">
      <CierreSectionDyn />
    </LazyMount>
  )
}
