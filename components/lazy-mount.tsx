"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useIntersectionMount } from "@/hooks/use-intersection-mount"
import {
  resolveBreakpoint,
  sectionSkeletonMinHeight,
  type LazySectionId,
} from "@/lib/progress-layout"
import { cn } from "@/lib/utils"
import { debugLog } from "@/lib/debug-log"

export function LazySectionSkeleton({
  className,
  sectionId,
}: {
  className?: string
  sectionId?: LazySectionId
}) {
  const [minHeight, setMinHeight] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!sectionId) return
    const sync = () => {
      setMinHeight(
        sectionSkeletonMinHeight(sectionId, resolveBreakpoint(window.innerWidth)),
      )
    }
    sync()
    window.addEventListener("resize", sync)
    return () => window.removeEventListener("resize", sync)
  }, [sectionId])

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "w-full rounded-2xl bg-muted/25 animate-pulse",
        !minHeight && "min-h-[min(32vh,22rem)]",
        className,
      )}
      style={minHeight ? { minHeight } : undefined}
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
            <LazySectionSkeleton
              sectionId={sectionId === "unknown" ? undefined : sectionId}
            />
          )}
    </div>
  )
}
