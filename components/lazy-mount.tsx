"use client"

import type { ReactNode } from "react"
import { useIntersectionMount } from "@/hooks/use-intersection-mount"
import { cn } from "@/lib/utils"

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
  rootMargin = "440px 0px",
  fallback,
}: {
  children: ReactNode
  rootMargin?: string
  fallback?: ReactNode
}) {
  const { ref, isVisible } = useIntersectionMount(rootMargin)

  return (
    <div ref={ref} className="w-full">
      {isVisible ? children : fallback ?? <LazySectionSkeleton />}
    </div>
  )
}
