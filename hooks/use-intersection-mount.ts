"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Pasa a `true` cuando el elemento entra al viewport (+ `rootMargin`).
 * Una vez visible, limpia el observer.
 */
export function useIntersectionMount(rootMargin = "440px 0px") {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isVisible) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          setIsVisible(true)
          observer.disconnect()
          return
        }
      },
      { root: null, rootMargin, threshold: 0 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isVisible, rootMargin])

  return { ref, isVisible }
}
