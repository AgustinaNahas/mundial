"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

function JerseyIcon({ className, year }: { className?: string; year: "2022" | "2026" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      <path d="M30 20 L15 30 L15 50 L25 50 L25 85 L75 85 L75 50 L85 50 L85 30 L70 20 L60 25 L50 22 L40 25 Z" />
      <text x="50" y="60" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
        {year === "2022" ? "10" : "10"}
      </text>
    </svg>
  )
}

export function CamisetaSection() {
  const { getIndicador, loading } = useData()
  
  const camiseta = getIndicador("CAMISETA_ADIDAS")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const camiseta_2022 = camiseta?.valor_2022 ?? 22000
  const camiseta_2026 = camiseta?.valor_2026 ?? 189999
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  // Dias de trabajo (asumiendo 22 dias laborables por mes)
  const diasTrabajo2022 = Math.ceil(camiseta_2022 / (salario_2022 / 22))
  const diasTrabajo2026 = Math.ceil(camiseta_2026 / (salario_2026 / 22))
  
  const formatARS = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  
  if (loading) {
    return (
      <SectionWrapper number="03" title="La camiseta" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="03"
      title="La camiseta"
      intro="Vestir los colores de la Seleccion requiere mas dias de trabajo que hace 4 anos."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <ComparisonBar
            label="Camiseta oficial"
            value2022={camiseta_2022}
            value2026={camiseta_2026}
            formatValue={formatARS}
            delay={0}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-medium text-foreground">
              Dias de trabajo con sueldo minimo
            </h4>
            
            <div className="flex items-end gap-8">
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-2">
                  {Array.from({ length: Math.min(diasTrabajo2022, 10) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
                      className="w-6 h-12 bg-primary rounded origin-bottom"
                    />
                  ))}
                </div>
                <p className="text-2xl font-light text-primary">{diasTrabajo2022}</p>
                <p className="text-xs text-muted-foreground">dias en 2022</p>
              </div>
              
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-2">
                  {Array.from({ length: Math.min(diasTrabajo2026, 20) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
                      className="w-6 h-12 bg-accent rounded origin-bottom"
                    />
                  ))}
                </div>
                <p className="text-2xl font-light text-accent">{diasTrabajo2026}</p>
                <p className="text-xs text-muted-foreground">dias en 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center items-center gap-8"
        >
          <div className="text-center">
            <JerseyIcon className="w-32 h-32 text-primary mx-auto" year="2022" />
            <p className="mt-2 text-sm text-muted-foreground">2022</p>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-12 h-0.5 bg-border"
          />
          <div className="text-center">
            <JerseyIcon className="w-32 h-32 text-accent mx-auto" year="2026" />
            <p className="mt-2 text-sm text-muted-foreground">2026</p>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
