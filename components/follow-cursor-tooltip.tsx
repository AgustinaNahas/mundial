"use client"

import type { PointerEvent as ReactPointerEvent } from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const CURSOR_TOOLTIP_OFFSET = 14
export const TOOLTIP_ABOVE_GAP = 12
/** Mitad estimada del ancho máximo del tooltip para no salirse del viewport. */
export const TOOLTIP_HALF_WIDTH_EST = 100

export type TooltipPlacement = "follow" | "above" | "above-left"

export type FollowTooltipState = {
  open: boolean
  x: number
  y: number
  placement: TooltipPlacement
}

export const CLOSED_FOLLOW_TIP: FollowTooltipState = {
  open: false,
  x: 0,
  y: 0,
  placement: "follow",
}

export function pointerViewportCoords(e: ReactPointerEvent) {
  const vv = window.visualViewport
  if (!vv) return { x: e.clientX, y: e.clientY }
  return { x: e.clientX + vv.offsetLeft, y: e.clientY + vv.offsetTop }
}

export function clampTooltipX(x: number) {
  const vv = window.visualViewport
  const left = vv?.offsetLeft ?? 0
  const width = vv?.width ?? window.innerWidth
  const margin = 8
  return Math.min(
    Math.max(x, left + TOOLTIP_HALF_WIDTH_EST + margin),
    left + width - TOOLTIP_HALF_WIDTH_EST - margin,
  )
}

export function FollowCursorTooltip({
  open,
  x,
  y,
  placement = "follow",
  className,
  children,
}: {
  open: boolean
  x: number
  y: number
  placement?: TooltipPlacement
  className?: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !open) return null

  const style =
    placement === "above"
      ? {
          position: "fixed" as const,
          left: x,
          top: y,
          transform: `translate(-50%, calc(-100% - ${TOOLTIP_ABOVE_GAP}px))`,
        }
      : placement === "above-left"
        ? {
            position: "fixed" as const,
            left: x,
            top: y,
            transform: `translate(-100%, calc(-100% - ${TOOLTIP_ABOVE_GAP}px))`,
          }
        : {
            position: "fixed" as const,
            left: x + CURSOR_TOOLTIP_OFFSET,
            top: y + CURSOR_TOOLTIP_OFFSET,
          }

  return createPortal(
    <div
      role="tooltip"
      style={style}
      className={
        className ??
        "pointer-events-none z-[100] max-w-[min(100vw-2rem,20rem)] rounded-md border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-lg"
      }
    >
      {children}
    </div>,
    document.body,
  )
}

/** Hover sigue el cursor; en touch abre arriba del dedo y queda fijo hasta tap fuera o repetir tap. */
export function bindFollowTooltip(
  set: React.Dispatch<React.SetStateAction<FollowTooltipState>>,
  closeOther: () => void,
): {
  onPointerEnter: (e: ReactPointerEvent) => void
  onPointerMove: (e: ReactPointerEvent) => void
  onPointerLeave: (e: ReactPointerEvent) => void
  onPointerDown: (e: ReactPointerEvent) => void
} {
  return {
    onPointerEnter: (e) => {
      if (e.pointerType !== "touch") {
        const { x, y } = pointerViewportCoords(e)
        set({ open: true, x, y, placement: "follow" })
      }
    },
    onPointerMove: (e) => {
      if (e.pointerType !== "touch") {
        const { x, y } = pointerViewportCoords(e)
        set({ open: true, x, y, placement: "follow" })
      }
    },
    onPointerLeave: (e) => {
      if (e.pointerType !== "touch") set(CLOSED_FOLLOW_TIP)
    },
    onPointerDown: (e) => {
      if (e.pointerType === "touch") {
        e.stopPropagation()
        const { x, y } = pointerViewportCoords(e)
        closeOther()
        set((prev) =>
          prev.open
            ? CLOSED_FOLLOW_TIP
            : { open: true, x: clampTooltipX(x), y, placement: "above" },
        )
      }
    },
  }
}
