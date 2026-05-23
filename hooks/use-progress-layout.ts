"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  areGenteSectionsInDom,
  buildEstimatedLayout,
  calibrateLayoutFromDom,
  type ProgressBreakpoint,
  type ProgressLayout,
  resolveBreakpoint,
} from "@/lib/progress-layout"

type LayoutPhase = "estimated" | "calibrated"

export function useProgressLayout() {
  const [layout, setLayout] = useState<ProgressLayout | null>(null)
  const [phase, setPhase] = useState<LayoutPhase>("estimated")
  const [festejoUnlocked, setFestejoUnlocked] = useState(false)
  const phaseRef = useRef<LayoutPhase>("estimated")
  const festejoRef = useRef(false)
  const calibrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rebuildEstimated = useCallback((bp: ProgressBreakpoint, unlocked: boolean) => {
    const next = buildEstimatedLayout(bp, unlocked, window.innerHeight)
    setLayout(next)
    return next
  }, [])

  const runCalibrate = useCallback((estimated: ProgressLayout, allowRecalibrate: boolean) => {
    if (phaseRef.current === "calibrated" && !allowRecalibrate) return false

    const savedY = window.scrollY
    if (savedY > 0) window.scrollTo(0, 0)
    const calibrated = calibrateLayoutFromDom(estimated, festejoRef.current)
    if (savedY > 0) window.scrollTo(0, savedY)

    if (!calibrated) return false

    phaseRef.current = "calibrated"
    setPhase("calibrated")
    setLayout(calibrated)
    return true
  }, [])

  const scheduleCalibrate = useCallback(
    (estimated: ProgressLayout, allowRecalibrate = false) => {
      if (calibrateTimer.current) clearTimeout(calibrateTimer.current)
      calibrateTimer.current = setTimeout(() => {
        runCalibrate(estimated, allowRecalibrate)
      }, 400)
    },
    [runCalibrate],
  )

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    festejoRef.current = festejoUnlocked
  }, [festejoUnlocked])

  useEffect(() => {
    const syncFestejo = () => {
      setFestejoUnlocked(Boolean(document.getElementById("festejo")))
    }
    syncFestejo()
    const observer = new MutationObserver(syncFestejo)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const apply = () => {
      const bp = resolveBreakpoint(window.innerWidth)
      const estimated = rebuildEstimated(bp, festejoUnlocked)
      scheduleCalibrate(estimated, !festejoUnlocked)
    }

    phaseRef.current = "estimated"
    setPhase("estimated")
    apply()

    const onResize = () => {
      phaseRef.current = "estimated"
      setPhase("estimated")
      apply()
    }

    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      if (calibrateTimer.current) clearTimeout(calibrateTimer.current)
    }
  }, [festejoUnlocked, rebuildEstimated, scheduleCalibrate])

  /** Tras desbloquear festejo, re-calibrar cuando ninos/jubilacion/derechos monten (lazy). */
  useEffect(() => {
    if (!festejoUnlocked) return

    const tryGenteCalibrate = () => {
      if (!areGenteSectionsInDom()) return
      const bp = resolveBreakpoint(window.innerWidth)
      const estimated = buildEstimatedLayout(bp, true, window.innerHeight)
      runCalibrate(estimated, true)
    }

    tryGenteCalibrate()
    const observer = new MutationObserver(tryGenteCalibrate)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [festejoUnlocked, runCalibrate])

  return { layout, phase, festejoUnlocked }
}
