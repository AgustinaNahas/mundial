"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { FollowCursorTooltip, type TooltipPlacement } from "@/components/follow-cursor-tooltip"
import { InfoIconButton, type InfoIconButtonProps } from "@/components/ui/info-icon-button"
import { useCloseOnScroll } from "@/hooks/use-close-on-scroll"
import { cn } from "@/lib/utils"

export const INFO_TOOLTIP_CLASS =
  "z-[100] max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-card-foreground shadow-lg"

type InfoTooltipProps = {
  children: ReactNode
  label?: string
  size?: InfoIconButtonProps["size"]
  /** `above-left`: ancla en la (i) y se extiende hacia la izquierda. */
  placement?: Extract<TooltipPlacement, "above" | "above-left">
  /** ~80% del ancho de pantalla (útil para textos largos). */
  wide?: boolean
  className?: string
  buttonClassName?: string
  contentClassName?: string
}

/** Tooltip de la (i): tap/click abre arriba del botón y queda hasta repetir, Escape o scroll. */
export function InfoTooltip({
  children,
  label,
  size = "sm",
  placement = "above",
  wide = false,
  className,
  buttonClassName,
  contentClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLSpanElement>(null)

  const updatePosition = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({
      x: placement === "above-left" ? r.right : r.left + r.width / 2,
      y: r.top,
    })
  }, [placement])

  const close = useCallback(() => setOpen(false), [])

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      if (open) {
        close()
        return
      }
      updatePosition()
      setOpen(true)
    },
    [open, close, updatePosition],
  )

  useCloseOnScroll(open, close)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return
      close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("resize", updatePosition)
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close, updatePosition])

  return (
    <span ref={wrapRef} className={cn("inline-flex shrink-0 touch-manipulation", className)}>
      <InfoIconButton
        type="button"
        size={size}
        label={label}
        className={buttonClassName}
        aria-expanded={open}
        onClick={toggle}
      />
      <FollowCursorTooltip
        open={open}
        x={pos.x}
        y={pos.y}
        placement={placement}
        className={cn(
          INFO_TOOLTIP_CLASS,
          wide && "w-[80vw] max-w-[80vw]",
          contentClassName,
        )}
      >
        {children}
      </FollowCursorTooltip>
    </span>
  )
}
