"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { PurchasingPowerPictogram } from "@/components/purchasing-power-pictogram"
import { useData } from "@/lib/data-context"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.fernet

export function FernetSection() {
  const { getIndicador, loading } = useData()

  const fernet = getIndicador("FERNET_COCA")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const fernet_2022 = fernet?.valor_2022 ?? 1800
  const fernet_2026 = fernet?.valor_2026 ?? 12500
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718

  const fernetsSalario2022 = Math.floor(salario_2022 / fernet_2022)
  const fernetsSalario2026 = Math.floor(salario_2026 / fernet_2026)

  if (loading) {
    return (
      <SectionWrapper progressSection="fernet" number={copy.number} title={copy.title} intro={LOADING_INTRO}>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper progressSection="fernet"
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[fernet, salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <ComparisonBar
            label="Fernet Branca (750ml)"
            value2022={fernet_2022}
            value2026={fernet_2026}
            unit={fernet?.unidad}
            delay={0}
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="p-6 bg-card rounded-lg border border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">Costo del combo fernet + coca</p>
            <div className="flex items-baseline gap-4 mt-2">
              <div>
                <p className="text-2xl font-light text-primary">
                  {formatCurrency(fernet_2022, fernet?.unidad)}
                </p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-2xl font-light text-accent">
                  {formatCurrency(fernet_2026, fernet?.unidad)}
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
            count2022={fernetsSalario2022}
            count2026={fernetsSalario2026}
            title="Fernets con un salario mínimo"
            unitLabel="fernets"
            imageFile="viajero.webp"
            imageAlt=""
            methodologyNote="Precio relevado para Fernet Branca 750 ml, la marca de referencia del mercado argentino."
          />
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
