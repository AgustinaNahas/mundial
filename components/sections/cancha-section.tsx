"use client"

import dynamic from "next/dynamic"
import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { SourcesPanel } from "@/components/sources-panel"
import { InfoIconButton } from "@/components/ui/info-icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LazySectionSkeleton } from "@/components/lazy-mount"
import { loadCountriesGeo } from "@/lib/countries-geo"
import { debugLog } from "@/lib/debug-log"

const ScrollyMap = dynamic(
  () => import("@/components/scrolly-map").then((m) => m.ScrollyMapInner),
  {
    ssr: false,
    loading: () => <div className="w-full h-full rounded-2xl bg-[#080e1c] animate-pulse" />,
  },
)

/** Ajustes de animación solo en mobile (max-width: 1023px). Estado inicial false para SSR. */
function useIsNarrowForCancha() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return narrow
}

const STEP_INTRO =
  "text-muted-foreground leading-relaxed max-lg:text-[13px] max-lg:leading-snug max-lg:text-muted-foreground/95"

/* ─── Helpers de formato ─── */
function fmtHours(h: number) {
  if (h < 1)   return `${Math.round(h * 60)} min`
  if (h < 100) return `${h.toFixed(1)} h`
  return `${Math.round(h)} h`
}
function fmtSueldos(n: number) {
  return n < 10 ? n.toFixed(1) : Math.round(n).toString()
}

function fmtWorkUnit(totalArs: number, salarioMensual: number) {
  const valorHora = salarioMensual / 176
  const horas = totalArs / valorHora
  if (horas > 176) {
    const meses = horas / 176
    return `${meses.toFixed(1)} meses de trabajo`
  }
  if (horas > 24) {
    const dias = horas / 8
    return `${dias.toFixed(1)} dias de trabajo`
  }
  return `${Math.round(horas)} hs de trabajo`
}

