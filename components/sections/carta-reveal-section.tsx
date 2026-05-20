"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion"
import { cn } from "@/lib/utils"

const BASE_PATH = "/mundial"
const CARTA_DORSO_SRC = `${BASE_PATH}/carta.png`
const CUATRO_COPAS_SRC = `${BASE_PATH}/4copas.png`

/** Proporción real de carta.png y 4copas.jpg (~247×375) */
const CARD_WIDTH = 247
const CARD_HEIGHT = 375

interface CartaRevealSectionProps {
  unlocked: boolean
  onUnlock: () => void
}

function CardPhoto({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes="(max-width: 768px) 72vw, 16rem"
      className={cn(
        "block h-full w-full object-contain select-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]",
        className,
      )}
      draggable={false}
    />
  )
}

function CardFace({
  side,
  children,
}: {
  side: "front" | "back"
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: side === "front" ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </motion.div>
  )
}

export function CartaRevealSection({ unlocked, onUnlock }: CartaRevealSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  const handleDraw = useCallback(() => {
    if (flipped || isFlipping || unlocked) return
    setIsFlipping(true)
    setFlipped(true)
  }, [flipped, isFlipping, unlocked])

  useEffect(() => {
    if (!flipped || unlocked) return
    const delay = prefersReducedMotion ? 400 : 2200
    const timer = window.setTimeout(() => {
      onUnlock()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [flipped, unlocked, onUnlock, prefersReducedMotion])

  useEffect(() => {
    if (flipped && !prefersReducedMotion) {
      const t = window.setTimeout(() => setIsFlipping(false), 950)
      return () => window.clearTimeout(t)
    }
    setIsFlipping(false)
  }, [flipped, prefersReducedMotion])

  const canDraw = !flipped && !unlocked

  return (
    <section
      id="carta"
      data-progress-anchor=""
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-background",
        unlocked ? "min-h-[min(72vh,40rem)] py-16 md:py-20" : "min-h-[100dvh]",
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: flipped ? 0.15 : 0.5 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, oklch(0.65 0.18 222 / 0.12), transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 flex w-full max-w-lg flex-col items-center px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-10 text-center text-sm uppercase tracking-[0.28em] text-muted-foreground"
            >
              Algo viene después del mundial…
            </motion.p>
          ) : (
            <motion.p
              key="revealed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: 0.6 }}
              className="mb-8 text-center font-display text-xl md:text-2xl font-light tracking-tight text-foreground"
            >
              Cuatro de copas
            </motion.p>
          )}
        </AnimatePresence>

        {/* Mazo + carta activa */}
        <motion.div
          className={cn(
            "relative w-[min(68vw,14.5rem)] sm:w-[min(52vw,16rem)] md:w-[min(36vw,17.5rem)]",
            canDraw && "cursor-pointer",
          )}
          style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
          role={canDraw ? "button" : undefined}
          tabIndex={canDraw ? 0 : undefined}
          aria-label={canDraw ? "Sacar una carta del mazo" : "Cuatro de copas"}
          onClick={canDraw ? handleDraw : undefined}
          onKeyDown={
            canDraw
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleDraw()
                  }
                }
              : undefined
          }
        >
          {!flipped && (
            <>
              <motion.div
                className="pointer-events-none absolute inset-0 z-0 origin-center"
                style={{ transform: "rotate(-10deg) translate(-6%, 4%)" }}
                aria-hidden
              >
                <CardPhoto
                  src={CARTA_DORSO_SRC}
                  alt=""
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  className="opacity-75"
                />
              </motion.div>
              <motion.div
                className="pointer-events-none absolute inset-0 z-[1] origin-center"
                style={{ transform: "rotate(7deg) translate(5%, 2%)" }}
                aria-hidden
              >
                <CardPhoto
                  src={CARTA_DORSO_SRC}
                  alt=""
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  className="opacity-90"
                />
              </motion.div>
            </>
          )}

          <div
            className="relative z-10 h-full w-full"
            style={{ perspective: 1400 }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                rotateY: flipped ? 180 : 0,
                scale: canDraw ? [1, 1.015, 1] : 1,
              }}
              transition={{
                rotateY: {
                  duration: prefersReducedMotion ? 0.2 : 0.95,
                  ease: [0.35, 0, 0.15, 1],
                },
                scale: canDraw
                  ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 },
              }}
            >
              <CardFace side="back">
                <CardPhoto
                  src={CARTA_DORSO_SRC}
                  alt="Dorso de la carta"
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  priority
                />
              </CardFace>
              <CardFace side="front">
                <CardPhoto
                  src={CUATRO_COPAS_SRC}
                  alt="4 de copas"
                  width={671}
                  height={1025}
                />
              </CardFace>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {canDraw ? (
            <motion.p
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 max-w-xs text-center text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              <span className="text-primary/90">Hacé click</span> para sacar una carta…
            </motion.p>
          ) : flipped && !unlocked ? (
            <motion.p
              key="suspense"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 text-center text-sm text-muted-foreground/80 tracking-wide"
            >
              {prefersReducedMotion ? "Continuá bajando…" : "Un momento…"}
            </motion.p>
          ) : unlocked ? (
            <motion.p
              key="unlocked"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center text-sm uppercase tracking-[0.22em] text-muted-foreground"
            >
              Seguí bajando
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

/** Vista aislada para /carta en modo debug */
export function CartaRevealDebugSection() {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <CartaRevealSection
      unlocked={unlocked}
      onUnlock={() => setUnlocked(true)}
    />
  )
}
