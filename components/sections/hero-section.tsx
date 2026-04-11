"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

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

    const handleResize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", handleResize)

    const TOTAL = 500
    const COLORS = ["#80c4db", "#ffffff", "#00a4dc"]
    const particles: any[] = []

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

    const parent = canvas.parentElement
    parent?.addEventListener("mousemove", handleMouseMove)
    parent?.addEventListener("mouseleave", handleMouseLeave)

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

        if (isMouseActive) {
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

      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      parent?.removeEventListener("mousemove", handleMouseMove)
      parent?.removeEventListener("mouseleave", handleMouseLeave)
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
  return (
    <section className="relative overflow-hidden h-screen flex items-center justify-center bg-background">
      {/* Glow celeste desde arriba */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,oklch(0.65_0.18_222/0.35),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Partículas puras en Canvas */}
      <HeroParticles />

      <div className="pointer-events-none absolute top-0 left-0 w-full h-full bg-linear-to-b from-[#00000044] to-[#00000099] ">
      </div>


      {/* Contenido principal */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center space-y-10"
        >
          <div className="space-y-3">
            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-foreground tracking-[0.04em] leading-none uppercase pointer-events-auto">
              ¿Cuánto cuesta
            </h1>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-primary tracking-[0.06em] leading-none uppercase pointer-events-auto">
              ser campeón del mundo?
            </h2>
          </div>

          {/* Badge 2022 → 2026 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-0 mx-auto w-fit rounded-2xl overflow-hidden border border-border/30 bg-card/40 backdrop-blur-sm pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-1.5 px-4 sm:px-7 py-4 bg-primary/10">
              <span className="text-xl">⭐</span>
              <span className="font-display font-black text-2xl md:text-3xl text-foreground tracking-[0.04em] leading-none">2022</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-primary">Qatar · Campeones</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-4 sm:px-7 py-4">
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
        className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
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
