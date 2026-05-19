"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import {
  BEBES_POR_MIL_MAX,
  formatPerMil,
  NOMBRES_NINOS,
  NOMBRES_NINOS_FUENTE,
  perMilNacimientos,
  type NombreNinoRow,
} from "@/lib/nombres-ninos"
import { cn } from "@/lib/utils"

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

function NombreGuessCard({ row }: { row: NombreNinoRow }) {
  const [hovered, setHovered] = useState(0)
  const [guess, setGuess] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const perMil2023 = perMilNacimientos(row.count2023, 2023)
  const rounded2023 = Math.min(BEBES_POR_MIL_MAX, Math.round(perMil2023))
  const previewCount = guess ?? hovered
  const feedback = guess !== null ? guessFeedback(guess, perMil2023) : null

  const handlePick = (index: number) => {
    setGuess(index)
    setRevealed(true)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className="rounded-xl border border-border bg-card/80 p-4 md:p-5"
    >
      <p className="text-sm font-medium text-foreground tracking-wide">{row.nombre}</p>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        Dato 2022:{" "}
        <span className="font-medium text-foreground tabular-nums">
          {row.count2022.toLocaleString("es-AR")} niños
        </span>
        <span className="text-muted-foreground/80">
          {" "}
          ({formatPerMil(perMilNacimientos(row.count2022, 2022))} cada 1.000)
        </span>
      </p>

      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
        ¿Cuántos de cada 1.000 nacidos en 2023 se llamaron así?
      </p>

      <motion.div
        className="mt-2 flex flex-nowrap items-center justify-between gap-0 w-full max-w-full"
        role="slider"
        aria-label={`Estimación para ${row.nombre}`}
        aria-valuemin={0}
        aria-valuemax={BEBES_POR_MIL_MAX}
        aria-valuenow={revealed ? rounded2023 : previewCount}
        onMouseLeave={() => {
          if (!revealed) setHovered(0)
        }}
      >
        {Array.from({ length: BEBES_POR_MIL_MAX }).map((_, i) => {
          const slot = i + 1
          const isCorrect = slot <= rounded2023
          const userPicked = guess !== null && slot <= guess
          const hoverPicked = !revealed && slot <= previewCount

          const showCorrectCircle = revealed && isCorrect
          const babyFull = revealed
            ? isCorrect && userPicked
            : hoverPicked

          return (
            <button
              key={slot}
              type="button"
              disabled={revealed}
              onMouseEnter={() => {
                if (!revealed) setHovered(slot)
              }}
              onFocus={() => {
                if (!revealed) setHovered(slot)
              }}
              onClick={() => handlePick(slot)}
              className={cn(
                "relative shrink-0 flex size-7 sm:size-8 items-center justify-center",
                "text-lg sm:text-xl leading-none transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                revealed ? "cursor-default" : "cursor-pointer hover:scale-110",
                !revealed && hoverPicked && "scale-105",
              )}
              aria-label={`${slot} de cada 1.000`}
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
                  babyFull ? "opacity-100 grayscale-0" : "opacity-35 grayscale",
                )}
              >
                👶
              </span>
            </button>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {!revealed && previewCount > 0 && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-muted-foreground leading-relaxed"
          >
            Tu estimación:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {previewCount} cada 1.000
            </span>
            <span className="text-muted-foreground/60"> · clic para confirmar</span>
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
              <span className="font-medium text-foreground tabular-nums">
                {guess} cada 1.000
              </span>
            </p>
            <p className="text-muted-foreground">
              En 2023:{" "}
              <span className="font-medium text-accent tabular-nums">
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
  return (
    <SectionWrapper
      number="14"
      title="Los niños"
      intro="Después del Mundial, algunos nombres de la Scaloneta explotaron en los registros civiles. ¿Podés adivinar cuántos bebés de cada 1.000 nacidos en 2023 se llamaron así?"
      bgColor="muted"
    >
      <p className="mb-6 text-sm text-muted-foreground max-w-2xl leading-relaxed">
        Pasá el cursor por los bebés: se van “pintando” de izquierda a derecha. Cada uno
        representa <span className="font-medium text-foreground">1 niño cada 1.000</span> nacidos.
        Hacé clic para confirmar tu respuesta.
      </p>

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

      <p className="mt-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
        Fuente:{" "}
        <a
          href={NOMBRES_NINOS_FUENTE}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Padrón de nombres — Argentina (2012–2024)
        </a>
        . La tasa “cada 1.000” se calcula sobre el total de nacimientos del año.
      </p>
    </SectionWrapper>
  )
}
