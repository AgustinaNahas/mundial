"use client"

import { useCallback, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import {
  BEBES_POR_MIL_MAX,
  formatPerMil,
  NOMBRES_NINOS,
  perMilNacimientos,
  type NombreNinoRow,
} from "@/lib/nombres-ninos"
import { useData } from "@/lib/data-context"
import { SECTIONS } from "@/lib/site-copy"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const copy = SECTIONS.ninos

function guessFeedback(guess: number, perMil2023: number): { message: string; tone: "hit" | "close" | "miss" } {
  const rounded = Math.round(perMil2023)
  if (guess === rounded) {
    return { message: "¡Adivinaste!", tone: "hit" }
  }
  if (Math.abs(guess - rounded) <= 1) {
    return { message: "Estuviste cerca.", tone: "close" }
  }
  return {
    message:
      guess < rounded
        ? "Quedaste corto — el mundial empujó el nombre."
        : "Te pasaste — igual vale la pena el intento.",
    tone: "miss",
  }
}

function slotFromPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  twoRows: boolean,
): number {
  if (twoRows) {
    const col = Math.min(5, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 6)))
    const row = Math.min(1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * 2)))
    return Math.min(BEBES_POR_MIL_MAX, row * 6 + col + 1)
  }
  const slot = Math.floor(((clientX - rect.left) / rect.width) * BEBES_POR_MIL_MAX) + 1
  return Math.min(BEBES_POR_MIL_MAX, Math.max(1, slot))
}

