"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="currentColor">
      {/* Building */}
      <rect x="15" y="20" width="70" height="100" rx="2" />
      {/* Windows */}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={25 + col * 20}
            y={30 + row * 18}
            width="12"
            height="10"
            rx="1"
            fill="white"
            opacity={0.8}
          />
        ))
      )}
      {/* Door */}
      <rect x="40" y="100" width="20" height="20" rx="1" fill="white" />
    </svg>
  )
}

export function AlquilerSection() {
  const { getIndicador, loading } = useData()
  
  const alquiler = getIndicador("ALQUILER_FESTEJO")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const alquiler_2022 = alquiler?.valor_2022 ?? 45000
  const alquiler_2026 = alquiler?.valor_2026 ?? 450000
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  const salarios2022 = (alquiler_2022 / salario_2022).toFixed(1)
  const salarios2026 = (alquiler_2026 / salario_2026).toFixed(1)
  
  if (loading) {
    return (
      <SectionWrapper number="10" title="El depto 2 ambientes" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="10"
      title="El depto 2 ambientes"
      intro="El balcon del festejo ahora cuesta mas meses de trabajo."
      bgColor="muted"
      sources={[alquiler, salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <ComparisonBar
            label="Alquiler promedio monoambiente CABA"
            value2022={alquiler_2022}
            value2026={alquiler_2026}
            unit={alquiler?.unidad}
            delay={0}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8"
          >
            <h4 className="text-sm font-medium text-foreground mb-4">
              Salarios minimos para pagar el alquiler
            </h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-12">2022</span>
                  <div className="flex-1 h-6 bg-background rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(parseFloat(salarios2022) / 3) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      className="h-full bg-primary flex items-center justify-end pr-2"
                    >
                      <span className="text-xs text-primary-foreground font-medium">{salarios2022}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-12">2026</span>
                  <div className="flex-1 h-6 bg-background rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(parseFloat(salarios2026) / 3) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full bg-accent flex items-center justify-end pr-2"
                    >
                      <span className="text-xs text-accent-foreground font-medium">{salarios2026}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <BuildingIcon className="w-40 h-48 text-primary/30" />
          
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <StatCard
              value={`${salarios2022}x`}
              label="salarios para alquilar"
              subtext="2022"
              delay={0.5}
            />
            <StatCard
              value={`${salarios2026}x`}
              label="salarios para alquilar"
              subtext="2026"
              delay={0.6}
              variant="highlight"
            />
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
