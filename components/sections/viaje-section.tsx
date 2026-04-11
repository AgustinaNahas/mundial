"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

const WorldMap = dynamic(() => import("@/components/world-map").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-2xl bg-muted/30 animate-pulse" />,
})

export function ViajeSection() {
  const { getIndicador, loading } = useData()

  const vuelo2022Item = getIndicador("BSAS_DOHA")
  const vuelo2026Item = getIndicador("BSAS_MIAMI")
  const salarioItem = getIndicador("SUELDO_MIN_PESOS")

  const vuelo_2022 = vuelo2022Item?.valor_2022 ?? 374124
  const vuelo_2026 = vuelo2026Item?.valor_2026 ?? 2860000

  const salario_2022 = salarioItem?.valor_2022 ?? 61953
  const salario_2026 = salarioItem?.valor_2026 ?? 346800

  const salarios2022 = Math.round((vuelo_2022 / salario_2022) * 10) / 10
  const salarios2026 = Math.round((vuelo_2026 / salario_2026) * 10) / 10

  if (loading) return null

  return (
    <SectionWrapper
      number="05"
      title="El Viaje al Mundial"
      intro={`Costear los vuelos ida y vuelta en 2022 requería ${salarios2022} salarios mínimos. Para 2026, la cifra asciende a ${salarios2026}.`}
    >
      <div className="mt-12 mb-8">
        <WorldMap />
      </div>

      <div className="flex gap-6 justify-center mb-12 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block w-6 border-t-2 border-dashed border-[#4eaadc]" />
          BS AS → Doha (Qatar 2022)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-6 border-t-2 border-dashed border-[#e8e8f0]" />
          BS AS → Miami (EEUU 2026)
        </span>
      </div>

      <div className="mt-12 mb-16">
        <ComparisonBar
          label="Precio del vuelo (ARS)"
          value2022={vuelo_2022}
          value2026={vuelo_2026}
          unit="ARS"
          delay={0}
        />
      </div>

      <div className="mt-12 bg-secondary/10 rounded-2xl p-8 border border-border/10">
        <h4 className="text-lg font-medium text-foreground mb-8 text-center">
          ¿Cuántos salarios mínimos para volar?
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">Qatar 2022</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.ceil(salarios2022) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center text-primary font-bold text-xs"
                >
                  {i + 1 <= salarios2022 ? i + 1 : "½"}
                </motion.div>
              ))}
            </div>
            <p className="text-3xl font-bold text-primary text-center pt-2">
              {salarios2022} <span className="text-sm font-normal text-muted-foreground">sueldos</span>
            </p>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/10 pt-8 md:pt-0 md:pl-8">
            <p className="text-sm text-muted-foreground text-center mb-4">EEUU 2026</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.ceil(salarios2026) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center text-accent font-bold text-xs"
                >
                  {i + 1 <= salarios2026 ? i + 1 : "½"}
                </motion.div>
              ))}
            </div>
            <p className="text-3xl font-bold text-accent text-center pt-2">
              {salarios2026} <span className="text-sm font-normal text-muted-foreground">sueldos</span>
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
