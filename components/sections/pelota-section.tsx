"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn, formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

const BASE_PATH = "/mundial"

const PELOTA_ROTATION_SLOW_S = 14
const PELOTA_ROTATION_FAST_S = 4

/** Rotación con rAF: siempre aplica `transform`, el hover solo cambia grados/segundo (sin CSS animation que a veces no corre con Tailwind). */
function PelotaRotator({
  clockwise,
  children,
  className,
}: {
  clockwise: boolean
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const fastRef = useRef(false)

  useEffect(() => {
    let raf = 0
    let lastMs: number | null = null

    const tick = (t: number) => {
      if (lastMs === null) lastMs = t
      const dt = Math.min((t - lastMs) / 1000, 0.05)
      lastMs = t
      const period = fastRef.current ? PELOTA_ROTATION_FAST_S : PELOTA_ROTATION_SLOW_S
      const degPerSec = 360 / period
      angleRef.current += (clockwise ? 1 : -1) * degPerSec * dt
      const el = ref.current
      if (el) el.style.transform = `rotate(${angleRef.current}deg)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [clockwise])

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ transformOrigin: "center center", willChange: "transform" }}
      onPointerEnter={() => {
        fastRef.current = true
      }}
      onPointerLeave={() => {
        fastRef.current = false
      }}
    >
      {children}
    </div>
  )
}

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

function WorkCalendar({ days, color, delay = 0, completionMarker }: {
  days: number
  color: string
  delay?: number
  completionMarker?: React.ReactNode
}) {
  const WEEK = 7
  const WORK = 5
  const weeks = Math.ceil(days / WORK)
  const totalSlots = weeks * WEEK
  const labels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const slotWorkDay = (slot: number) => {
    const day = slot % WEEK
    if (day === 0 || day === 6) return -1
    return Math.floor(slot / WEEK) * WORK + (day - 1)
  }

  const lastWeek = Math.floor((days - 1) / WORK)
  const lastDay  = (days - 1) % WORK
  const lastSlot = lastWeek * WEEK + (lastDay + 1)

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-7 gap-1">
        {labels.map((l, i) => (
          <span key={i} className={`text-center text-[9px] uppercase ${i === 0 || i === 6 ? "text-muted-foreground/25" : "text-muted-foreground/50"}`}>{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const workDay   = slotWorkDay(i)
          const isWeekend = workDay === -1
          const isFilled  = !isWeekend && workDay < days
          const isLast    = i === lastSlot

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: delay + i * 0.018, duration: 0.2 }}
              className="aspect-square rounded-sm flex items-center justify-center overflow-visible"
              style={
                isWeekend
                  ? { backgroundColor: "oklch(0.14 0.07 255)", opacity: 0.35 }
                  : isFilled
                  ? { backgroundColor: color }
                  : { backgroundColor: "oklch(0.18 0.07 255)", border: "1px solid oklch(0.24 0.09 252)" }
              }
            >
              {isLast && completionMarker}
            </motion.div>
          )
        })}
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
          <div className="w-40 h-40 mx-auto">
            <PelotaRotator clockwise className="relative h-full w-full cursor-pointer touch-manipulation">
              <Image
                src={`${BASE_PATH}/pelota2022.webp`}
                alt="Pelota 2022"
                fill
                sizes="160px"
                className="pointer-events-none object-contain"
              />
            </PelotaRotator>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60">Qatar 2022</p>
            <p className="text-2xl md:text-3xl font-light text-accent">
              {formatCurrency(pelota_2022, pelota?.unidad)}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 text-center">
              {diasTrabajo2022} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2022}
              color="oklch(0.97 0.01 220)"
              delay={0.2}
              completionMarker={<span style={{ fontSize: 13, lineHeight: 1 }}>⚽</span>}
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
          <div className="w-40 h-40 mx-auto">
            <PelotaRotator clockwise={false} className="relative h-full w-full cursor-pointer touch-manipulation">
              <Image
                src={`${BASE_PATH}/pelota2026.webp`}
                alt="Pelota 2026"
                fill
                sizes="160px"
                className="pointer-events-none object-contain"
              />
            </PelotaRotator>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60">EEUU 2026</p>
            <p className="text-2xl md:text-3xl font-light text-primary">
              {formatCurrency(pelota_2026, pelota?.unidad)}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 text-center">
              {diasTrabajo2026} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2026}
              color="oklch(0.65 0.18 222)"
              delay={0.35}
              completionMarker={<span style={{ fontSize: 13, lineHeight: 1 }}>⚽</span>}
            />
          </div>
        </motion.div>

      </div>
    </SectionWrapper>
  )
}