function NombreGuessCard({ row }: { row: NombreNinoRow }) {
  const isMobile = useIsMobile()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(0)
  const [guess, setGuess] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [dragging, setDragging] = useState(false)

  const perMil2022 = perMilNacimientos(row.count2022, 2022)
  const perMil2023 = perMilNacimientos(row.count2023, 2023)
  const rounded2023 = Math.min(BEBES_POR_MIL_MAX, Math.round(perMil2023))
  const previewCount = guess ?? hovered
  const feedback = guess !== null ? guessFeedback(guess, perMil2023) : null

  const handlePick = (index: number) => {
    setGuess(index)
    setRevealed(true)
    setDragging(false)
  }

  const updatePreviewFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = sliderRef.current
      if (!el) return
      const slot = slotFromPointer(clientX, clientY, el.getBoundingClientRect(), isMobile)
      setHovered(slot)
    },
    [isMobile],
  )

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || revealed) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    updatePreviewFromPointer(e.clientX, e.clientY)
  }

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || revealed || !dragging) return
    updatePreviewFromPointer(e.clientX, e.clientY)
  }

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || revealed) return
    const el = sliderRef.current
    const slot = el
      ? slotFromPointer(e.clientX, e.clientY, el.getBoundingClientRect(), isMobile)
      : hovered
    setDragging(false)
    if (slot > 0) handlePick(slot)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className="rounded-xl border border-border bg-card/80 p-4 md:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <p className="text-xl font-light text-foreground tracking-tight">{row.nombre}</p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 self-end rounded-lg border border-primary/30",
            "bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-foreground sm:ml-auto",
          )}
        >
          <span className="text-sm leading-none" aria-hidden>
            👶
          </span>
          <span className="tabular-nums">
            Dato 2022: {row.count2022.toLocaleString("es-AR")} (
            {formatPerMil(perMil2022)} de cada 1.000)
          </span>
        </span>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-wide text-muted-foreground">
        ¿Cuántos de cada 1.000 nacidos en 2023 se llamaron así?
      </p>

      <motion.div
        ref={sliderRef}
        className={cn(
          "mt-2 w-full max-w-full select-none",
          "grid grid-cols-6 gap-y-0.5 md:flex md:flex-nowrap md:items-center md:justify-between md:gap-0",
          isMobile && !revealed && "touch-none cursor-grab active:cursor-grabbing",
        )}
        role="slider"
        aria-label={`Estimación para ${row.nombre}`}
        aria-valuemin={0}
        aria-valuemax={BEBES_POR_MIL_MAX}
        aria-valuenow={revealed ? rounded2023 : previewCount}
        onPointerDown={handleSliderPointerDown}
        onPointerMove={handleSliderPointerMove}
        onPointerUp={handleSliderPointerUp}
        onPointerCancel={handleSliderPointerUp}
        onMouseLeave={() => {
          if (!revealed && !isMobile && !dragging) setHovered(0)
        }}
      >
        {Array.from({ length: BEBES_POR_MIL_MAX }).map((_, i) => {
          const slot = i + 1
          const isCorrect = slot <= rounded2023
          const userPicked = guess !== null && slot <= guess
          const hoverPicked = !revealed && slot <= previewCount

          const showCorrectCircle = revealed && isCorrect
          const userHighlighted = revealed ? userPicked : hoverPicked

          return (
            <button
              key={slot}
              type="button"
              disabled={revealed}
              onMouseEnter={() => {
                if (!revealed && !isMobile) setHovered(slot)
              }}
              onFocus={() => {
                if (!revealed && !isMobile) setHovered(slot)
              }}
              onClick={() => {
                if (!isMobile) handlePick(slot)
              }}
              className={cn(
                "relative shrink-0 flex size-8 sm:size-8 items-center justify-center justify-self-center",
                "text-lg sm:text-xl leading-none transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                revealed ? "cursor-default" : isMobile ? "pointer-events-none" : "cursor-pointer hover:scale-110",
                !revealed && hoverPicked && "scale-105",
              )}
              aria-label={`${slot} de cada 1.000`}
              tabIndex={isMobile ? -1 : 0}
            >
              {showCorrectCircle && ( 
                <span
                  className="absolute inset-0 rounded-full border border-primary/50 bg-primary/20"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative select-none transition-opacity duration-150",
                  userHighlighted ? "opacity-100 grayscale-0" : "opacity-35 grayscale",
                )}
              >
                👶
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Desktop: altura fija para que la tarjeta no salte al hacer hover */}
      {!revealed && (
        <div className="mt-2 hidden md:block min-h-5">
          <p
            className={cn(
              "text-[12px] text-muted-foreground leading-relaxed",
              previewCount === 0 && "invisible",
            )}
            aria-hidden={previewCount === 0}
          >
            Tu estimación:{" "}
            <span className="font-light text-foreground tabular-nums">
              {previewCount || 0} cada 1.000
            </span>
            <span className="text-muted-foreground/60"> · clic para confirmar</span>
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!revealed && previewCount > 0 && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-[12px] text-muted-foreground leading-relaxed md:hidden"
          >
            Tu estimación:{" "}
            <span className="font-light text-foreground tabular-nums">
              {previewCount} cada 1.000
            </span>
            <span className="text-muted-foreground/60"> · soltá para confirmar</span>
          </motion.p>
        )}
        {revealed && guess !== null && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-sm leading-relaxed"
          >
            <p className="text-muted-foreground">
              Tu respuesta:{" "}
              <span className="font-light text-foreground tabular-nums">
                {guess} cada 1.000
              </span>
            </p>
            <p className="text-muted-foreground">
              En 2023:{" "}
              <span className="font-light text-accent tabular-nums">
                {formatPerMil(perMil2023)} cada 1.000
              </span>
              <span>
                {" "}
                ({row.count2023.toLocaleString("es-AR")} niños)
              </span>
            </p>
            {feedback && (
              <p
                className={cn(
                  "font-medium",
                  feedback.tone === "hit" && "text-primary",
                  feedback.tone === "close" && "text-muted-foreground",
                  feedback.tone === "miss" && "text-accent",
                )}
              >
                {feedback.message}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export function NinosSection() {
  const { getIndicador } = useData()
  const nombres = getIndicador("NOMBRES")

  return (
    <SectionWrapper
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      bgColor="muted"
      sources={[nombres]}
      sourcesHideValues
    >
      {copy.body && (
        <p className="mb-6 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          <span className="md:hidden">
            Tocá y arrastrá sobre los bebés: se van “pintando” de izquierda a derecha. Cada uno
            representa{" "}
            <span className="font-light text-foreground">1 niño cada 1.000</span> nacidos. Soltá
            el dedo para confirmar tu respuesta.
          </span>
          <span className="hidden md:inline">
            Pasá el cursor por los bebés: se van “pintando” de izquierda a derecha. Cada uno
            representa{" "}
            <span className="font-light text-foreground">1 niño cada 1.000</span> nacidos. Hacé
            clic para confirmar tu respuesta.
          </span>
        </p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {NOMBRES_NINOS.map((row) => (
          <NombreGuessCard key={row.nombre} row={row} />
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
