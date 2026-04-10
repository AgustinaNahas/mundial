"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

/** Visualización tipo calendario: muestra N días laborables como celdas en grilla Mon–Fri */
function WorkCalendar({ days, color, delay = 0 }: { days: number; color: string; delay?: number }) {
  const cols = 5   // L M M J V
  const maxDays = Math.ceil(days / cols) * cols  // redondear a semana completa
  const weeks = Math.ceil(days / cols)
  const labels = ["L", "M", "M", "J", "V"]

  return (
    <div className="space-y-1.5">
      {/* header días */}
      <div className="grid grid-cols-5 gap-1">
        {labels.map(l => (
          <span key={l} className="text-center text-[9px] text-muted-foreground/50 uppercase">{l}</span>
        ))}
      </div>
      {/* grilla */}
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: weeks * cols }).map((_, i) => {
          const filled = i < days
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: delay + i * 0.03, duration: 0.2 }}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: filled ? color : "oklch(0.18 0.07 255)",
                border: filled ? "none" : "1px solid oklch(0.24 0.09 252)",
              }}
            />
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

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

        {/* ── Columna 2022 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Jersey */}
          <div className="w-40 h-40 mx-auto">
            <img src="./mundial/camiseta2022.png" />
          </div>

          {/* Precios */}
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-light text-primary">
              {formatARS(camiseta_2022)}
            </p>
            <p className="text-base text-muted-foreground">
              ≈ <span className="text-foreground font-medium">USD {Number(usd2022).toLocaleString("es-AR")}</span>
              <span className="text-xs ml-1 text-muted-foreground/60">al cambio 2022</span>
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
          {/* Jersey */}
          <div className="w-40 h-40 mx-auto">
            <img src="./mundial/camiseta2026.png" style={{ transform: "rotateY(180deg)" }} />
          </div>

          {/* Precios */}
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-light text-primary">
              {formatARS(camiseta_2026)}
            </p>
            <p className="text-base text-muted-foreground">
              ≈ <span className="text-foreground font-medium">USD {Number(usd2026).toLocaleString("es-AR")}</span>
              <span className="text-xs ml-1 text-muted-foreground/60">al cambio 2026</span>
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
