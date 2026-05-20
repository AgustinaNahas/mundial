"use client"

import { useEffect, useRef } from "react"

/**
 * Ejecuta `onClose` cuando el usuario hace scroll (página o visual viewport).
 * `enabled` evita registrar listeners si no hay nada que cerrar.
 */
export function useCloseOnScroll(enabled: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!enabled) return

    const close = () => onCloseRef.current()

    window.addEventListener("scroll", close, { capture: true, passive: true })
    const vv = window.visualViewport
    vv?.addEventListener("scroll", close, { passive: true })

    return () => {
      window.removeEventListener("scroll", close, { capture: true })
      vv?.removeEventListener("scroll", close)
    }
  }, [enabled])
}
