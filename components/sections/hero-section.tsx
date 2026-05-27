"use client"

import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { ProjectInfoButton } from "@/components/project-info-button"
import { SpreadsheetIconLink } from "@/components/spreadsheet-icon-link"
import {
  MOTION_DURATION,
  MOTION_EASE,
  heroContainerVariants,
  heroItemVariants,
  heroTransition,
} from "@/lib/motion"
import { HERO_COPY } from "@/lib/site-copy"
import { cn } from "@/lib/utils"

const PARTICLE_OPACITY = 0.60

function HeroStars({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="flex items-center justify-center mt-4 md:mt-6 pointer-events-auto"
      aria-label="Tres estrellas del mundial ganado"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduced
              ? { duration: 0.2, delay: 0.12 + i * 0.05 }
              : {
                  delay: 0.28 + i * 0.06,
                  duration: 0.45,
                  ease: [...MOTION_EASE],
                }
          }
          className={cn(
            "text-xl sm:text-2xl md:text-4xl text-secondary leading-none select-none",
            i > 0 && "ml-1.5 sm:ml-2",
          )}
          aria-hidden
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}

function EraBadge({
  emoji,
  emojis,
  label,
  place,
}: {
  emoji?: string
  emojis?: readonly string[]
  label: string
  place: string
}) {
  return (
    <div className="flex w-full flex-col items-center gap-1 px-3 sm:px-5 py-3">
      {emojis ? (
        <span className="text-lg leading-relaxed flex items-center gap-1 opacity-90">
          {emojis.map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </span>
      ) : (
        <span className="text-lg leading-relaxed opacity-90">{emoji}</span>
      )}
      <span className="font-display font-bold text-xl md:text-2xl tracking-[0.04em] leading-none text-foreground/90">
        {label}
      </span>
      <span className="text-[9px] uppercase tracking-[0.16em] text-center leading-snug max-w-[8rem] text-muted-foreground">
        {place}
      </span>
    </div>
  )
}

function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const interactionLayer = canvas.closest("section")
    if (!interactionLayer) return

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
    const particles: {
      x: number
      y: number
      w: number
      h: number
      color: string
      vy: number
      vx: number
      rot: number
      rotSpeed: number
      flipRot: number
      flipSpeed: number
      baseVy: number
      borderRadius: number
    }[] = []
    const burstParticles: {
      x: number
      y: number
      w: number
      h: number
      color: string
      vx: number
      vy: number
      rot: number
      rotSpeed: number
      flipRot: number
      flipSpeed: number
      life: number
      maxLife: number
      borderRadius: number
    }[] = []

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
        borderRadius: 10,
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
          borderRadius: 10,
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

    interactionLayer.addEventListener("mousemove", handleMouseMove)
    interactionLayer.addEventListener("mouseleave", handleMouseLeave)
    if (isMobile) {
      interactionLayer.addEventListener("touchstart", handleTouchStart, { passive: true })
    }

    const RADIUS = 80
    const PUSH_FORCE = 3.5

    let animationId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.vy += 0.1
        p.y += p.vy
        p.x += p.vx
        p.rot += p.rotSpeed
        p.flipRot += p.flipSpeed
        p.vx *= 0.96
        p.vy = p.vy * 0.98 + p.baseVy * 0.02

        if (!isMobile && isMouseActive) {
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const dist = Math.sqrt(dx * dx + (dy + 10) * (dy + 10))

          if (dist < RADIUS) {
            const force = (RADIUS - dist) / RADIUS
            const dirX = dx / dist
            const dirY = (dy + 10) / dist
            p.vx += dirX * force * PUSH_FORCE
            p.vy += dirY * force * PUSH_FORCE
          }
        }

        if (p.vx > 30) p.vx = 30
        if (p.vx < -30) p.vx = -30
        if (p.vy > 10) p.vy = 10
        if (p.vy < -10) p.vy = -10

        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
          p.vy = p.baseVy
          p.vx = -0.5 + Math.random() * 1
        }
        if (p.x > width + 20) p.x = -20
        if (p.x < -20) p.x = width + 20

        ctx.save()
        ctx.globalAlpha = PARTICLE_OPACITY
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

        const alpha = (p.life / p.maxLife) * PARTICLE_OPACITY
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
      interactionLayer.removeEventListener("mousemove", handleMouseMove)
      interactionLayer.removeEventListener("mouseleave", handleMouseLeave)
      if (isMobile) {
        interactionLayer.removeEventListener("touchstart", handleTouchStart)
      }
      cancelAnimationFrame(animationId)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.8, ease: [...MOTION_EASE] }}
      className="pointer-events-none absolute inset-0 z-0"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </motion.div>
  )
}

