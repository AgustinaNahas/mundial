"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

function MateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      {/* Mate body */}
      <path d="M30 35 C25 35 20 45 20 60 C20 80 30 90 50 90 C70 90 80 80 80 60 C80 45 75 35 70 35 Z" />
      {/* Bombilla */}
      <rect x="48" y="10" width="4" height="50" />
      <circle cx="50" cy="10" r="6" />
    </svg>
  )
}

export function MateSection() {
  const { getIndicador, loading } = useData()
  
  const yerba = getIndicador("KILO_YERBA")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const yerba_2022 = yerba?.valor_2022 ?? 650
  const yerba_2026 = yerba?.valor_2026 ?? 4500
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  // Cuantos kilos de yerba compra un salario
  const kilos2022 = Math.floor(salario_2022 / yerba_2022)
  const kilos2026 = Math.floor(salario_2026 / yerba_2026)
  
  const formatARS = (n: number) => formatCurrency(n, yerba?.unidad)
  
  if (loading) {
    return (
      <SectionWrapper number="06" title="El mate mundialista" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="06"
      title="El mate mundialista"
      intro="El mate nunca falta. Veamos cuanto cuesta el ritual mas argentino."
      bgColor="muted"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
                <p className="text-3xl font-light text-primary">{kilos2022}</p>
                <p className="text-xs text-muted-foreground">kilos en 2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-3xl font-light text-accent">{kilos2026}</p>
                <p className="text-xs text-muted-foreground">kilos en 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="relative">
            <MateIcon className="w-48 h-48 text-primary/20" />
            <motion.div
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute top-8 left-1/2 -translate-x-1/2"
            >
              {/* Steam effect */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      delay: i * 0.3
                    }}
                    className="w-1 h-6 bg-muted-foreground/30 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
