"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { PurchasingPowerPictogram } from "@/components/purchasing-power-pictogram"
import { useData } from "@/lib/data-context"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.asado

export function AsadoSection() {
  const { getIndicador, loading } = useData()

  const asado = getIndicador("ASADO_FINAL")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const asado_2022 = asado?.valor_2022 ?? 12000
  const asado_2026 = asado?.valor_2026 ?? 85000
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718

  const kilosPorAsado = 5
  const costoAsadoPromedio2022 = asado_2022 * kilosPorAsado
  const costoAsadoPromedio2026 = asado_2026 * kilosPorAsado
  const asados2022 = Math.floor(salario_2022 / costoAsadoPromedio2022)
  const asados2026 = Math.floor(salario_2026 / costoAsadoPromedio2026)

  if (loading) {
    return (
      <SectionWrapper number={copy.number} title={copy.title} intro={LOADING_INTRO}>
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
      sources={[asado, salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <ComparisonBar
            label="Precio por kilo de carne para asado"
            value2022={asado_2022}
            value2026={asado_2026}
            unit={asado?.unidad}
            delay={0}
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 bg-muted rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-2">Costo de un asado promedio (5 kg)</p>
            <div className="flex items-baseline gap-4 mt-2">
              <div>
                <p className="text-2xl font-light text-primary">
                  {formatCurrency(costoAsadoPromedio2022, asado?.unidad)}
                </p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-2xl font-light text-accent">
                  {formatCurrency(costoAsadoPromedio2026, asado?.unidad)}
                </p>
                <p className="text-xs text-muted-foreground">2026</p>
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
            count2022={asados2022}
            count2026={asados2026}
            title="Asados promedio con un salario mínimo"
            unitLabel="asados"
            emoji="🥩"
            methodologyNote="Calculado como 5 kg de carne por asado, sin distinción entre cortes. El precio utilizado es un promedio general de carne vacuna para parrilla."
          />
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