export function HeroSection() {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <section className="relative overflow-hidden h-screen flex items-center justify-center bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,oklch(0.65_0.18_222/0.28),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      <HeroParticles />

      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-full bg-linear-to-b
      from-[#00000080] to-[#000000e0]
      md:from-[#00000060] md:to-[#000000c0]"
      />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 pointer-events-auto">
        <SpreadsheetIconLink />
        <ProjectInfoButton />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 pointer-events-none">
        <motion.div
          variants={heroContainerVariants(reducedMotion)}
          initial="hidden"
          animate="visible"
          className="md:max-w-6xl mx-auto text-center space-y-10"
        >
          <div className="space-y-3 overflow-visible">
            <motion.div
              variants={heroItemVariants(reducedMotion)}
              className="flex flex-col items-center gap-0.5 sm:gap-1"
            >
              <h1
                className="font-display font-black text-5xl
              sm:text-6xl md:text-8xl lg:text-9xl text-foreground tracking-[0.04em]
              leading-none uppercase pointer-events-auto"
              >
                {HERO_COPY.titleLine1}
              </h1>
              <h2 className="font-display mt-2 md:mt-6 font-bold md:mx-0 mx-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-primary tracking-[0.06em] leading-none uppercase pointer-events-auto">
                {HERO_COPY.titleLine2}
              </h2>
            </motion.div>

            <motion.div variants={heroItemVariants(reducedMotion)}>
              <HeroStars reduced={reducedMotion} />
            </motion.div>

            <motion.p
              variants={heroItemVariants(reducedMotion)}
              className="mt-6 md:mt-12 max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-foreground/80
            leading-relaxed pointer-events-auto"
            >
              {HERO_COPY.subtitle}
            </motion.p>

            <motion.p
              variants={heroItemVariants(reducedMotion)}
              className="max-w-2xl mx-auto text-sm text-muted-foreground pointer-events-auto"
            >
              {HERO_COPY.deckline}
            </motion.p>
          </div>

          <motion.div
            variants={heroItemVariants(reducedMotion)}
            className="mx-auto flex w-full max-w-md items-stretch justify-center gap-0 border-y border-border/25 py-1 pointer-events-none"
            aria-label="Mundiales comparados"
          >
            <EraBadge
              emoji={HERO_COPY.badge2022.emoji}
              label={HERO_COPY.badge2022.label}
              place={HERO_COPY.badge2022.place}
            />
            <div
              className="flex shrink-0 items-center justify-center self-center px-1 text-muted-foreground/50"
              aria-hidden
            >
              <ArrowRight className="size-5 sm:size-6" strokeWidth={2} />
            </div>
            <EraBadge
              emojis={HERO_COPY.badge2026.emojis}
              label={HERO_COPY.badge2026.label}
              place={HERO_COPY.badge2026.place}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={heroTransition(0.58, reducedMotion)}
        className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.28em] text-foreground/45">
          Deslizá
        </span>
        <div className="w-5 h-8 rounded-full border-2 border-foreground/30 flex justify-center pt-1.5">
          <motion.div
            className="w-0.5 h-1.5 rounded-full bg-foreground/55"
            animate={reducedMotion ? { opacity: 0.6 } : { y: [0, 8, 0], opacity: [0.85, 0.25, 0.85] }}
            transition={
              reducedMotion
                ? { duration: 0.2 }
                : {
                    repeat: Infinity,
                    duration: MOTION_DURATION.loop,
                    ease: [...MOTION_EASE],
                  }
            }
          />
        </div>
      </motion.div>
    </section>
  )
}
