"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { fontHand } from "@/lib/fonts"
import { HERO_COPY } from "@/lib/site-copy"
import { cn } from "@/lib/utils"

type HeroEra = "2022" | "2026"

const STAR_TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
const HANDWRITTEN_START_DELAY_MS = 2000
const HANDWRITTEN_CHAR_MS = 85

function HeroInsertLine() {
  const text = HERO_COPY.handwrittenInsert
  const [started, setStarted] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setStarted(true), HANDWRITTEN_START_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!started || charIndex >= text.length) return
    const timer = window.setTimeout(() => setCharIndex((i) => i + 1), HANDWRITTEN_CHAR_MS)
    return () => window.clearTimeout(timer)
  }, [started, charIndex, text.length])

  const visible = started ? text.slice(0, charIndex) : ""
  const typing = started && charIndex < text.length

  return (
    <p
      className="flex flex-wrap items-baseline justify-center w-full gap-x-[0.2em] sm:gap-x-3 leading-none 
      pointer-events-auto min-h-[1.4rem] sm:min-h-[2rem] md:min-h-[2.5rem] -mt-0 sm:-mt-2 md:-mt-2.5"
      aria-live="polite"
      aria-label={started && charIndex >= text.length ? `v ${text}` : undefined}
    >
      <span
        className={cn(
          fontHand.className,
          "normal-case text-[1.5rem] sm:text-[2.25rem] md:text-[3rem] text-secondary ",
          "leading-none -rotate-1 shrink-0",
          "transition-opacity duration-300",
          started ? "opacity-100" : "opacity-0"
        )}
      >
        {visible}
      </span>
    </p>
  )
}

function HeroStars({ era }: { era: HeroEra }) {
  const showFourth = era === "2026"

  return (
    <motion.div
      layout
      className="flex items-center justify-center mt-4 md:mt-6 pointer-events-auto"
      transition={{ layout: STAR_TRANSITION }}
      aria-label="Tres estrellas del mundial ganado"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          layout
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.45, type: "spring", stiffness: 320 }}
          className={cn(
            "text-xl sm:text-2xl md:text-4xl text-secondary leading-none select-none",
            i > 0 && "ml-1.5 sm:ml-2"
          )}
          aria-hidden
        >
          ⭐
        </motion.span>
      ))}
      <motion.div
        layout
        initial={false}
        className="overflow-hidden flex items-center justify-center shrink-0"
        animate={{
          width: showFourth ? "3rem" : 0,
          marginLeft: showFourth ? "0.375rem" : 0,
        }}
        transition={STAR_TRANSITION}
      >
        <motion.span
          initial={false}
          animate={{
            opacity: showFourth ? 1 : 0,
            scale: showFourth ? 1 : 0.4,
            rotate: showFourth ? 0 : -24,
          }}
          transition={STAR_TRANSITION}
          className="text-xl sm:text-2xl md:text-4xl leading-none select-none text-muted-foreground/45 
          grayscale"
          aria-hidden
        >
          ⭐
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

