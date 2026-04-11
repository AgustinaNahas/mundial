"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

const sections = [
  { id: "previa", label: "La Previa", short: "Previa", subsections: 3 },
  { id: "mundial", label: "El Mundial", short: "Mundial", subsections: 5 },
  { id: "festejo", label: "El Festejo", short: "Festejo", subsections: 3 },
  { id: "gente", label: "La Gente", short: "Gente", subsections: 2 },
]

const totalSubs = sections.reduce((a, s) => a + s.subsections, 0) // 13

// Pre-compute each section's start/end as fraction of the track
let acc = 0
const sectionRanges = sections.map(s => {
  const start = acc / totalSubs
  acc += s.subsections
  return { ...s, start, end: acc / totalSubs }
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function ProgressTracker() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)   // 0–100
  const [activeSection, setActiveSection] = useState(-1)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const windowH = window.innerHeight
    const docH = document.documentElement.scrollHeight

    setIsVisible(scrollY > windowH * 0.85)
    setProgress(Math.min((scrollY / (docH - windowH)) * 100, 100))

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id)
      if (el && el.getBoundingClientRect().top <= windowH * 0.45) {
        setActiveSection(i)
        return
      }
    }
    setActiveSection(-1)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const ballLeft = progress          // % of track
  const ballRotate = progress * 38 // 4 full turns across 100%

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: isVisible ? 0 : 80, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border/50"
    >
      <div className="max-w-3xl mx-auto px-5 pt-3 pb-4">

        {/* Section labels — width proporcional a sus subsecciones */}
        <div className="flex mb-2">
          {sectionRanges.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="text-left transition-all duration-300 overflow-hidden"
              style={{ width: `${(s.end - s.start) * 100}%` }}
            >
              <span className={`block truncate text-[9px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${activeSection === i ? "text-primary" : "text-muted-foreground/40"
                }`}>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Track */}
        <div className="relative h-7 flex items-center">

          {/* Línea base */}
          <div className="absolute inset-x-0 h-px bg-border/50" />

          {/* Divisores de sección */}
          {sectionRanges.slice(1).map(s => (
            <div
              key={s.id}
              className="absolute w-px h-3 bg-border/60"
              style={{ left: `${s.start * 100}%` }}
            />
          ))}

          {/* Puntos de subsección */}
          {sectionRanges.map((s, si) =>
            Array.from({ length: s.subsections }).map((_, di) => {
              const globalIndex = sectionRanges.slice(0, si).reduce((a, x) => a + x.subsections, 0) + di
              const dotFrac = (globalIndex + 0.5) / totalSubs // 0–1
              const dotProgress = dotFrac * 100
              const lit = progress >= dotProgress - 1

              return (
                <motion.div
                  key={`${si}-${di}`}
                  className="absolute rounded-full"
                  animate={{
                    width: lit ? 6 : 4,
                    height: lit ? 6 : 4,
                    backgroundColor: lit ? "oklch(0.65 0.18 222)" : "oklch(0.24 0.09 252)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    left: `${dotProgress}%`,
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                  }}
                />
              )
            })
          )}

          {/* Pelota de fútbol */}
          <motion.span
            className="absolute text-base select-none"
            animate={{ rotate: ballRotate }}
            transition={{ duration: 0.05, ease: "easeInOut" }}
            style={{
              left: `${ballLeft}%`,
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
    </motion.div>
  )
}
