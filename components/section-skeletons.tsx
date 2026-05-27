"use client"

import { useEffect, useState } from "react"
import { SectionWrapper } from "@/components/section-wrapper"
import {
  resolveBreakpoint,
  sectionContentMinHeight,
  sectionSkeletonMinHeight,
  type LazySectionId,
  type ProgressSectionId,
} from "@/lib/progress-layout"
import { cn } from "@/lib/utils"

export type SectionSkeletonVariant =
  | "comparison-chart"
  | "comparison-grid"
  | "dual-product"
  | "album-grid"
  | "scrolly-map"
  | "micro-bus"
  | "ninos-cards"
  | "jubilacion"
  | "derechos"
  | "resumen"
  | "cierre"

const SECTION_SKELETON_VARIANT: Record<LazySectionId, SectionSkeletonVariant> = {
  album: "album-grid",
  playstation: "comparison-chart",
  pelota: "dual-product",
  camiseta: "dual-product",
  cancha: "scrolly-map",
  mate: "comparison-grid",
  asado: "comparison-grid",
  fernet: "comparison-grid",
  carta: "comparison-chart",
  micro: "micro-bus",
  ninos: "ninos-cards",
  jubilacion: "jubilacion",
  derechos: "derechos",
  resumen: "resumen",
  cierre: "cierre",
}

const MUTED_LAZY_SECTIONS = new Set<LazySectionId>(["album", "mate", "jubilacion", "resumen"])
const CARD_LAZY_SECTIONS = new Set<LazySectionId>(["cierre"])

export function getSectionSkeletonVariant(sectionId: LazySectionId): SectionSkeletonVariant {
  return SECTION_SKELETON_VARIANT[sectionId]
}

function SkeletonBone({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted/45 animate-pulse", className)} aria-hidden />
}

function ChartLegendSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <SkeletonBone className="h-3 w-36" />
      <SkeletonBone className="h-3 w-28" />
      <SkeletonBone className="h-3 w-20" />
    </div>
  )
}

function ComparisonBarsSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <SkeletonBone className="h-4 w-36 max-w-[55%]" />
        <SkeletonBone className="h-3.5 w-10 shrink-0" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-4">
            <SkeletonBone className="h-3 w-10 shrink-0" />
            <SkeletonBone className="h-8 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PictogramGridSkeleton() {
  return (
    <div className="grid grid-cols-8 md:grid-cols-10 gap-0.5 md:gap-1 w-full max-w-sm mx-auto">
      {Array.from({ length: 40 }).map((_, i) => (
        <SkeletonBone key={i} className="aspect-square rounded-sm" />
      ))}
    </div>
  )
}

function SectionHeaderSkeleton() {
  return (
    <div className="mb-12 shrink-0 space-y-4">
      <SkeletonBone className="h-4 w-8" />
      <SkeletonBone className="h-9 md:h-11 w-[min(100%,28rem)]" />
      <div className="space-y-2 max-w-2xl">
        <SkeletonBone className="h-4 w-full" />
        <SkeletonBone className="h-4 w-[92%]" />
        <SkeletonBone className="h-4 w-[75%] hidden sm:block" />
      </div>
    </div>
  )
}

