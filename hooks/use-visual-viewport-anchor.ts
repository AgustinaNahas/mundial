"use client"

import { useEffect, useState, type RefObject } from "react"

export type VisualViewportAnchor = {
  top: number
  /** Píxeles extra bajo la barra para tapar el hueco de Safari cuando la UI se oculta. */
  bleed: number
}

/**
 * Ancla un elemento fixed al borde inferior del visual viewport (Safari iOS).
 * Usa `top` en lugar de `bottom` porque es más fiable cuando la barra del navegador aparece/desaparece.
 */
export function useVisualViewportAnchor(ref: RefObject<HTMLElement | null>) {
  const [anchor, setAnchor] = useState<VisualViewportAnchor | null>(null)

  useEffect(() => {
    const el = ref.current
    const vv = window.visualViewport
    if (!el || !vv) return

    const update = () => {
      const height = el.getBoundingClientRect().height
      const top = vv.offsetTop + vv.height - height
      const bleed = Math.max(0, window.innerHeight - (top + height))
      setAnchor({ top, bleed })
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)

    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)

    return () => {
      ro.disconnect()
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [ref])

  return anchor
}
