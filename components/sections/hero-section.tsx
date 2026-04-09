"use client"

import { motion } from "framer-motion"

const confettiPieces = Array.from({ length: 160 })

export function HeroSection() {
  return (
    <section className="relative overflow-hidden h-screen flex items-center justify-center bg-background">
      {/* Glow celeste desde arriba */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,oklch(0.65_0.18_222/0.35),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Papelitos / confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((_, i) => {
          const duration = 6 + (i % 8)
          const delay = (i % 20) * 0.3
          const left = (i * 13) % 100
          const size = 6 + (i % 4) * 2
          const rotationStart = (i * 37) % 360
          const rotationEnd = rotationStart + (i % 2 === 0 ? 360 : -360)

          return (
            <motion.div
              key={i}
              initial={{ y: "-5vh", opacity: 0 }}
              animate={{
                y: "105vh",
                opacity: [0, 1, 1, 1, 0],
                rotate: [rotationStart, rotationEnd],
              }}
              transition={{ repeat: Infinity, delay, duration, ease: "linear" }}
              className="absolute rounded-sm"
              style={{
                left: `${left}%`,
                top: 0,
                width: size,
                height: size * 2,
                backgroundColor:
                  i % 3 === 0
                    ? "oklch(0.65 0.18 222)"
                    : i % 3 === 1
                    ? "#ffffff"
                    : "oklch(0.75 0.13 218)",
              }}
            />
          )
        })}
      </div>

      {/* Contenido principal */}
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center space-y-10"
        >
          <p className="text-secondary text-xs md:text-sm uppercase tracking-[0.35em]">
            Visualización de datos · Mundial
          </p>

          <div className="space-y-3">
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-primary-foreground tracking-[0.04em] leading-none uppercase">
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
            {/* Qatar 2022 */}
            <div className="flex flex-col items-center gap-1.5 px-7 py-4 bg-primary/10">
              <span className="text-xl">⭐</span>
              <span className="font-display font-black text-2xl md:text-3xl text-primary-foreground tracking-[0.04em] leading-none">
                2022
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-primary">Qatar · Campeones</span>
            </div>

            {/* Flecha central */}
            <div className="px-4 py-4 text-muted-foreground/40 text-lg font-light border-x border-border/20">
              →
            </div>

            {/* EEUU 2026 */}
            <div className="flex flex-col items-center gap-1.5 px-7 py-4">
              <span className="text-xl">⚽</span>
              <span className="font-display font-black text-2xl md:text-3xl text-primary-foreground tracking-[0.04em] leading-none">
                2026
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">EEUU · Can · Méx</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — anclado al borde inferior de la section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/40">Deslizá</span>
        {/* Mouse icon */}
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