/* ─── Bloque vuelo (paso 1 y 3) ─── */
function FlightBlock({
  priceArs, sueldos, year, color, unit,
}: {
  priceArs: number; sueldos: number; year: string; color: string; unit?: string
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-3 max-lg:rounded-xl max-lg:p-3 max-lg:space-y-2">
      <p className="text-sm max-lg:text-[11px] text-muted-foreground">✈️ Vuelo ida y vuelta</p>
      <p className="text-3xl max-lg:text-xl font-bold font-mono leading-tight" style={{ color }}>
        {formatCurrency(priceArs, unit ?? "ARS")}
      </p>
      <div className="pt-2 border-t border-border/15 max-lg:pt-1.5">
        <p className="text-sm max-lg:text-[10px] max-lg:leading-snug text-muted-foreground">
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
    <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-3 max-lg:rounded-xl max-lg:p-3 max-lg:space-y-2">
      <div className="flex items-start justify-between gap-2 max-lg:items-center max-lg:gap-1.5">
        <p className="text-sm max-lg:text-xs max-lg:leading-tight font-medium text-foreground shrink min-w-0">
          {label}
        </p>
        <span className="text-[10px] max-lg:text-[8px] max-lg:leading-tight uppercase tracking-wider text-muted-foreground bg-muted px-2 max-lg:px-1.5 py-0.5 rounded-full shrink-0 max-lg:max-w-[58%] max-lg:text-right">
          {badge}
        </span>
      </div>
      <div className="flex items-baseline gap-2 max-lg:gap-1.5">
        <p className="text-3xl max-lg:text-lg font-bold font-mono tabular-nums leading-none" style={{ color }}>
          ${usd.toLocaleString("es-AR")}
        </p>
        <span className="text-sm max-lg:text-[10px] text-muted-foreground">USD</span>
      </div>
      <p className="text-sm max-lg:hidden text-muted-foreground">{formatCurrency(ars, "ARS")} al cambio oficial</p>
      <div className="pt-2 border-t border-border/15 max-lg:hidden">
        <p className="text-sm text-muted-foreground">
          ⏱ <span className="font-semibold text-foreground">{fmtHours(hours)}</span> de trabajo al salario mínimo
        </p>
      </div>
      <p className="hidden max-lg:block text-[10px] leading-snug text-muted-foreground">
        {formatCurrency(ars, "ARS")} oficial · ⏱ <span className="font-medium text-foreground">{fmtHours(hours)}</span> al mínimo
      </p>
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

function AccumulatorColumn({
  label,
  total,
  detail,
  color,
  items,
}: {
  label: string
  total: number
  detail: string
  color: string
  items: Array<{ id: string; label: string; value: number }>
}) {
  return (
    <div className="rounded-lg border border-border/25 bg-card/70 backdrop-blur px-3 py-2">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-2 pt-2 border-t border-border/20">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Precio acumulado</p>
            <p className="text-base md:text-lg font-bold font-mono leading-tight" style={{ color }}>
              {formatCurrency(total, "ARS")}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{detail}</p>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 text-[10px]">
            <span className="text-muted-foreground truncate">{item.label}</span>
            <span className="font-mono text-foreground">{formatCurrency(item.value, "ARS")}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MobileAccumulatorBar({
  qatarTotal,
  usaTotal,
  qatarDetail,
  usaDetail,
  colorQatar,
  colorUsa,
  qatarItems,
  usaItems,
}: {
  qatarTotal: number
  usaTotal: number
  qatarDetail: string
  usaDetail: string
  colorQatar: string
  colorUsa: string
  qatarItems: Array<{ id: string; label: string; value: number }>
  usaItems: Array<{ id: string; label: string; value: number }>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border/35 bg-background/92 backdrop-blur-md shadow-sm">
      <div className="flex items-stretch gap-1">
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2 px-3 py-2.5 text-[11px] leading-tight">
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Qatar</span>
            <span className="font-mono text-sm font-bold tabular-nums truncate" style={{ color: colorQatar }}>
              {formatCurrency(qatarTotal, "ARS")}
            </span>
          </div>
          <span className="shrink-0 text-muted-foreground/40 font-light px-0.5" aria-hidden>
            //
          </span>
          <div className="min-w-0 flex flex-col gap-0.5 text-right">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">EEUU</span>
            <span className="font-mono text-sm font-bold tabular-nums truncate" style={{ color: colorUsa }}>
              {formatCurrency(usaTotal, "ARS")}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Ocultar desglose del acumulado" : "Ver desglose del acumulado"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 flex items-center justify-center px-2.5 border-l border-border/25 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div className="border-t border-border/20 px-3 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 space-y-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Qatar</p>
              {qatarItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-x-1 gap-y-0.5 text-[10px]">
                  <span className="text-muted-foreground leading-snug line-clamp-2">{item.label}</span>
                  <span className="font-mono text-foreground text-right shrink-0">{formatCurrency(item.value, "ARS")}</span>
                </div>
              ))}
              <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/15">{qatarDetail}</p>
            </div>
            <div className="min-w-0 space-y-1.5 border-l border-border/15 pl-3">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">EEUU</p>
              {usaItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-x-1 gap-y-0.5 text-[10px]">
                  <span className="text-muted-foreground leading-snug line-clamp-2">{item.label}</span>
                  <span className="font-mono text-foreground text-right shrink-0">{formatCurrency(item.value, "ARS")}</span>
                </div>
              ))}
              <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/15">{usaDetail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Wrapper de paso con fade-in al entrar en viewport ─── */
function StepPanel({ children, stepRef }: { children: React.ReactNode; stepRef: React.RefObject<HTMLDivElement | null> }) {
  const narrow = useIsNarrowForCancha()
  return (
    <div
      ref={stepRef}
      className="min-h-screen max-lg:min-h-[135svh] flex items-center py-16 lg:py-24 max-lg:py-28 max-lg:pb-36 max-lg:relative max-lg:z-[15] max-lg:pt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: narrow ? "-18% 0px -32% 0px" : "-100px" }}
        transition={{ duration: 0.5, delay: narrow ? 0.5 : 0 }}
        className="space-y-5 w-full max-lg:space-y-3 max-lg:rounded-2xl max-lg:border max-lg:border-border/25 max-lg:bg-background/78 max-lg:backdrop-blur-md max-lg:px-3 max-lg:py-4 max-lg:shadow-sm"
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

  // Precargar chunk del mapa en cuanto monta la sección (no esperar al render de ScrollyMap)
  useEffect(() => {
    const t0 = Date.now()
    void import("@/components/scrolly-map")
      .then(() => {
        // #region agent log
        debugLog(
          "cancha-section.tsx",
          "scrolly-map chunk preloaded",
          { ms: Date.now() - t0 },
          "H7",
          "post-fix-v3",
        )
        // #endregion
      })
      .catch((err) => {
        // #region agent log
        debugLog(
          "cancha-section.tsx",
          "scrolly-map chunk preload failed",
          { err: String(err) },
          "H7",
          "post-fix-v3",
        )
        // #endregion
      })
  }, [])

  useEffect(() => {
    const t0 = Date.now()
    void loadCountriesGeo({ detail: "lite" })
      .then(() => {
        // #region agent log
        debugLog(
          "cancha-section.tsx",
          "geo preload ok",
          { ms: Date.now() - t0 },
          "H7",
        )
        // #endregion
      })
      .catch((err) => {
        // #region agent log
        debugLog(
          "cancha-section.tsx",
          "geo preload failed",
          { err: String(err), ms: Date.now() - t0 },
          "H7",
        )
        // #endregion
      })
  }, [])

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

  useEffect(() => {
    if (loading) return
    // #region agent log
    debugLog(
      "cancha-section.tsx",
      "cancha section rendered",
      { activeStep },
      "H7",
      "post-fix-v2",
    )
    // #endregion
  }, [loading, activeStep])

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 md:px-12 max-w-6xl"
        >
          <LazySectionSkeleton className="min-h-[min(70vh,40rem)]" />
        </motion.div>
      </section>
    )
  }

  /* ── Cálculos ── */
  const sal_2022   = salario?.valor_2022  ?? 61953
  const sal_2026   = salario?.valor_2026  ?? 346800
  const dolar_2022 = dolar?.valor_2022    ?? 266
  const dolar_2026 = dolar?.valor_2026    ?? 1430

  const hora_2022 = sal_2022 / 176
  const hora_2026 = sal_2026 / 176

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

  const COLOR_QATAR = "oklch(0.97 0.01 220)"
  const COLOR_MIAMI = "oklch(0.65 0.18 222)"

  const qatarTotal =
    primera_2022 +
    (activeStep >= 1 ? vuelo_doha : 0) +
    (activeStep >= 2 ? barata_qatar_ars : 0)

  const usaTotal =
    primera_2026 +
    (activeStep >= 3 ? vuelo_miami : 0) +
    (activeStep >= 4 ? barata_miami_ars : 0)

  const qatarDetail = fmtWorkUnit(qatarTotal, sal_2022)
  const usaDetail = fmtWorkUnit(usaTotal, sal_2026)
  const qatarItems = [
    { id: "qatar-primera", label: "Entrada Primera División", value: primera_2022 },
    ...(activeStep >= 1 ? [{ id: "qatar-vuelo", label: "Vuelo BS AS - Doha", value: vuelo_doha }] : []),
    ...(activeStep >= 2 ? [{ id: "qatar-entrada", label: "Entrada Mundial (más barata)", value: barata_qatar_ars }] : []),
  ]
  const usaItems = [
    { id: "usa-primera", label: "Entrada Primera División", value: primera_2026 },
    ...(activeStep >= 3 ? [{ id: "usa-vuelo", label: "Vuelo BS AS - Miami", value: vuelo_miami }] : []),
    ...(activeStep >= 4 ? [{ id: "usa-entrada", label: "Entrada Mundial (más barata)", value: barata_miami_ars }] : []),
  ]

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
        <div className="hidden lg:block lg:sticky lg:top-3 z-[700] mb-5">
          <div className="relative rounded-xl border border-border/30 bg-background/65 backdrop-blur px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Acumulado</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIconButton size="sm" label="Información del acumulado" />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8} className="max-w-xs leading-relaxed text-balance">
                  Acumulado del paso actual (entrada mundial calculada con la categoría más barata).
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AccumulatorColumn label="Qatar" total={qatarTotal} detail={qatarDetail} color={COLOR_QATAR} items={qatarItems} />
              <AccumulatorColumn label="EEUU" total={usaTotal} detail={usaDetail} color={COLOR_MIAMI} items={usaItems} />
            </div>
          </div>
        </div>

        {/* Barra acumulado mobile: sticky fuera del grid para que el mapa arranque debajo de ella */}
        <div className="sticky top-0 z-[30] pt-2 pb-1 bg-background lg:hidden">
          <MobileAccumulatorBar
            qatarTotal={qatarTotal}
            usaTotal={usaTotal}
            qatarDetail={qatarDetail}
            usaDetail={usaDetail}
            colorQatar={COLOR_QATAR}
            colorUsa={COLOR_MIAMI}
            qatarItems={qatarItems}
            usaItems={usaItems}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-start">

          {/* Mapa: mobile 100svh arrancando debajo de la barra (~60px); desktop h-screen */}
          <div className="sticky max-lg:top-[60px] top-0 z-[8] max-lg:h-[calc(100svh-60px)] max-lg:-mb-[calc(100svh-60px)] max-lg:shrink-0 h-60 lg:z-auto lg:mb-0 lg:h-screen lg:py-6">
            <div className="relative h-full rounded-2xl overflow-hidden">
              <ScrollyMap step={activeStep} />
              <div className="absolute bottom-4 left-4 z-500">
                <StepDots active={activeStep} total={5} />
              </div>
            </div>
          </div>

          {/* Pasos */}
          <div className="relative z-[12] max-lg:px-0 max-lg:pb-[50svh]">

            {/* ── Paso 0: Buenos Aires ── */}
            <StepPanel stepRef={refs[0]}>
              <div className="flex items-center gap-3 max-lg:gap-2">
                <span className="text-3xl max-lg:text-2xl leading-none">🇦🇷</span>
                <div>
                  <p className="text-[11px] max-lg:text-[10px] uppercase tracking-widest text-muted-foreground">Paso 01</p>
                  <h4 className="text-xl max-lg:text-lg font-semibold text-foreground">Buenos Aires</h4>
                </div>
              </div>

              <p className={STEP_INTRO}>
                Antes de volar, la cancha de casa. Una entrada de primera división en pesos.
              </p>

              <div className="rounded-2xl bg-card border border-border/30 p-5 max-lg:p-3.5 max-lg:rounded-xl">
                <p className="text-sm max-lg:text-[11px] text-muted-foreground mb-4 max-lg:mb-2">🏟 Entrada · Primera División</p>
                <div className="grid grid-cols-2 gap-4 max-lg:gap-3">
                  <div>
                    <p className="text-[11px] max-lg:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Qatar 2022</p>
                    <p className="text-2xl max-lg:text-lg font-bold font-mono leading-tight" style={{ color: COLOR_QATAR }}>
                      {formatCurrency(primera_2022, "ARS")}
                    </p>
                    <p className="text-xs max-lg:text-[10px] text-muted-foreground mt-1 max-lg:mt-0.5">{fmtHours(horas_primera_2022)} de trabajo</p>
                  </div>
                  <div>
                    <p className="text-[11px] max-lg:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">EEUU 2026</p>
                    <p className="text-2xl max-lg:text-lg font-bold font-mono leading-tight" style={{ color: COLOR_MIAMI }}>
                      {formatCurrency(primera_2026, "ARS")}
                    </p>
                    <p className="text-xs max-lg:text-[10px] text-muted-foreground mt-1 max-lg:mt-0.5">{fmtHours(horas_primera_2026)} de trabajo</p>
                  </div>
                </div>
              </div>
            </StepPanel>

            {/* ── Paso 1: Vuelo a Doha ── */}
            <StepPanel stepRef={refs[1]}>
              <div className="flex items-center gap-3 max-lg:gap-2">
                <span className="text-3xl max-lg:text-2xl leading-none">🇶🇦</span>
                <div>
                  <p className="text-[11px] max-lg:text-[10px] uppercase tracking-widest text-muted-foreground">Paso 02</p>
                  <h4 className="text-xl max-lg:text-lg font-semibold text-foreground">El viaje a Qatar</h4>
                </div>
              </div>

              <p className={STEP_INTRO}>
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
              <div className="flex items-center gap-3 max-lg:gap-2">
                <span className="text-3xl max-lg:text-2xl leading-none">🏟</span>
                <div>
                  <p className="text-[11px] max-lg:text-[10px] uppercase tracking-widest text-muted-foreground">Paso 03</p>
                  <h4 className="text-xl max-lg:text-lg font-semibold text-foreground">Las entradas en Qatar</h4>
                </div>
              </div>

              <p className={STEP_INTRO}>
                Ya en Doha, el precio de la entrada. En dólares, al cambio oficial de noviembre 2022.
              </p>

              <div className="flex flex-col gap-5 max-lg:gap-2">
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
              </div>
            </StepPanel>

            {/* ── Paso 3: Vuelo a Miami ── */}
            <StepPanel stepRef={refs[3]}>
              <div className="flex items-center gap-3 max-lg:gap-2">
                <span className="text-3xl max-lg:text-2xl leading-none">🇺🇸</span>
                <div>
                  <p className="text-[11px] max-lg:text-[10px] uppercase tracking-widest text-muted-foreground">Paso 04</p>
                  <h4 className="text-xl max-lg:text-lg font-semibold text-foreground">El viaje a Miami</h4>
                </div>
              </div>

              <p className={STEP_INTRO}>
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
              <div className="flex items-center gap-3 max-lg:gap-2">
                <span className="text-3xl max-lg:text-2xl leading-none">🏟</span>
                <div>
                  <p className="text-[11px] max-lg:text-[10px] uppercase tracking-widest text-muted-foreground">Paso 05</p>
                  <h4 className="text-xl max-lg:text-lg font-semibold text-foreground">Las entradas en Miami</h4>
                </div>
              </div>

              <p className={STEP_INTRO}>
                Ya en Miami, el precio de la entrada. En dólares, al cambio oficial de 2026.
              </p>

              <div className="flex flex-col gap-5 max-lg:gap-2">
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
              </div>
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
