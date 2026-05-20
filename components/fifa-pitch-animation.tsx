"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import Lottie from "lottie-react"
import runAnimationRaw from "@/public/run.json"

function tintRunAnimation() {
  return JSON.parse(
    JSON.stringify(runAnimationRaw).replaceAll(
      '"k":[0,0,0,1]',
      '"k":[0.502,0.769,0.859,1]',
    ),
  )
}

type PlayerId = "p1" | "p2" | "p3" | "p4"

const STRIPE_W = 34 // ~20% más que 28px
const STRIPE_PERIOD = STRIPE_W * 2

const PLAYERS: { id: PlayerId; left: string; bottom: string; facing: "left" | "right" }[] = [
  { id: "p1", left: "10%", bottom: "22%", facing: "right" },
  { id: "p2", left: "30%", bottom: "38%", facing: "right" },
  { id: "p3", left: "52%", bottom: "24%", facing: "right" },
  { id: "p4", left: "72%", bottom: "36%", facing: "right" },
]

const BALL_AT: Record<PlayerId | "goal", { left: string; bottom: string }> = {
  p1: { left: "12%", bottom: "30%" },
  p2: { left: "32%", bottom: "44%" },
  p3: { left: "54%", bottom: "30%" },
  p4: { left: "74%", bottom: "42%" },
  goal: { left: "99%", bottom: "40%" },
}

const SCROLL_STEPS = [
  { threshold: 0.2, ballAt: "p2" as const, amount: 38_500 },
  { threshold: 0.4, ballAt: "p3" as const, amount: 55_000 },
  { threshold: 0.6, ballAt: "p4" as const, amount: 71_500 },
  { threshold: 0.8, ballAt: "goal" as const, amount: 185_000 },
]

function PlayerSilhouette({ facing }: { facing: "left" | "right" }) {
  const runAnimation = useMemo(() => tintRunAnimation(), [])

  return (
    <div
      className="h-28 w-24 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
      style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <Lottie
        animationData={runAnimation}
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

function PitchMarkings() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Borde de cancha */}
      <rect x="3" y="4" width="94" height="48" fill="none" stroke="white" strokeWidth="0.35" />
      {/* Mitad de cancha */}
      <line x1="50" y1="4" x2="50" y2="52" stroke="white" strokeWidth="0.35" />
      {/* Círculo central */}
      <circle cx="50" cy="28" r="9" fill="none" stroke="white" strokeWidth="0.35" />
      <circle cx="50" cy="28" r="0.8" fill="white" />
      {/* Área grande derecha */}
      <rect x="72" y="14" width="25" height="28" fill="none" stroke="white" strokeWidth="0.35" />
      {/* Área chica derecha */}
      <rect x="82" y="20" width="15" height="16" fill="none" stroke="white" strokeWidth="0.35" />
      {/* Semicírculo área derecha */}
      <path d="M 72 22 A 9 9 0 0 0 72 34" fill="none" stroke="white" strokeWidth="0.35" />
      {/* Área grande izquierda */}
      <rect x="3" y="14" width="25" height="28" fill="none" stroke="white" strokeWidth="0.35" />
      {/* Área chica izquierda */}
      <rect x="3" y="20" width="15" height="16" fill="none" stroke="white" strokeWidth="0.35" />
      <path d="M 28 22 A 9 9 0 0 1 28 34" fill="none" stroke="white" strokeWidth="0.35" />
    </svg>
  )
}

