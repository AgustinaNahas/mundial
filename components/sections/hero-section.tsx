"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useAnimationFrame,
  MotionValue,
} from "framer-motion"

const TOTAL  = 160
const RADIUS = 90   // px — distancia de influencia
const FORCE  = 60   // px — desplazamiento máximo al tocar

interface PieceReg {
  xPush: MotionValue<number>
  yPush: MotionValue<number>
  leftPct: number
  delay: number
  duration: number
}

// Componente separado para que cada pieza tenga sus propios hooks
function ConfettiPiece({
  index,
  onMount,
  onUnmount,
}: {
  index: number
  onMount: (i: number, reg: PieceReg) => void
  onUnmount: (i: number) => void
}) {
  const duration = 6 + (index % 8)
  const delay    = (index % 20) * 0.3
  const leftPct  = (index * 13) % 100
  const size     = 6 + (index % 4) * 2
  const rotStart = (index * 37) % 360
  const rotEnd   = rotStart + (index % 2 === 0 ? 360 : -360)

  const xPushMv = useMotionValue(0)
  const yPushMv = useMotionValue(0)
  const xSpring = useSpring(xPushMv, { stiffness: 280, damping: 20 })
  const ySpring = useSpring(yPushMv, { stiffness: 280, damping: 20 })

  // Registrar con el padre al montar para que el RAF section tenga acceso
  useEffect(() => {
    onMount(index, { xPush: xPushMv, yPush: yPushMv, leftPct, delay, duration })
    return () => onUnmount(index)
  }, [index, onMount, onUnmount, xPushMv, yPushMv, leftPct, delay, duration])

  const color =
    index % 3 === 0
      ? "oklch(0.65 0.18 222)"
      : index % 3 === 1
        ? "#ffffff"
        : "oklch(0.75 0.13 218)"

  return (
    // Outer div: aplica el desplazamiento del mouse (springs x/y)
    <motion.div
      className="absolute"
      style={{ left: `${leftPct}%`, top: 0, x: xSpring, y: ySpring }}
    >
      {/* Inner div: animación de caída */}
      <motion.div
        className="rounded-sm"
        style={{ width: size, height: size * 2, backgroundColor: color }}
        initial={{ y: "-5vh", opacity: 0 }}
        animate={{
          y: "105vh",
          opacity: [0, 1, 1, 1, 0],
          rotate: [rotStart, rotEnd],
        }}
        transition={{ repeat: Infinity, delay, duration, ease: "linear" }}
      />
    </motion.div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mouseRef   = useRef({ x: 0, y: 0, active: false })
  const startTime  = useRef(Date.now())
  const piecesRef  = useRef(new Map<number, PieceReg>())

  const handleMount   = useCallback((i: number, reg: PieceReg) => { piecesRef.current.set(i, reg) }, [])
  const handleUnmount = useCallback((i: number) => { piecesRef.current.delete(i) }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
    mouseRef.current.active = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
    piecesRef.current.forEach(reg => { reg.xPush.set(0); reg.yPush.set(0) })
  }, [])

  // Loop de animación único: calcula posición aproximada de cada pieza
  // y aplica repulsión si el mouse está cerca
  useAnimationFrame(() => {
    if (!mouseRef.current.active || !sectionRef.current) return

    const { x: mx, y: my } = mouseRef.current
    const el   = sectionRef.current
    const rect = el.getBoundingClientRect()  // 1 sola llamada por frame
    const sH   = rect.height
    const sW   = el.clientWidth
    const now  = (Date.now() - startTime.current) / 1000

    piecesRef.current.forEach(reg => {
      // Posición aproximada usando el tiempo de animación (evita DOM queries por pieza)
      const rawElapsed = now - reg.delay
      const elapsed    = rawElapsed < 0 ? 0 : rawElapsed % reg.duration
      const progress   = elapsed / reg.duration

      const approxX = rect.left + (reg.leftPct / 100) * sW
      const approxY = rect.top  + (-0.05 * sH + progress * 1.1 * sH)

      const dx   = approxX - mx
      const dy   = approxY - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < RADIUS && dist > 1) {
        // Fuerza inversamente proporcional a la distancia (suavizada)
        const t = (1 - dist / RADIUS) ** 2
        reg.xPush.set((dx / dist) * FORCE * t)
        reg.yPush.set((dy / dist) * FORCE * t)
      } else {
        reg.xPush.set(0)
        reg.yPush.set(0)
      }
    })
  })

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden h-screen flex items-center justify-center bg-background"
    >
      {/* Glow celeste desde arriba */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,oklch(0.65_0.18_222/0.35),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Papelitos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: TOTAL }, (_, i) => (
          <ConfettiPiece
            key={i}
            index={i}
            onMount={handleMount}
            onUnmount={handleUnmount}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center space-y-10"
        >
          <div className="space-y-3">
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-foreground tracking-[0.04em] leading-none uppercase">
              ¿Cuánto cuesta
            </h1>
            <h2 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-primary tracking-[0.06em] leading-none uppercase">
              ser campeón del mundo?
            </h2>
          </div>

          {/* Badge 2022 → 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center justify-center gap-0 mx-auto w-fit rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-1.5 px-7 py-4 bg-primary/10">
              <span className="text-xl">⭐</span>
              <span className="font-display font-black text-2xl md:text-3xl text-foreground tracking-[0.04em] leading-none">2022</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-primary">Qatar · Campeones</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-7 py-4">
              <span className="text-xl">⚽</span>
              <span className="font-display font-black text-2xl md:text-3xl text-foreground tracking-[0.04em] leading-none">2026</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">EEUU · Can · Méx</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/40">Deslizá</span>
        <div className="w-5 h-8 rounded-full border-2 border-foreground/25 flex justify-center pt-1.5">
          <motion.div
            className="w-0.5 h-1.5 rounded-full bg-foreground/50"
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  )
}
