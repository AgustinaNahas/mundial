"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

const BASE_PATH = "/mundial"

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
    <div className="space-y-1 md:space-y-1.5">
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {labels.map((l, i) => (
          <span key={i} className={`text-center text-[6.5px] md:text-[9px] uppercase leading-none ${i === 0 || i === 6 ? "text-muted-foreground/25" : "text-muted-foreground/50"}`}>{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
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
              className="aspect-square rounded-[2px] md:rounded-sm flex items-center justify-center overflow-visible"
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

export function CamisetaSection() {
  const { getIndicador, loading } = useData()

  const camiseta = getIndicador("CAMISETA_ADIDAS")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  const dolar = getIndicador("VALOR_DOLAR_PESO")

  const camiseta_2022 = camiseta?.valor_2022 ?? 22000
  const camiseta_2026 = camiseta?.valor_2026 ?? 189999
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  const dolar_2022 = dolar?.valor_2022 ?? 177
  const dolar_2026 = dolar?.valor_2026 ?? 1070

  const diasTrabajo2022 = Math.ceil(camiseta_2022 / (salario_2022 / 22))
  const diasTrabajo2026 = Math.ceil(camiseta_2026 / (salario_2026 / 22))

  const usd2022 = (camiseta_2022 / dolar_2022).toFixed(0)
  const usd2026 = (camiseta_2026 / dolar_2026).toFixed(0)

  if (loading) {
    return (
      <SectionWrapper number="03" title="La camiseta" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number="03"
      title="La camiseta"
      intro="Vestir los colores de la Selección requiere más días de trabajo que hace 4 años."
      sources={[camiseta, salario, dolar]}
    >
      <div className="grid grid-cols-2 gap-3 md:gap-12">

        {/* ── Columna 2022 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-3 md:space-y-6 min-w-0"
        >
          {/* Jersey */}
          <motion.div
            whileHover="hovered"
            className="relative w-[5.25rem] h-[5.25rem] md:w-40 md:h-40 mx-auto cursor-pointer"
          >
            <motion.div
              variants={{
                hovered: { scale: 2.5, y: 4 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 opacity-25"
              aria-hidden="true"
            >
              <Image
                src={`${BASE_PATH}/camiseta2022.webp`}
                alt=""
                fill
                sizes="(max-width: 767px) 84px, 160px"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              variants={{
                hovered: { scale: 1.06 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 h-full w-full"
            >
              <Image
                src={`${BASE_PATH}/camiseta2022.webp`}
                alt="Camiseta 2022"
                fill
                sizes="(max-width: 767px) 84px, 160px"
                className="object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Precios */}
          <div className="text-center space-y-0.5 md:space-y-1">
            <p className="text-base md:text-3xl font-light text-accent leading-tight tabular-nums">
              {formatCurrency(camiseta_2022, camiseta?.unidad)}
            </p>
            <p className="text-[11px] md:text-base text-muted-foreground leading-snug">
              ≈ <span className="text-foreground font-medium">{formatCurrency(Number(usd2022), "USD")}</span>
              <span className="text-[9px] md:text-xs ml-0.5 md:ml-1 text-muted-foreground/60 block md:inline">al cambio 2022</span>
            </p>
          </div>

          {/* Días laborables */}
          <div className="space-y-1.5 md:space-y-3">
            <p className="text-[9px] md:text-xs uppercase tracking-[0.12em] md:tracking-[0.18em] text-muted-foreground/70 text-center leading-tight px-0.5">
              {diasTrabajo2022} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2022}
              color="oklch(0.97 0.01 220)"
              delay={0.2}
              completionMarker={<Image src={`${BASE_PATH}/camiseta2022.webp`} alt="" width={20} height={20} className="h-3.5 w-auto md:h-5 object-contain" />}
            />
          </div>
        </motion.div>

        {/* ── Columna 2026 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-3 md:space-y-6 min-w-0"
        >
          {/* Jersey */}
          <motion.div
            whileHover="hovered"
            className="relative w-[5.25rem] h-[5.25rem] md:w-40 md:h-40 mx-auto cursor-pointer"
          >
            <motion.div
              variants={{
                hovered: { scale: 2.5, y: 4 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 opacity-25"
              aria-hidden="true"
            >
              <Image
                src={`${BASE_PATH}/camiseta2026.webp`}
                alt=""
                fill
                sizes="(max-width: 767px) 84px, 160px"
                className="object-contain [transform:rotateY(180deg)]"
              />
            </motion.div>
            <motion.div
              variants={{
                hovered: { scale: 1.06 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 h-full w-full"
            >
              <Image
                src={`${BASE_PATH}/camiseta2026.webp`}
                alt="Camiseta 2026"
                fill
                sizes="(max-width: 767px) 84px, 160px"
                className="object-contain [transform:rotateY(180deg)]"
              />
            </motion.div>
          </motion.div>

          {/* Precios */}
          <div className="text-center space-y-0.5 md:space-y-1">
            <p className="text-base md:text-3xl font-light text-primary leading-tight tabular-nums">
              {formatCurrency(camiseta_2026, camiseta?.unidad)}
            </p>
            <p className="text-[11px] md:text-base text-muted-foreground leading-snug">
              ≈ <span className="text-foreground font-medium">{formatCurrency(Number(usd2026), "USD")}</span>
              <span className="text-[9px] md:text-xs ml-0.5 md:ml-1 text-muted-foreground/60 block md:inline">al cambio 2026</span>
            </p>
          </div>

          {/* Días laborables */}
          <div className="space-y-1.5 md:space-y-3">
            <p className="text-[9px] md:text-xs uppercase tracking-[0.12em] md:tracking-[0.18em] text-muted-foreground/70 text-center leading-tight px-0.5">
              {diasTrabajo2026} días de sueldo mínimo
            </p>
            <WorkCalendar
              days={diasTrabajo2026}
              color="oklch(0.65 0.18 222)"
              delay={0.35}
              completionMarker={<Image src={`${BASE_PATH}/camiseta2026.webp`} alt="" width={20} height={20} className="h-3.5 w-auto md:h-5 object-contain [transform:rotateY(180deg)]" />}
            />
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
