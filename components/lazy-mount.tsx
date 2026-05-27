"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { SectionLazySkeleton } from "@/components/section-skeletons"
import { useIntersectionMount } from "@/hooks/use-intersection-mount"
import type { LazySectionId } from "@/lib/progress-layout"
import { cn } from "@/lib/utils"
import { debugLog } from "@/lib/debug-log"

/** Reexportado para compatibilidad con imports existentes. */
export function LazySectionSkeleton({
  className,
  sectionId,
  id,
  progressSection,
}: {
  className?: string
  sectionId?: LazySectionId
  id?: string
  progressSection?: import("@/lib/progress-layout").ProgressSectionId
}) {
  if (!sectionId) {
    return (
      <div
        role="presentation"
        aria-hidden
        className={cn(
          "w-full min-h-[min(32vh,22rem)] rounded-2xl bg-muted/25 animate-pulse",
          className,
        )}
      />
    )
  }
  return (
    <SectionLazySkeleton
      sectionId={sectionId}
      className={className}
      id={id}
      progressSection={progressSection}
    />
  )
}

export function LazyMount({
  children,
  sectionId = "unknown",
  rootMargin = "0px 0px 80px 0px",
  fallback,
}: {
  children: ReactNode
  sectionId?: LazySectionId | "unknown"
  rootMargin?: string
  fallback?: ReactNode
}) {
  const { ref, isVisible } = useIntersectionMount(rootMargin)

  useEffect(() => {
    if (!isVisible) return
    // #region agent log
    debugLog(
      "lazy-mount.tsx",
      "section became visible",
      { sectionId, rootMargin },
      "H4",
      "post-fix-v2",
    )
    // #endregion
  }, [isVisible, sectionId, rootMargin])

  return (
    <div ref={ref} className="w-full">
      {isVisible
        ? children
        : fallback ?? (
            sectionId !== "unknown" ? (
              <SectionLazySkeleton
                sectionId={sectionId}
                progressSection={
                  sectionId === "resumen" || sectionId === "cierre" ? undefined : sectionId
                }
              />
            ) : (
              <LazySectionSkeleton />
            )
          )}
    </div>
  )
}
