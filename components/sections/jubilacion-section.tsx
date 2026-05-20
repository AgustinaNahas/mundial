"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/utils"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.jubilacion
const BASE_PATH = "/mundial"
const KILOS_POR_ASADO = 5

function formatPctChange(pct: number) {
  const rounded = Math.round(pct)
  if (rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}

function YearPair({
  value2022,
  value2026,
  suffix = "",
}: {
  value2022: string | number
  value2026: string | number
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-center md:gap-4">
      <div className="text-center md:text-left">
        <p className="text-3xl font-light text-primary">
          {value2022}
          {suffix}
        </p>
        <p className="text-xs text-muted-foreground mt-1">2022</p>
      </div>
      <span className="hidden md:inline text-muted-foreground mb-1">→</span>
      <div className="text-center md:text-left">
        <p className="text-3xl font-light text-accent">
          {value2026}
          {suffix}
        </p>
        <p className="text-xs text-muted-foreground mt-1">2026</p>
      </div>
    </div>
  )
}

export function JubilacionSection() {
  const { getIndicador, loading } = useData()

  const jubilacion = getIndicador("JUBILACION_MIN_DOLARES")
  const dolar = getIndicador("VALOR_DOLAR_PESO")
  const alquiler = getIndicador("ALQUILER_FESTEJO")
  const asado = getIndicador("ASADO_FINAL")
  const album = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const boleto = getIndicador("BOLETO_AMBA")

  const jubilacion_2022 = jubilacion?.valor_2022 ?? 50124
  const jubilacion_2026 = jubilacion?.valor_2026 ?? 359254
  const dolar_2022 = dolar?.valor_2022 ?? 266.43
  const dolar_2026 = dolar?.valor_2026 ?? 1430

  const jubUsd2022 = jubilacion_2022 / dolar_2022
  const jubUsd2026 = jubilacion_2026 / dolar_2026
  const poderAdquisitivoPct = ((jubUsd2026 / jubUsd2022) - 1) * 100

  const alquiler_2022 = alquiler?.valor_2022 ?? 60000
  const alquiler_2026 = alquiler?.valor_2026 ?? 429953

  const asado_2022 = asado?.valor_2022 ?? 1220
  const asado_2026 = asado?.valor_2026 ?? 16019

  const album_2022 = album?.valor_2022 ?? 750
  const album_2026 = album?.valor_2026 ?? 12000

  const boleto_2022 = boleto?.valor_2022 ?? 25.2
  const boleto_2026 = boleto?.valor_2026 ?? 681

  const costoAsado2022 = asado_2022 * KILOS_POR_ASADO
  const costoAsado2026 = asado_2026 * KILOS_POR_ASADO

  const albumes2022 = (jubilacion_2022 / album_2022).toFixed(1)
  const albumes2026 = (jubilacion_2026 / album_2026).toFixed(1)

  const asados2022 = Math.floor(jubilacion_2022 / costoAsado2022)
  const asados2026 = Math.floor(jubilacion_2026 / costoAsado2026)

  const viajes2022 = Math.floor(jubilacion_2022 / boleto_2022)
  const viajes2026 = Math.floor(jubilacion_2026 / boleto_2026)

  const alquilerPorcentaje2022 = Math.round((alquiler_2022 / jubilacion_2022) * 100)
  const alquilerPorcentaje2026 = Math.round((alquiler_2026 / jubilacion_2026) * 100)

  if (loading) {
    return (
      <SectionWrapper
        number={copy.number}
        title={copy.title}
        intro={LOADING_INTRO}
        bgColor="muted"
        titleImage={{ src: `${BASE_PATH}/abuela.png`, alt: "Abuela festejando" }}
      >
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      bgColor="muted"
      sources={[jubilacion, dolar, alquiler, asado, album, boleto]}
      titleImage={{ src: `${BASE_PATH}/abuela.png`, alt: "Abuela festejando" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
          Jubilación mínima en dólares
        </p>
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-16">
          <div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-light text-primary"
            >
              {formatCurrency(Math.round(jubUsd2022), "USD")}
            </motion.p>
            <p className="text-muted-foreground mt-2">2022</p>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-12 h-0.5 bg-border md:block hidden"
          />

          <div className="flex flex-col items-center gap-2 py-2 md:py-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Cambio en poder adquisitivo
            </p>
            <p
              className={`text-2xl md:text-3xl font-medium tabular-nums ${
                poderAdquisitivoPct < 0 ? "text-destructive" : "text-accent"
              }`}
            >
              {formatPctChange(poderAdquisitivoPct)}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-[14rem] leading-snug">
              En dólares, al tipo de cambio de cada año
            </p>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-12 h-0.5 bg-border md:hidden"
          />

          <div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl md:text-7xl font-light text-accent"
            >
              {formatCurrency(Math.round(jubUsd2026), "USD")}
            </motion.p>
            <p className="text-muted-foreground mt-2">2026</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-12"
      >
        <h4 className="text-sm font-medium text-foreground mb-6 text-center">
          ¿Qué puede comprar una jubilación mínima?
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Álbumes oficiales
            </p>
            <YearPair value2022={albumes2022} value2026={albumes2026} />
            <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
              Cuántos álbumes del Mundial se compran con el haber mensual.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Asados de parrilla
            </p>
            <YearPair value2022={asados2022} value2026={asados2026} />
            <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
              Con {KILOS_POR_ASADO} kg de carne por asado, como en el resto del sitio.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Viajes en colectivo
            </p>
            <YearPair value2022={viajes2022.toLocaleString("es-AR")} value2026={viajes2026.toLocaleString("es-AR")} />
            <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
              Pasajes en AMBA si dedicara todo el mes al transporte ({formatCurrency(boleto_2022, boleto?.unidad)} → {formatCurrency(boleto_2026, boleto?.unidad)}).
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              % del alquiler monoamb
            </p>
            <YearPair value2022={`${alquilerPorcentaje2022}%`} value2026={`${alquilerPorcentaje2026}%`} />
            <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
              Cuota de un monoambiente en San Nicolás sobre la jubilación mínima.
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
