"use client"

import { useEffect, useRef } from "react"
import { debugLog } from "@/lib/debug-log"

/** Marca inicio de hidratación en cliente (complementa logs SSR de page.tsx). */
export function DebugRenderTracer() {
  const logged = useRef(false)

  useEffect(() => {
    if (logged.current) return
    logged.current = true
    // #region agent log
    debugLog(
      "debug-render-tracer.tsx",
      "client hydration mount",
      { href: typeof window !== "undefined" ? window.location.href : "" },
      "H5",
    )
    // #endregion
  }, [])

  return null
}
