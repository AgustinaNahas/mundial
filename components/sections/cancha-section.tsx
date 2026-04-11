"use client"

import dynamic from "next/dynamic"
import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { SourcesPanel } from "@/components/sources-panel"

const ScrollyMap = dynamic(
  () => import("@/components/scrolly-map").then(m => m.ScrollyMapInner),
  {
    ssr: false,
    loading: () => <div className="w-full h-full rounded-2xl bg-[#080e1c] animate-pulse" />,
  }
)

/* ─── Helpers de formato ─── */
function fmtHours(h: number) {
  if (h < 1)   return `${Math.round(h * 60)} min`
  if (h < 100) return `${h.toFixed(1)} h`
  return `${Math.round(h)} h`
}
function fmtSueldos(n: number) {
  return n < 10 ? n.toFixed(1) : Math.round(n).toString()
}

/* ─── Bloque vuelo (paso 1 y 3) ─── */
function FlightBlock({
  priceArs, sueldos, year, color, unit,
}: {
  priceArs: number; sueldos: number; year: string; color: string; unit?: string
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-3">
      <p className="text-sm text-muted-foreground">✈️ Vuelo ida y vuelta</p>
      <p className="text-3xl font-bold font-mono" style={{ color }}>
        {formatCurrency(priceArs, unit ?? "ARS")}
      </p>
      <div className="pt-2 border-t border-border/15">
        <p className="text-sm text-muted-foreground">
          Equivale a{" "}
          <span className="font-semibold text-foreground">{fmtSueldos(sueldos)} sueldos mínimos</span>{" "}
          de {year}
        </p>
      </div>
    </div>
  )
}

/* ─── Bloque entrada mundial (paso 2 y 4) ─── */
function TicketBlock({
  label, badge, usd, ars, hours, color,
}: {
  label: string; badge: string; usd: number; ars: number; hours: number; color: string
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {badge}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold font-mono" style={{ color }}>
          ${usd.toLocaleString("es-AR")}
        </p>
        <span className="text-sm text-muted-foreground">USD</span>
      </div>
      <p className="text-sm text-muted-foreground">{formatCurrency(ars, "ARS")} al cambio oficial</p>
      <div className="pt-2 border-t border-border/15">
        <p className="text-sm text-muted-foreground">
          ⏱ <span className="font-semibold text-foreground">{fmtHours(hours)}</span> de trabajo al salario mínimo
        </p>
      </div>
    </div>
  )
}

/* ─── Dots indicadores de paso ─── */
function StepDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === active ? 20 : 6, opacity: i === active ? 1 : 0.35 }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full bg-primary"
        />
      ))}
    </div>
  )
}