function SkeletonVariantBody({
  variant,
  fill,
}: {
  variant: SectionSkeletonVariant
  fill?: boolean
}) {
  const fillClass = fill ? "flex-1 min-h-0 flex flex-col" : ""

  switch (variant) {
    case "comparison-chart":
      return (
        <div className={cn("space-y-8", fillClass)}>
          <ChartLegendSkeleton />
          <ComparisonBarsSkeleton />
          <SkeletonBone className={cn("w-full rounded-xl", fill ? "flex-1 min-h-[10rem]" : "h-[11rem] md:h-[13.5rem]")} />
        </div>
      )

    case "comparison-grid":
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-12 items-start", fillClass)}>
          <div className="space-y-8">
            <ComparisonBarsSkeleton />
            <SkeletonBone className="h-28 w-full rounded-lg" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <SkeletonBone className="h-4 w-48" />
            <PictogramGridSkeleton />
          </div>
        </div>
      )

    case "dual-product":
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12", fillClass)}>
          {[0, 1].map((col) => (
            <div key={col} className="space-y-5">
              <SkeletonBone className="mx-auto size-28 md:size-36 rounded-full" />
              <ComparisonBarsSkeleton rows={2} />
              <div className="flex justify-center gap-6">
                <SkeletonBone className="h-8 w-20" />
                <SkeletonBone className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      )

    case "album-grid":
      return (
        <div className={cn("space-y-6", fillClass)}>
          <SkeletonBone className="mx-auto h-4 w-[min(100%,22rem)]" />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_1fr] lg:grid-cols-[1fr_450px_1fr] gap-6 items-start">
            <div className="hidden md:block space-y-3">
              <SkeletonBone className="h-5 w-24" />
              <SkeletonBone className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBone className="h-10 w-full rounded-t-xl" />
              <div className="grid grid-cols-4 gap-1.5 p-3 rounded-b-xl border border-border/30 bg-card/40">
                {Array.from({ length: 16 }).map((_, i) => (
                  <SkeletonBone key={i} className="aspect-[10/13] rounded-sm" />
                ))}
              </div>
            </div>
            <div className="hidden md:block space-y-3">
              <SkeletonBone className="h-5 w-24 ml-auto" />
              <SkeletonBone className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      )

    case "scrolly-map":
      return (
        <div className={cn("space-y-6", fillClass)}>
          <SkeletonBone className="hidden lg:block h-24 w-full rounded-xl" />
          <SkeletonBone className="lg:hidden h-14 w-full rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <SkeletonBone className={cn("w-full rounded-2xl", fill ? "min-h-[42vh] lg:min-h-[50vh] flex-1" : "h-[42vh] lg:h-[50vh]")} />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBone key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )

    case "micro-bus":
      return (
        <div className={cn("flex flex-col items-center justify-center gap-5 py-6", fillClass)}>
          <SkeletonBone className="h-4 w-44" />
          <SkeletonBone className={cn("w-full max-w-[820px] rounded-xl", fill ? "min-h-[16rem] flex-1" : "h-[16rem] md:h-[20rem]")} />
        </div>
      )

    case "ninos-cards":
      return (
        <div className={cn("space-y-4", fillClass)}>
          <SkeletonBone className="mx-auto h-4 w-[min(100%,24rem)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBone key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )

    case "jubilacion":
      return (
        <div className={cn("space-y-8", fillClass)}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <SkeletonBone className="h-12 w-40" />
            <SkeletonBone className="h-6 w-8 hidden sm:block" />
            <SkeletonBone className="h-12 w-40" />
          </div>
          <ComparisonBarsSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonBone className="h-40 rounded-xl" />
            <PictogramGridSkeleton />
          </div>
        </div>
      )

    case "derechos":
      return (
        <div className={cn("flex flex-col items-center gap-8", fillClass)}>
          <div className="flex w-full max-w-2xl items-center justify-between gap-3">
            <SkeletonBone className="h-9 w-28 rounded-full" />
            <SkeletonBone className="h-9 w-24 rounded-full" />
          </div>
          <SkeletonBone className={cn("w-full max-w-lg aspect-square rounded-full", fill && "max-h-[min(24rem,50vh)]")} />
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBone key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      )

    case "resumen":
      return (
        <div className={cn("space-y-14 text-center", fillClass)}>
          <div className="space-y-4 mx-auto max-w-2xl">
            <SkeletonBone className="mx-auto h-3 w-36" />
            <SkeletonBone className="mx-auto h-5 w-full" />
            <SkeletonBone className="mx-auto h-5 w-[90%]" />
            <SkeletonBone className="mx-auto h-5 w-[78%]" />
          </div>
          <SkeletonBone className="mx-auto h-4 w-[min(100%,20rem)]" />
          <div className="space-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <ComparisonBarsSkeleton key={i} />
            ))}
          </div>
          <SkeletonBone className="mx-auto h-16 w-[min(100%,28rem)] rounded-lg" />
        </div>
      )

    case "cierre":
      return (
        <div className={cn("flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8", fillClass)}>
          <SkeletonBone className="size-24 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3 w-full max-w-md">
            <SkeletonBone className="mx-auto sm:mx-0 h-5 w-40" />
            <SkeletonBone className="h-4 w-full" />
            <SkeletonBone className="h-4 w-[92%]" />
            <div className="flex flex-wrap gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBone key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        </div>
      )
  }
}

function useContentMinHeight(sectionId?: LazySectionId) {
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!sectionId) return
    const sync = () => {
      setMinHeight(sectionContentMinHeight(sectionId, resolveBreakpoint(window.innerWidth)))
    }
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [sectionId])

  return minHeight
}

