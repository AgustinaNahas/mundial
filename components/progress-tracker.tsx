"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback, useRef } from "react"
import { ProjectInfoButton } from "@/components/project-info-button"
import { useVisualViewportAnchor } from "@/hooks/use-visual-viewport-anchor"
import { useProgressLayoutContext } from "@/components/progress-layout-provider"
import { contentTransition } from "@/lib/motion"
import {
  computeProgressFromLayout,
  dotBarPosition,
  getProgressDotSegments,
  isProgressDotLit,
  PIVOT_RATIO,
  PROGRESS_BLOCKS,
  resolveActiveSectionFromLayout,
} from "@/lib/progress-layout"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function ProgressTracker() {
  const shellRef = useRef<HTMLDivElement>(null)
  const anchor = useVisualViewportAnchor(shellRef)
  const { layout } = useProgressLayoutContext()
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(-1)
  const [scrollY, setScrollY] = useState(0)
  const [windowH, setWindowH] = useState(0)

  const blockRanges = layout?.blockRanges ?? PROGRESS_BLOCKS.map(b => ({ id: b.id, start: 0, end: 0 }))

  const handleScroll = useCallback(() => {
    if (!layout) return

    const scrollY = window.scrollY
    const windowH = window.innerHeight
    const isMobile = window.innerWidth < 768
    let heroVisible = false

    if (isMobile) {
      const previa = document.getElementById("previa")
      heroVisible = previa
        ? previa.getBoundingClientRect().top <= windowH * PIVOT_RATIO
        : scrollY >= windowH
    } else {
      heroVisible = scrollY > windowH * 0.85
    }

    const cierre = document.getElementById("cierre")
    const reachedAbout = cierre
      ? cierre.getBoundingClientRect().top <= windowH * PIVOT_RATIO
      : false

    setIsVisible(heroVisible && !reachedAbout)

    setScrollY(scrollY)
    setWindowH(windowH)
    setProgress(computeProgressFromLayout(layout, scrollY, windowH))
    const active = resolveActiveSectionFromLayout(layout, scrollY, windowH)
    setActiveSection(active)
  }, [layout])

  useEffect(() => {
    const vv = window.visualViewport
    const run = () => handleScroll()

    window.addEventListener("scroll", run, { passive: true })
    vv?.addEventListener("scroll", run, { passive: true })
    vv?.addEventListener("resize", run, { passive: true })
    window.addEventListener("resize", run, { passive: true })

    run()
    return () => {
      window.removeEventListener("scroll", run)
      vv?.removeEventListener("scroll", run)
      vv?.removeEventListener("resize", run)
      window.removeEventListener("resize", run)
    }
  }, [handleScroll])

  const ballRotate = progress * 38

  const visibleBlocks = blockRanges.filter(r => r.end > r.start)
  const trackStart = visibleBlocks[0]?.start ?? 0
  const trackEnd = visibleBlocks[visibleBlocks.length - 1]?.end ?? 1
  const trackSpan = Math.max(trackEnd - trackStart, 0.001)

  const normalizePos = (frac: number) => ((frac - trackStart) / trackSpan) * 100

  return (
    <div
      ref={shellRef}
      className="fixed left-0 right-0 z-50"
      style={{
        top: anchor?.top,
        bottom: anchor == null ? 0 : undefined,
      }}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 24,
        }}
        transition={contentTransition(0)}
        className="bg-card/90 backdrop-blur-md border-t border-border/50"
        style={{
          pointerEvents: isVisible ? "auto" : "none",
          paddingBottom: anchor
            ? `calc(env(safe-area-inset-bottom, 0px) + ${anchor.bleed}px)`
            : "env(safe-area-inset-bottom, 0px)",
        }}
        aria-hidden={!isVisible}
      >
        <div className="max-w-3xl mx-auto px-5 pt-3 pb-4">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex mb-2">
                {PROGRESS_BLOCKS.map((b, i) => {
                  const range = blockRanges[i]
                  const width = (range.end - range.start) * 100
                  if (width <= 0) return null

                  return (
                    <button
                      key={b.id}
                      onClick={() => scrollTo(b.id)}
                      className="text-left transition-all duration-300 overflow-hidden"
                      style={{ width: `${width}%` }}
                    >
                      <span
                        className={`block truncate text-[9px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                          activeSection === i ? "text-primary" : "text-muted-foreground/40"
                        }`}
                      >
                        <span className="hidden sm:inline">{b.label}</span>
                        <span className="sm:hidden">{b.short}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="relative h-7 flex items-center px-0.5">
                <div className="absolute inset-x-0 h-px bg-border/50" />

                {visibleBlocks.slice(1).map(b => (
                  <div
                    key={b.id}
                    className="absolute w-px h-3 bg-border/60"
                    style={{ left: `${normalizePos(b.start)}%` }}
                  />
                ))}

                {layout
                  ? getProgressDotSegments(layout).map((seg, i) => {
                      const lit = isProgressDotLit(layout, scrollY, windowH, i)
                      const left = normalizePos(dotBarPosition(layout, i))

                      return (
                        <motion.div
                          key={seg.sectionId}
                          className="absolute rounded-full"
                          animate={{
                            width: lit ? 6 : 4,
                            height: lit ? 6 : 4,
                            backgroundColor: lit
                              ? "oklch(0.65 0.18 222)"
                              : "oklch(0.24 0.09 252)",
                          }}
                          transition={contentTransition(0)}
                          style={{
                            left: `${left}%`,
                            transform: "translate(-50%, -50%)",
                            top: "50%",
                          }}
                        />
                      )
                    })
                  : null}

                <motion.span
                  className="absolute text-base select-none"
                  animate={{ rotate: ballRotate }}
                  transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.8 }}
                  style={{
                    left: `${normalizePos(progress / 100)}%`,
                    top: "20%",
                    transform: "translate(-50%, -50%)",
                    lineHeight: 1,
                    display: "block",
                  }}
                >
                  ⚽
                </motion.span>
              </div>
            </div>

            <ProjectInfoButton className="ml-1.5 sm:ml-4" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
