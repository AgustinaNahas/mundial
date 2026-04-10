"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

function FootballSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" role="img" aria-label="Pelota de fútbol">
      <defs>
        <clipPath id="ball-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="44" fill="white" />
      <polygon points="50,24 62,33 58,47 42,47 38,33" fill="oklch(0.14 0.08 256)" clipPath="url(#ball-clip)" />
      <polygon points="72,60 84,52 86,66 76,74 64,68" fill="oklch(0.14 0.08 256)" clipPath="url(#ball-clip)" />
      <polygon points="28,60 16,52 14,66 24,74 36,68" fill="oklch(0.14 0.08 256)" clipPath="url(#ball-clip)" />
      <polygon points="74,36 88,34 90,20 76,16 66,24" fill="oklch(0.14 0.08 256)" clipPath="url(#ball-clip)" />
      <polygon points="26,36 12,34 10,20 24,16 34,24" fill="oklch(0.14 0.08 256)" clipPath="url(#ball-clip)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="oklch(0.24 0.09 252)" strokeWidth="1.5" />
      <ellipse cx="36" cy="32" rx="10" ry="7" fill="white" opacity="0.25" transform="rotate(-20,36,32)" />
    </svg>
  )
}

function WorkCalendar({ days, color, delay = 0 }: { days: number; color: string; delay?: number }) {
  const cols  = 5
  const weeks = Math.ceil(days / cols)
  const labels = ["L", "M", "M", "J", "V"]

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-5 gap-1">
        {labels.map((l, i) => (
          <span key={i} className="text-center text-[9px] text-muted-foreground/50 uppercase">{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: weeks * cols }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + i * 0.025, duration: 0.2 }}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor: i < days ? color : "oklch(0.18 0.07 255)",
              border:          i < days ? "none" : "1px solid oklch(0.24 0.09 252)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function PelotaSection() {
  const { getIndicador, loading } = useData()

  const pelota  = getIndicador("PELOTA_MUNDIAL")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const pelota_2022  = pelota?.valor_2022  ?? 8900
  const pelota_2026  = pelota?.valor_2026  ?? 89999
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718

  const diasTrabajo2022 = Math.ceil(pelota_2022  / (salario_2022 / 22))
  const diasTrabajo2026 = Math.ceil(pelota_2026  / (salario_2026 / 22))

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

  if (loading) {
    return (
      <SectionWrapper number="03" title="La pelota" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number="03"
      title="La pelota"
      intro="Jugar al fútbol tiene un precio. La pelota oficial del Mundial pasó de ser un capricho caro a un lujo difícil de justificar."
      sources={[pelota, salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

        {/* ── Columna 2022 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Pelota animada */}
          <div className="w-40 h-40 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
              className="w-full h-full"
            >
              <img src="./mundial/pelota2022.webp"/>
            </motion.div>
          </div>

          {/* Precio */}
          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60">Qatar 2022</p>
            <p className="text-2xl md:text-3xl font-light text-primary">
              {formatARS(pelota_2022)}
            </p>
          </div>

          {/* Días laborables */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 text-center">
              {diasTrabajo2022} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2022}
              color="oklch(0.65 0.18 222)"
              delay={0.2}
            />
          </div>
        </motion.div>

        {/* ── Columna 2026 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Pelota animada */}
          <div className="w-40 h-40 mx-auto">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
              className="w-full h-full"
            >
              <img src="./mundial/pelota2026.png"/>
            </motion.div>
          </div>

          {/* Precio */}
          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60">EEUU 2026</p>
            <p className="text-2xl md:text-3xl font-light text-primary">
              {formatARS(pelota_2026)}
            </p>
          </div>

          {/* Días laborables */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 text-center">
              {diasTrabajo2026} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2026}
              color="oklch(0.45 0.12 240)"
              delay={0.35}
            />
          </div>
        </motion.div>

      </div>
    </SectionWrapper>
  )
}
