"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { ComparisonBar } from "@/components/comparison-bar"
import { SourcesPanel } from "@/components/sources-panel"
import { SectionLazySkeleton } from "@/components/section-skeletons"
import { type DataItem, useData } from "@/lib/data-context"
import { RESUMEN_COPY, SPREADSHEET_URL } from "@/lib/site-copy"

const KILOS_POR_ASADO = 5

function fmtUnits(value: number, decimals = 0) {
  const n = decimals > 0 ? Math.round(value * 10) / 10 : Math.round(value)
  return n.toLocaleString("es-AR", { maximumFractionDigits: decimals })
}

type PowerRow = {
  key: string
  label: string
  units2022: number
  units2026: number
  unitSuffix: string
  decimals?: number
  delay: number
}

export function ResumenSection() {
  const { getIndicador, loading } = useData()
  const { title, intro, closing, spreadsheetLabel, methodologyNote } = RESUMEN_COPY

  const salario = getIndicador("SUELDO_MIN_PESOS")
  const asado = getIndicador("ASADO_FINAL")
  const boleto = getIndicador("BOLETO_AMBA")
  const alquiler = getIndicador("ALQUILER_FESTEJO")
  const leche = getIndicador("LITRO_LECHE")

  const salario2022 = salario?.valor_2022 ?? 0
  const salario2026 = salario?.valor_2026 ?? 0

  const rows: PowerRow[] = [
    {
      key: "asado",
      label: "Asados con un salario mínimo (5 kg c/u)",
      units2022:
        salario2022 > 0 && asado?.valor_2022
          ? Math.floor(salario2022 / (asado.valor_2022 * KILOS_POR_ASADO))
          : 0,
      units2026:
        salario2026 > 0 && asado?.valor_2026
          ? Math.floor(salario2026 / (asado.valor_2026 * KILOS_POR_ASADO))
          : 0,
      unitSuffix: "asados",
      delay: 0,
    },
    {
      key: "colectivo",
      label: "Viajes en colectivo por día con un salario mínimo",
      units2022:
        salario2022 > 0 && boleto?.valor_2022
          ? Math.floor(salario2022 / 30 / boleto.valor_2022)
          : 0,
      units2026:
        salario2026 > 0 && boleto?.valor_2026
          ? Math.floor(salario2026 / 30 / boleto.valor_2026)
          : 0,
      unitSuffix: "viajes/día",
      delay: 0.08,
    },
    {
      key: "alquiler",
      label: "Meses de alquiler monoambiente con un salario mínimo",
      units2022:
        salario2022 > 0 && alquiler?.valor_2022 ? salario2022 / alquiler.valor_2022 : 0,
      units2026:
        salario2026 > 0 && alquiler?.valor_2026 ? salario2026 / alquiler.valor_2026 : 0,
      unitSuffix: "meses",
      decimals: 2,
      delay: 0.16,
    },
    {
      key: "leche",
      label: "Litros de leche con un salario mínimo",
      units2022:
        salario2022 > 0 && leche?.valor_2022 ? Math.floor(salario2022 / leche.valor_2022) : 0,
      units2026:
        salario2026 > 0 && leche?.valor_2026 ? Math.floor(salario2026 / leche.valor_2026) : 0,
      unitSuffix: "litros",
      delay: 0.24,
    },
  ]

  const sources = [salario, asado, boleto, alquiler, leche].filter(
    (item): item is DataItem => item != null,
  )

  if (loading) {
    return <SectionLazySkeleton sectionId="resumen" id="resumen" />
  }

  return (
    <section id="resumen" className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {title}
          </p>
          <p className="text-lg md:text-xl font-light text-foreground text-balance leading-relaxed">
            {intro}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-14 space-y-10"
        >
          <p className="text-sm text-muted-foreground text-center">
            {methodologyNote}
          </p>

          {rows.map((row) => (
            <ComparisonBar
              key={row.key}
              label={row.label}
              value2022={row.units2022}
              value2026={row.units2026}
              delay={row.delay}
              formatValue={(v) => `${fmtUnits(v, row.decimals ?? 0)} ${row.unitSuffix}`}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-14 text-center text-base md:text-lg font-light italic text-foreground/90 text-balance leading-snug"
        >
          {closing}
        </motion.p>

        {sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-12"
          >
            <SourcesPanel items={sources} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 md:mt-24 pt-14 md:pt-16 border-t border-border/50"
        >
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/80 px-8 py-7 text-center transition-colors hover:border-primary/30 hover:bg-card"
          >
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Datos abiertos
            </span>
            <span className="inline-flex items-center gap-2 text-sm md:text-base text-primary hover:text-primary/80 underline underline-offset-4">
              {spreadsheetLabel}
              <ExternalLink className="size-4 shrink-0" aria-hidden />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
