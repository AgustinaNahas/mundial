"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useIntersectionMount } from "@/hooks/use-intersection-mount"
import { cn } from "@/lib/utils"
import { debugLog } from "@/lib/debug-log"

export function LazySectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "min-h-[min(32vh,22rem)] w-full rounded-2xl bg-muted/25 animate-pulse",
        className,
      )}
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
  sectionId?: string
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
      {isVisible ? children : fallback ?? <LazySectionSkeleton />}
    </div>
  )
}