/* ─── Wrapper de paso con fade-in al entrar en viewport ─── */
function StepPanel({ children, stepRef }: { children: React.ReactNode; stepRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={stepRef} className="min-h-screen flex items-center py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="space-y-5 w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ─── Sección principal ─── */
export function CanchaSection() {
  const { getIndicador, loading } = useData()

  const entradaPrimera = getIndicador("ENTRADA_PRIMERA")
  const entradaBarata  = getIndicador("ENTRADA_MUNDIAL_MAS_BARATA")
  const entradaCara    = getIndicador("ENTRADA_MUNDIAL_MAS_CARA")
  const salario        = getIndicador("SUELDO_MIN_PESOS")
  const dolar          = getIndicador("VALOR_DOLAR_PESO")
  const vueloDohaItem  = getIndicador("BSAS_DOHA")
  const vueloMiamiItem = getIndicador("BSAS_MIAMI")

  const [activeStep, setActiveStep] = useState(0)
  const ref0 = useRef<HTMLDivElement>(null)
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const ref3 = useRef<HTMLDivElement>(null)
  const ref4 = useRef<HTMLDivElement>(null)
  const refs = [ref0, ref1, ref2, ref3, ref4]

  // loading como dep: el efecto corre de nuevo cuando el DOM ya está montado (loading → false)
  useEffect(() => {
    if (loading) return
    const observers = refs.map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i) },
        { threshold: 0.35 }
      )
      if (ref.current) obs.observe(ref.current)
      return obs
    })
    return () => observers.forEach(o => o.disconnect())
  // refs contiene objetos estables (useRef), loading es la única dep que cambia
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  if (loading) return null

  /* ── Cálculos ── */
  const sal_2022   = salario?.valor_2022  ?? 61953
  const sal_2026   = salario?.valor_2026  ?? 346800
  const dolar_2022 = dolar?.valor_2022    ?? 266
  const dolar_2026 = dolar?.valor_2026    ?? 1430

  const hora_2022 = sal_2022 / 240
  const hora_2026 = sal_2026 / 240

  // Paso 0 — Primera división
  const primera_2022       = entradaPrimera?.valor_2022 ?? 1360
  const primera_2026       = entradaPrimera?.valor_2026 ?? 30000
  const horas_primera_2022 = primera_2022 / hora_2022
  const horas_primera_2026 = primera_2026 / hora_2026

  // Paso 1 — Vuelo a Doha
  const vuelo_doha  = vueloDohaItem?.valor_2022  ?? 374124
  const sueldos_doha = vuelo_doha / sal_2022

  // Paso 2 — Entradas Qatar 2022
  const barata_qatar     = entradaBarata?.valor_2022 ?? 0
  const cara_qatar       = entradaCara?.valor_2022   ?? 0
  const barata_qatar_ars = barata_qatar * dolar_2022
  const cara_qatar_ars   = cara_qatar   * dolar_2022
  const horas_barata_qatar = barata_qatar_ars / hora_2022
  const horas_cara_qatar   = cara_qatar_ars   / hora_2022

  // Paso 3 — Vuelo a Miami
  const vuelo_miami   = vueloMiamiItem?.valor_2026 ?? 2860000
  const sueldos_miami = vuelo_miami / sal_2026

  // Paso 4 — Entradas Miami 2026
  const barata_miami     = entradaBarata?.valor_2026 ?? 0
  const cara_miami       = entradaCara?.valor_2026   ?? 0
  const barata_miami_ars = barata_miami * dolar_2026
  const cara_miami_ars   = cara_miami   * dolar_2026
  const horas_barata_miami = barata_miami_ars / hora_2026
  const horas_cara_miami   = cara_miami_ars   / hora_2026

  const COLOR_QATAR = "oklch(0.65 0.18 222)"
  const COLOR_MIAMI = "oklch(0.78 0.12 210)"

  return (
    <section className="py-20 md:py-28 bg-background">
      {/* ── Header ── */}
      <div className="container mx-auto px-6 md:px-12 max-w-5xl mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent text-sm font-medium tracking-wide">04</span>
          <h3 className="text-2xl md:text-4xl font-light text-foreground mt-2 tracking-tight text-balance">
            El precio de la cancha
          </h3>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            De los estadios de primera a los estadios del mundo. ¿Cuánto cuesta ir a ver a la Selección?
          </p>
        </motion.div>
      </div>

      {/* ── Scrolly ── */}
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Mapa sticky */}
          <div className="h-60 lg:sticky lg:top-0 lg:h-screen lg:py-6">
            <div className="relative h-full rounded-2xl overflow-hidden">
              <ScrollyMap step={activeStep} />
              <div className="absolute bottom-4 left-4 z-500">
                <StepDots active={activeStep} total={5} />
              </div>
            </div>
          </div>

          {/* Pasos */}
          <div>

            {/* ── Paso 0: Buenos Aires ── */}
            <StepPanel stepRef={refs[0]}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇦🇷</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 01</p>
                  <h4 className="text-xl font-semibold text-foreground">Buenos Aires</h4>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Antes de volar, la cancha de casa. Una entrada de primera división en pesos.
              </p>

              <div className="rounded-2xl bg-card border border-border/30 p-5">
                <p className="text-sm text-muted-foreground mb-4">🏟 Entrada · Primera División</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Qatar 2022</p>
                    <p className="text-2xl font-bold font-mono" style={{ color: COLOR_QATAR }}>
                      {formatCurrency(primera_2022, "ARS")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{fmtHours(horas_primera_2022)} de trabajo</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">EEUU 2026</p>
                    <p className="text-2xl font-bold font-mono" style={{ color: COLOR_MIAMI }}>
                      {formatCurrency(primera_2026, "ARS")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{fmtHours(horas_primera_2026)} de trabajo</p>
                  </div>
                </div>
              </div>
            </StepPanel>

            {/* ── Paso 1: Vuelo a Doha ── */}
            <StepPanel stepRef={refs[1]}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇶🇦</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 02</p>
                  <h4 className="text-xl font-semibold text-foreground">El viaje a Qatar</h4>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Para llegar al Mundial 2022, primero había que cruzar el Atlántico. El precio del vuelo ida y vuelta Buenos Aires — Doha al momento del torneo.
              </p>

              <FlightBlock
                priceArs={vuelo_doha}
                sueldos={sueldos_doha}
                year="2022"
                color={COLOR_QATAR}
              />
            </StepPanel>

            {/* ── Paso 2: Entradas Qatar ── */}
            <StepPanel stepRef={refs[2]}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏟</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 03</p>
                  <h4 className="text-xl font-semibold text-foreground">Las entradas en Qatar</h4>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Ya en Doha, el precio de la entrada. En dólares, al cambio oficial de noviembre 2022.
              </p>

              <TicketBlock
                label="Entrada más barata"
                badge="Fase de grupos · Cat. 4"
                usd={barata_qatar}
                ars={barata_qatar_ars}
                hours={horas_barata_qatar}
                color={COLOR_QATAR}
              />
              <TicketBlock
                label="Entrada más cara"
                badge="Final · Cat. 1"
                usd={cara_qatar}
                ars={cara_qatar_ars}
                hours={horas_cara_qatar}
                color={COLOR_QATAR}
              />
            </StepPanel>

            {/* ── Paso 3: Vuelo a Miami ── */}
            <StepPanel stepRef={refs[3]}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇺🇸</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 04</p>
                  <h4 className="text-xl font-semibold text-foreground">El viaje a Miami</h4>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Para 2026, el vuelo es más corto pero el peso llegó más devaluado. Ida y vuelta Buenos Aires — Miami.
              </p>

              <FlightBlock
                priceArs={vuelo_miami}
                sueldos={sueldos_miami}
                year="2026"
                color={COLOR_MIAMI}
              />
            </StepPanel>

            {/* ── Paso 4: Entradas Miami ── */}
            <StepPanel stepRef={refs[4]}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏟</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Paso 05</p>
                  <h4 className="text-xl font-semibold text-foreground">Las entradas en Miami</h4>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Ya en Miami, el precio de la entrada. En dólares, al cambio oficial de 2026.
              </p>

              <TicketBlock
                label="Entrada más barata"
                badge="Fase de grupos · Cat. 4"
                usd={barata_miami}
                ars={barata_miami_ars}
                hours={horas_barata_miami}
                color={COLOR_MIAMI}
              />
              <TicketBlock
                label="Entrada más cara"
                badge="Final · Cat. 1"
                usd={cara_miami}
                ars={cara_miami_ars}
                hours={horas_cara_miami}
                color={COLOR_MIAMI}
              />
            </StepPanel>

          </div>
        </div>
      </div>

      {/* ── Fuentes ── */}
      <div className="container mx-auto px-6 md:px-12 max-w-5xl mt-12">
        <SourcesPanel
          items={[entradaPrimera, entradaBarata, entradaCara, vueloDohaItem, vueloMiamiItem, salario, dolar]
            .filter(Boolean) as any}
        />
      </div>
    </section>
  )
}