function EraBadgeButton({
  active,
  onClick,
  emoji,
  emojis,
  label,
  place,
}: {
  active: boolean
  onClick: () => void
  emoji?: string
  emojis?: readonly string[]
  label: string
  place: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col items-center gap-1.5 px-4 sm:px-7 py-4 transition-colors duration-300 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active ? "bg-secondary/25" : "bg-transparent hover:bg-card/25"
      )}
    >
      {emojis ? (
        <span className="text-xl leading-relaxed flex items-center gap-1">
          {emojis.map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </span>
      ) : (
        <span className="text-xl leading-relaxed">{emoji}</span>
      )}
      <span className="font-display font-black text-2xl md:text-3xl text-foreground tracking-[0.04em] leading-none">
        {label}
      </span>
      <span
        className={cn(
          "text-[9px] uppercase tracking-[0.18em] transition-colors duration-300",
          active ? "text-secondary" : "text-muted-foreground"
        )}
      >
        {place}
      </span>
    </button>
  )
}

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = canvas.parentElement?.clientWidth || window.innerWidth
    let height = canvas.parentElement?.clientHeight || window.innerHeight
    canvas.width = width
    canvas.height = height

    const isMobile = window.innerWidth < 768 || "ontouchstart" in window

    const handleResize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", handleResize)

    const TOTAL = isMobile ? Math.round(500 * 0.4) : 500
    const COLORS = ["#80c4db", "#ffffff", "#00a4dc"]
    const particles: any[] = []
    const burstParticles: any[] = []

    for (let i = 0; i < TOTAL; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: 6 + (i % 4) * 2,
        h: (6 + (i % 4) * 2) * 2,
        color: COLORS[i % 3],
        vy: 1.5 + Math.random() * 2.5,
        vx: -0.5 + Math.random() * 1,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        flipRot: Math.random() * Math.PI * 2,
        flipSpeed: (Math.random() - 0.5) * 0.1,
        baseVy: 1.5 + Math.random() * 2.5,
        borderRadius: 10
      })
    }

    const spawnBurst = (tapX: number, tapY: number) => {
      const BURST_COUNT = 35
      for (let i = 0; i < BURST_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / BURST_COUNT + (Math.random() - 0.5) * 0.4
        const speed = 3 + Math.random() * 7
        const maxLife = 55 + Math.random() * 35
        burstParticles.push({
          x: tapX,
          y: tapY,
          w: 4 + Math.random() * 6,
          h: (4 + Math.random() * 6) * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
          flipRot: Math.random() * Math.PI * 2,
          flipSpeed: (Math.random() - 0.5) * 0.15,
          life: maxLife,
          maxLife,
          borderRadius: 10
        })
      }
    }

    let mouseX = -1000
    let mouseY = -1000
    let isMouseActive = false

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      isMouseActive = true
    }
    const handleMouseLeave = () => {
      isMouseActive = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const rect = canvas.getBoundingClientRect()
      spawnBurst(touch.clientX - rect.left, touch.clientY - rect.top)
    }

    const parent = canvas.parentElement
    parent?.addEventListener("mousemove", handleMouseMove)
    parent?.addEventListener("mouseleave", handleMouseLeave)
    if (isMobile) {
      parent?.addEventListener("touchstart", handleTouchStart, { passive: true })
    }

    const RADIUS = 80 // Distancia desde el vértice del mouse (radio generoso)
    const PUSH_FORCE = 3.5

    let animationId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.vy += 0.1 // Gravedad muy mínima
        p.y += p.vy
        p.x += p.vx
        p.rot += p.rotSpeed
        p.flipRot += p.flipSpeed

        // Fricción horizontal para que dejen de moverse hacia los costados
        p.vx *= 0.96

        // Retornar a la velocidad vertical base gentilmente
        p.vy = p.vy * 0.98 + p.baseVy * 0.02

        if (!isMobile && isMouseActive) {
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          // Añadimos un offset en Y para que el centro del "círculo colisionador" esté un poco más arriba (apuntando al puntero del mouse real)
          const dist = Math.sqrt(dx * dx + (dy + 10) * (dy + 10))

          if (dist < RADIUS) {
            const force = (RADIUS - dist) / RADIUS
            // Normalizar
            const dirX = dx / dist
            const dirY = (dy + 10) / dist

            p.vx += dirX * force * PUSH_FORCE
            p.vy += dirY * force * PUSH_FORCE
          }
        }

        // Tope máximo de velocidad
        if (p.vx > 30) p.vx = 30
        if (p.vx < -30) p.vx = -30
        if (p.vy > 10) p.vy = 10
        if (p.vy < -10) p.vy = -10

        // Reciclar partículas cuando se caen del tacho
        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
          p.vy = p.baseVy
          p.vx = -0.5 + Math.random() * 1
        }
        if (p.x > width + 20) p.x = -20
        if (p.x < -20) p.x = width + 20

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)

        const scaleY = Math.abs(Math.cos(p.flipRot))
        ctx.scale(1, scaleY)

        ctx.fillStyle = p.color

        ctx.beginPath()
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, p.borderRadius || 20)
        ctx.fill()
        ctx.restore()
      }

      // Renderizar partículas de explosión (tap)
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i]
        p.vy += 0.18
        p.vx *= 0.95
        p.vy *= 0.97
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rotSpeed
        p.flipRot += p.flipSpeed
        p.life--

        if (p.life <= 0) {
          burstParticles.splice(i, 1)
          continue
        }

        const alpha = p.life / p.maxLife
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        const bScaleY = Math.abs(Math.cos(p.flipRot))
        ctx.scale(1, bScaleY)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, p.borderRadius)
        ctx.fill()
        ctx.restore()
      }

      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      parent?.removeEventListener("mousemove", handleMouseMove)
      parent?.removeEventListener("mouseleave", handleMouseLeave)
      if (isMobile) {
        parent?.removeEventListener("touchstart", handleTouchStart)
      }
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-0 block"
    />
  )
}

export function HeroSection() {
  const [era, setEra] = useState<HeroEra>("2022")

  return (
    <section className="relative overflow-hidden h-screen flex items-center justify-center bg-background">
      {/* Glow celeste desde arriba */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,oklch(0.65_0.18_222/0.35),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Partículas puras en Canvas */}
      <HeroParticles />

      <div className="pointer-events-none absolute top-0 left-0 w-full h-full bg-linear-to-b 
      from-[#00000090] to-[#000000ee] 
      md:from-[#00000070] md:to-[#000000cc]" />
 

      {/* Contenido principal */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-6xl mx-auto text-center space-y-10"
        >
          <div className="space-y-3 overflow-visible">
            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
              <h1 className="font-display font-black text-5xl 
              sm:text-6xl md:text-8xl lg:text-9xl text-foreground tracking-[0.04em] 
              leading-none uppercase pointer-events-auto">
                {HERO_COPY.titleLine1}
              </h1>
              <HeroInsertLine />
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-primary tracking-[0.06em] leading-none uppercase pointer-events-auto">
                {HERO_COPY.titleLine2}
              </h2>
            </div>
            <HeroStars era={era} />
            <p className="mt-6 md:mt-12 max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-foreground/80 
            leading-relaxed pointer-events-auto">
              {HERO_COPY.subtitle}
            </p>
          </div>

          {/* Badge 2022 → 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-2 mx-auto w-full max-w-[17rem] sm:max-w-[20rem] rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm pointer-events-auto"
          >
            <EraBadgeButton
              active={era === "2022"}
              onClick={() => setEra("2022")}
              emoji={HERO_COPY.badge2022.emoji}
              label={HERO_COPY.badge2022.label}
              place={HERO_COPY.badge2022.place}
            />
            <EraBadgeButton
              active={era === "2026"}
              onClick={() => setEra("2026")}
              emojis={HERO_COPY.badge2026.emojis}
              label={HERO_COPY.badge2026.label}
              place={HERO_COPY.badge2026.place}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-8 sm:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 hidden sm:inline-block">Deslizá</span>
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
