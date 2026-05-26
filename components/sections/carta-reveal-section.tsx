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

/** Proporción real de carta.png (~247×375) */
const CARD_WIDTH = 247
const CARD_HEIGHT = 375

const CARD_OPTIONS = [
  { id: "1bastos", label: "Ancho de bastos", src: `${BASE_PATH}/1bastos.png` },
  { id: "7espadas", label: "7 de espadas", src: `${BASE_PATH}/7espadas.png` },
  { id: "6bastos", label: "6 de bastos", src: `${BASE_PATH}/6bastos.png` },
  { id: "5copas", label: "5 de copas", src: `${BASE_PATH}/5copas.png` },
] as const

type CardOption = (typeof CARD_OPTIONS)[number]

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
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const flipped = selectedCard !== null

  const handleSelectCard = useCallback(
    (option: CardOption) => {
      if (flipped || isFlipping || unlocked) return
      setIsFlipping(true)
      setSelectedCard(option)
    },
    [flipped, isFlipping, unlocked],
  )

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
  const showChoices = canDraw || isFlipping

  return (
    <section
      id="carta"
      data-progress-anchor=""
      data-progress-section="carta"
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-background",
        unlocked
          ? "min-h-[min(72vh,40rem)] py-16 md:py-20"
          : "min-h-[100dvh] md:min-h-[70vh]",
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
        className="relative z-10 flex w-full max-w-lg flex-col items-center px-4 sm:px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <motion.p
          animate={{ opacity: flipped ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          aria-hidden={flipped}
          className="mb-4 sm:mb-6 text-center text-xs sm:text-sm uppercase tracking-[0.28em] text-muted-foreground pointer-events-none select-none"
        >
          Algo viene después del mundial…
        </motion.p>

        {/* Mazo + carta activa */}
        <motion.div
          className="relative w-[min(42vw,9.5rem)] sm:w-[min(44vw,12rem)] md:w-[min(36vw,17.5rem)]"
          style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
          aria-label={selectedCard ? selectedCard.label : "Mazo de cartas"}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 origin-center"
            style={{ transform: "rotate(-10deg) translate(-6%, 4%)" }}
            animate={{ opacity: flipped ? 0.55 : 0.75 }}
            transition={{ duration: 0.5 }}
            aria-hidden
          >
            <CardPhoto
              src={CARTA_DORSO_SRC}
              alt=""
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] origin-center"
            style={{ transform: "rotate(7deg) translate(5%, 2%)" }}
            animate={{ opacity: flipped ? 0.7 : 0.9 }}
            transition={{ duration: 0.5 }}
            aria-hidden
          >
            <CardPhoto
              src={CARTA_DORSO_SRC}
              alt=""
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />
          </motion.div>

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
                {selectedCard && (
                  <CardPhoto
                    src={selectedCard.src}
                    alt={selectedCard.label}
                    width={671}
                    height={1025}
                  />
                )}
              </CardFace>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-4 sm:mt-6 flex w-full max-w-sm min-h-[9.25rem] sm:min-h-[10.25rem] flex-col items-center justify-start">
          <AnimatePresence mode="wait">
            {showChoices ? (
              <motion.div
                key="choices"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: flipped ? 0.35 : 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full pointer-events-none"
                aria-hidden={flipped}
              >
                <p className="mb-3 sm:mb-4 text-center text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <span className="text-primary/90">Adiviná</span> qué carta sale…
                </p>
                <div
                  className="pointer-events-auto grid grid-cols-2 gap-2 sm:gap-3"
                  role="group"
                  aria-label="Elegí una carta"
                >
                  {CARD_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isFlipping}
                      onClick={() => handleSelectCard(option)}
                      className={cn(
                        "cursor-pointer rounded-lg border border-border/60 bg-card/40 px-2 py-2.5 sm:px-3 sm:py-3",
                        "text-center text-xs sm:text-sm leading-snug text-foreground/90",
                        "transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        "disabled:pointer-events-none disabled:opacity-50",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : flipped && !unlocked ? (
              <motion.p
                key="suspense"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2 text-center text-sm text-muted-foreground/80 tracking-wide"
              >
                {prefersReducedMotion ? "Continuá bajando…" : "Un momento…"}
              </motion.p>
            ) : unlocked ? (
              <motion.p
                key="unlocked"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pt-6 sm:pt-8 text-center text-sm uppercase tracking-[0.22em] text-muted-foreground"
              >
                Seguí bajando
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
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
