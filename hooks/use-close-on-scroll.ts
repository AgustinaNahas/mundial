"use client"

import { useEffect, useRef } from "react"

const SCROLL_CLOSE_THRESHOLD_PX = 6

/**
 * Ejecuta `onClose` cuando el usuario hace scroll real (página o visual viewport).
 * Ignora micro-movimientos que a veces disparan scroll al abrir overlays.
 */
export function useCloseOnScroll(enabled: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const scrollYAtEnable = useRef(0)
  const vvOffsetAtEnable = useRef(0)

  useEffect(() => {
    if (!enabled) return

    scrollYAtEnable.current = window.scrollY
    vvOffsetAtEnable.current = window.visualViewport?.offsetTop ?? 0

    const maybeClose = () => {
      const scrolledPage =
        Math.abs(window.scrollY - scrollYAtEnable.current) >= SCROLL_CLOSE_THRESHOLD_PX
      const vv = window.visualViewport
      const scrolledViewport =
        vv != null &&
        Math.abs(vv.offsetTop - vvOffsetAtEnable.current) >= SCROLL_CLOSE_THRESHOLD_PX
      if (scrolledPage || scrolledViewport) onCloseRef.current()
    }

    window.addEventListener("scroll", maybeClose, { capture: true, passive: true })
    const vv = window.visualViewport
    vv?.addEventListener("scroll", maybeClose, { passive: true })

    return () => {
      window.removeEventListener("scroll", maybeClose, { capture: true })
      vv?.removeEventListener("scroll", maybeClose)
    }
  }, [enabled])
}