function useSectionMinHeight(sectionId: LazySectionId) {
  const [minHeight, setMinHeight] = useState<string | undefined>(undefined)

  useEffect(() => {
    const sync = () => {
      setMinHeight(sectionSkeletonMinHeight(sectionId, resolveBreakpoint(window.innerWidth)))
    }
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [sectionId])

  return minHeight
}

/** Skeleton del área de contenido (debajo del header de SectionWrapper). */
export function SectionDataSkeleton({
  variant,
  sectionId,
  className,
  reserveHeight = true,
  fill,
}: {
  variant: SectionSkeletonVariant
  sectionId?: LazySectionId
  className?: string
  /** Reserva alto según progress-layout (carga de datos). En lazy full skeleton usar false. */
  reserveHeight?: boolean
  fill?: boolean
}) {
  const contentMinH = useContentMinHeight(reserveHeight ? sectionId : undefined)

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn("w-full", className)}
      style={contentMinH != null ? { minHeight: `${contentMinH}px` } : undefined}
    >
      <SkeletonVariantBody
        variant={variant}
        fill={fill ?? (reserveHeight ? contentMinH != null : false)}
      />
    </div>
  )
}

/** Skeleton de mapa (dynamic import de Cancha). */
export function MapChartSkeleton({ className }: { className?: string }) {
  return (
    <SkeletonBone
      className={cn("h-full w-full rounded-2xl bg-[#080e1c]/70", className)}
      aria-hidden
    />
  )
}

type SectionLoadingShellProps = {
  sectionId: ProgressSectionId
  number: string
  title: string
  intro: string
  bgColor?: "background" | "muted"
  titleImage?: React.ComponentProps<typeof SectionWrapper>["titleImage"]
}

/** SectionWrapper + intro real + skeleton de contenido con alto estable. */
export function SectionLoadingShell({
  sectionId,
  number,
  title,
  intro,
  bgColor,
  titleImage,
}: SectionLoadingShellProps) {
  return (
    <SectionWrapper
      progressSection={sectionId}
      number={number}
      title={title}
      intro={intro}
      bgColor={bgColor}
      titleImage={titleImage}
    >
      <SectionDataSkeleton
        variant={getSectionSkeletonVariant(sectionId)}
        sectionId={sectionId}
      />
    </SectionWrapper>
  )
}

type SectionLazySkeletonProps = {
  sectionId: LazySectionId
  className?: string
  id?: string
  progressSection?: ProgressSectionId
  maxWidth?: "5xl" | "3xl" | "6xl"
}

/** Skeleton completo de sección lazy (misma altura que progress-layout). */
export function SectionLazySkeleton({
  sectionId,
  className,
  id,
  progressSection,
  maxWidth = sectionId === "resumen" || sectionId === "cierre" ? "3xl" : sectionId === "cancha" ? "6xl" : "5xl",
}: SectionLazySkeletonProps) {
  const minHeight = useSectionMinHeight(sectionId)
  const variant = getSectionSkeletonVariant(sectionId)
  const isMuted = MUTED_LAZY_SECTIONS.has(sectionId)
  const isCard = CARD_LAZY_SECTIONS.has(sectionId)

  const maxWClass =
    maxWidth === "3xl" ? "max-w-3xl" : maxWidth === "6xl" ? "max-w-6xl" : "max-w-5xl"

  return (
    <div
      id={id}
      role="presentation"
      aria-hidden
      data-progress-anchor={progressSection ? "" : undefined}
      data-progress-section={progressSection}
      className={cn(
        "w-full py-20 md:py-28 flex flex-col",
        isMuted && "bg-muted",
        isCard && "bg-card border-t border-border/50",
        !isMuted && !isCard && "bg-background",
        !minHeight && "min-h-[min(32vh,22rem)]",
        className,
      )}
      style={minHeight ? { minHeight } : undefined}
    >
      <div className={cn("container mx-auto px-6 md:px-12 flex flex-col min-h-[inherit]", maxWClass)}>
        {sectionId === "resumen" || sectionId === "cierre" ? (
          <SkeletonVariantBody variant={variant} fill={Boolean(minHeight)} />
        ) : (
          <>
            <SectionHeaderSkeleton />
            <SectionDataSkeleton
              variant={variant}
              className="flex-1 min-h-0"
              reserveHeight={false}
              fill
            />
          </>
        )}
      </div>
    </div>
  )
}
