"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { PurchasingPowerPictogram } from "@/components/purchasing-power-pictogram"
import { useData } from "@/lib/data-context"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.mate

export function MateSection() {
  const { getIndicador, loading } = useData()

  const yerba = getIndicador("KILO_YERBA")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const yerba_2022 = yerba?.valor_2022 ?? 650
  const yerba_2026 = yerba?.valor_2026 ?? 4500
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718

  const kilos2022 = Math.floor(salario_2022 / yerba_2022)
  const kilos2026 = Math.floor(salario_2026 / yerba_2026)

  if (loading) {
    return (
      <SectionWrapper
        number={copy.number}
        title={copy.title}
        intro={LOADING_INTRO}
        bgColor="muted"
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
      sources={[yerba, salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <ComparisonBar
            label="Kilo de yerba mate"
            value2022={yerba_2022}
            value2026={yerba_2026}
            unit={yerba?.unidad}
            delay={0}
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="p-6 bg-card rounded-lg border border-border"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Kilos de yerba que compra un salario minimo
            </p>
            <div className="flex items-baseline gap-8">
              <div>
                <p className="text-3xl font-light text-accent">{kilos2022}</p>
                <p className="text-xs text-muted-foreground">kilos en 2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-3xl font-light text-primary">{kilos2026}</p>
                <p className="text-xs text-muted-foreground">kilos en 2026</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center md:justify-end"
        >
          <PurchasingPowerPictogram
            count2022={kilos2022}
            count2026={kilos2026}
            title="Kilos de yerba con un salario mínimo"
            unitLabel="kilos"
            emoji="🧉"
            methodologyNote="El precio corresponde a la mediana de todas las marcas de yerba mate disponibles en el mercado, incluyendo primeras y segundas marcas."
          />
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