function GoalNet({ shaking }: { shaking: boolean }) {
  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
      aria-hidden
      animate={shaking ? { x: [0, -1.2, 1.2, -0.8, 0.8, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* ── Arco DERECHO (ataque) ── */}
      <line x1="97" y1="21" x2="97" y2="35" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
      <line x1="97" y1="21" x2="97" y2="35" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="97" y1="21" x2="100" y2="21" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="97" y1="35" x2="100" y2="35" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      {/* Red derecha */}
      <line x1="98.3" y1="21" x2="98.3" y2="35" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="99.3" y1="21" x2="99.3" y2="35" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="97" y1="23.3" x2="100" y2="23.3" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="97" y1="25.6" x2="100" y2="25.6" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="97" y1="27.9" x2="100" y2="27.9" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="97" y1="30.2" x2="100" y2="30.2" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="97" y1="32.5" x2="100" y2="32.5" stroke="white" strokeWidth="0.2" opacity="0.45" />
      {/* Flash de gol derecho */}
      <AnimatePresence>
        {shaking && (
          <motion.rect
            x="97" y="21" width="3" height="14"
            fill="oklch(0.65 0.18 222 / 0.35)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ── Arco IZQUIERDO (defensa) ── */}
      <line x1="3" y1="21" x2="3" y2="35" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
      <line x1="3" y1="21" x2="3" y2="35" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="0" y1="21" x2="3" y2="21" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="0" y1="35" x2="3" y2="35" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      {/* Red izquierda */}
      <line x1="0.7" y1="21" x2="0.7" y2="35" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="1.7" y1="21" x2="1.7" y2="35" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="0" y1="23.3" x2="3" y2="23.3" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="0" y1="25.6" x2="3" y2="25.6" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="0" y1="27.9" x2="3" y2="27.9" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="0" y1="30.2" x2="3" y2="30.2" stroke="white" strokeWidth="0.2" opacity="0.45" />
      <line x1="0" y1="32.5" x2="3" y2="32.5" stroke="white" strokeWidth="0.2" opacity="0.45" />
    </motion.svg>
  )
}

function MoneyPop({ amount, playerId }: { amount: number; playerId: PlayerId | "goal" }) {
  const pos = playerId === "goal" ? BALL_AT.goal : BALL_AT[playerId]
  return (
    <motion.div
      key={`${playerId}-${amount}`}
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      animate={{ opacity: 1, y: -28, scale: 1 }}
      exit={{ opacity: 0, y: -44 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="absolute z-20 pointer-events-none -translate-x-1/2"
      style={{ left: pos.left, bottom: `calc(${pos.bottom} + 4.25rem)` }}
    >
      <span className="inline-block rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm tabular-nums">
        +{formatCurrency(amount)}
      </span>
    </motion.div>
  )
}

function PitchCanvas({
  pitch,
  overlay,
}: {
  pitch: ReactNode
  overlay?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="relative min-w-0 flex-1 overflow-visible aspect-[2.2/1] min-h-[160px] max-h-[220px]"
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-border/50">
        {pitch}
      </div>
      {overlay}
    </motion.div>
  )
}

export function FifaPitchAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // -1 = sin trigger aún, 0-3 = paso activo
  const [step, setStep] = useState(-1)
  const [moneyPop, setMoneyPop] = useState<{ amount: number; at: PlayerId | "goal" } | null>(null)
  const prevStep = useRef(-1)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return
    let next = -1
    for (let i = SCROLL_STEPS.length - 1; i >= 0; i--) {
      if (v >= SCROLL_STEPS[i].threshold) { next = i; break }
    }
    setStep(next)
  })

  useEffect(() => {
    if (prefersReducedMotion || step < 0 || step <= prevStep.current) {
      prevStep.current = step
      return
    }
    const { amount, ballAt } = SCROLL_STEPS[step]
    setMoneyPop({ amount, at: ballAt })
    const t = window.setTimeout(() => setMoneyPop(null), 1000)
    prevStep.current = step
    return () => window.clearTimeout(t)
  }, [step, prefersReducedMotion])

  const activeBall = step < 0 ? "p1" : SCROLL_STEPS[step].ballAt
  const ballPos = BALL_AT[activeBall]
  const isGoal = activeBall === "goal"

  if (prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="flex min-w-0 gap-2 sm:gap-4"
      >
        <span className="w-10 shrink-0 sm:w-12" aria-hidden />
        <p className="min-w-0 flex-1 text-center text-xs text-muted-foreground py-6 border border-border/40 rounded-xl bg-muted/30">
          Ilustración: en FIFA cada pase suma valor — la consola cuesta más en pesos, pero el poder adquisitivo cambió.
        </p>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} className="flex min-w-0 items-stretch gap-2 sm:gap-4">
      {/* Mismo offset que las etiquetas 2022/2026 de ComparisonBar */}
      <span className="w-10 shrink-0 sm:w-12" aria-hidden />
      <PitchCanvas
        pitch={
          <>
            {/* Pasto */}
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
              transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    oklch(0.32 0.12 145) 0px,
                    oklch(0.32 0.12 145) ${STRIPE_W}px,
                    oklch(0.28 0.11 148) ${STRIPE_W}px,
                    oklch(0.28 0.11 148) ${STRIPE_PERIOD}px
                  ),
                  linear-gradient(180deg, oklch(0.34 0.13 142) 0%, oklch(0.22 0.09 150) 100%)
                `,
                backgroundSize: `${STRIPE_PERIOD * 2}px 100%, 100% 100%`,
              }}
            />

            <PitchMarkings />
            <GoalNet shaking={isGoal} />

            {/* Jugadores */}
            {PLAYERS.map((p, i) => (
              <motion.div
                key={p.id}
                className="absolute -translate-x-1/2"
                style={{ left: p.left, bottom: p.bottom }}
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.12 }}
              >
                <PlayerSilhouette facing={p.facing} />
              </motion.div>
            ))}

            {/* Pelota */}
            <motion.div
              className="absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[13px]"
              animate={{
                left: ballPos.left,
                bottom: ballPos.bottom,
                scale: isGoal ? [1, 1.2, 0.85] : 1,
              }}
              transition={{
                left: { duration: 0.7, ease: "easeInOut" },
                bottom: { duration: 0.7, ease: "easeInOut" },
                scale: { duration: 0.7 },
              }}
              style={{ left: ballPos.left, bottom: ballPos.bottom }}
            >
              ⚽
            </motion.div>
          </>
        }
        overlay={
          <AnimatePresence>
            {moneyPop && <MoneyPop amount={moneyPop.amount} playerId={moneyPop.at} />}
          </AnimatePresence>
        }
      />
    </div>
  )
}
