"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback, useRef } from "react"
import { useVisualViewportAnchor } from "@/hooks/use-visual-viewport-anchor"

const blocks = [
  { id: "previa", label: "La Previa", short: "Previa" },
  { id: "mundial", label: "El Mundial", short: "Mundial" },
  { id: "festejo", label: "El Festejo", short: "Festejo" },
  { id: "gente", label: "La Gente", short: "Gente" },
] as const

/** Bloques narrativos de primer nivel (carta cuenta como parte de mundial). */
const BLOCK_IDS = new Set<string>(blocks.map(b => b.id))

const PIVOT_RATIO = 0.45

type AnchorSegment = {
  blockId: string
  top: number
  bottom: number
  height: number
}

type MeasuredProgress = {
  progress: number
  segments: AnchorSegment[]
  dotPositions: number[]
  blockRanges: { id: string; start: number; end: number }[]
}

function resolveBlockId(el: Element): string {
  const block = el.closest("section[id]") as HTMLElement | null
  const id = block?.id
  if (id === "carta") return "mundial"
  if (id && BLOCK_IDS.has(id)) return id
  return "mundial"
}

function measureProgress(): MeasuredProgress | null {
  const nodes = document.querySelectorAll("[data-progress-anchor]")
  if (nodes.length === 0) return null

  const scrollY = window.scrollY
  const pivot = scrollY + window.innerHeight * PIVOT_RATIO

  const segments: AnchorSegment[] = Array.from(nodes)
    .map(el => {
      const rect = el.getBoundingClientRect()
      const top = scrollY + rect.top
      const bottom = scrollY + rect.bottom
      return {
        blockId: resolveBlockId(el),
        top,
        bottom,
        height: Math.max(bottom - top, 1),
      }
    })
    .sort((a, b) => a.top - b.top)

  const totalHeight = segments.reduce((sum, s) => sum + s.height, 0)
  if (totalHeight <= 0) return null

  let consumed = 0
  let progress = 0

  for (const seg of segments) {
    if (pivot >= seg.bottom) {
      consumed += seg.height
      continue
    }
    if (pivot > seg.top) {
      consumed += pivot - seg.top
    }
    break
  }

  progress = Math.min(Math.max((consumed / totalHeight) * 100, 0), 100)

  const dotPositions = segments.map((seg, i) => {
    const before = segments.slice(0, i).reduce((sum, s) => sum + s.height, 0)
    return ((before + seg.height / 2) / totalHeight) * 100
  })

  const blockRanges = blocks.map(b => {
    const blockSegs = segments.filter(s => s.blockId === b.id)
    if (blockSegs.length === 0) return { id: b.id, start: 0, end: 0 }
    const start = segments
      .slice(0, segments.indexOf(blockSegs[0]))
      .reduce((sum, s) => sum + s.height, 0)
    const end = start + blockSegs.reduce((sum, s) => sum + s.height, 0)
    return { id: b.id, start: start / totalHeight, end: end / totalHeight }
  })

  return { progress, segments, dotPositions, blockRanges }
}

function resolveActiveSection(): number {
  const windowH = window.innerHeight
  for (let i = blocks.length - 1; i >= 0; i--) {
    const el = document.getElementById(blocks[i].id)
    if (el && el.getBoundingClientRect().top <= windowH * PIVOT_RATIO) {
      return i
    }
  }
  return -1
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function ProgressTracker() {
  const shellRef = useRef<HTMLDivElement>(null)
  const anchor = useVisualViewportAnchor(shellRef)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(-1)
  const [dotPositions, setDotPositions] = useState<number[]>([])
  const [blockRanges, setBlockRanges] = useState<MeasuredProgress["blockRanges"]>(
    blocks.map(b => ({ id: b.id, start: 0, end: 0 })),
  )

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const windowH = window.innerHeight

    setIsVisible(scrollY > windowH * 0.85)

    const measured = measureProgress()
    if (!measured) return

    setProgress(measured.progress)
    setActiveSection(resolveActiveSection())
    setDotPositions(measured.dotPositions)
    setBlockRanges(measured.blockRanges)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    const run = () => handleScroll()

    window.addEventListener("scroll", run, { passive: true })
    vv?.addEventListener("scroll", run, { passive: true })
    vv?.addEventListener("resize", run, { passive: true })
    window.addEventListener("resize", run, { passive: true })

    const ro = new ResizeObserver(run)
    ro.observe(document.documentElement)

    run()
    return () => {
      window.removeEventListener("scroll", run)
      vv?.removeEventListener("scroll", run)
      vv?.removeEventListener("resize", run)
      window.removeEventListener("resize", run)
      ro.disconnect()
    }
  }, [handleScroll])

  const ballLeft = progress
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
      {/* Capa fija sin transform (iOS Safari rompe fixed + transform en el mismo nodo). */}
      <div
        className="bg-card/90 backdrop-blur-md border-t border-border/50"
        style={{
          paddingBottom: anchor
            ? `calc(env(safe-area-inset-bottom, 0px) + ${anchor.bleed}px)`
            : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 24,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="max-w-3xl mx-auto px-5 pt-3 pb-4"
        >
          <div className="flex mb-2">
            {blocks.map((b, i) => {
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

          <div className="relative h-7 flex items-center">
            <div className="absolute inset-x-0 h-px bg-border/50" />

            {visibleBlocks.slice(1).map(b => (
              <div
                key={b.id}
                className="absolute w-px h-3 bg-border/60"
                style={{ left: `${normalizePos(b.start)}%` }}
              />
            ))}

            {dotPositions.map((dotProgress, i) => {
              const lit = progress >= dotProgress - 0.5
              const left = normalizePos(dotProgress / 100)

              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  animate={{
                    width: lit ? 6 : 4,
                    height: lit ? 6 : 4,
                    backgroundColor: lit ? "oklch(0.65 0.18 222)" : "oklch(0.24 0.09 252)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    left: `${left}%`,
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                  }}
                />
              )
            })}

            <motion.span
              className="absolute text-base select-none"
              animate={{ rotate: ballRotate }}
              transition={{ duration: 0.05, ease: "easeInOut" }}
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
        </motion.div>
      </div>
    </div>
  )
}
