"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

function FlightPath() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative h-48 md:h-64 w-full bg-primary/5 rounded-lg overflow-hidden"
    >
      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <ellipse cx="400" cy="200" rx="380" ry="180" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>
      
      {/* Cities */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute left-[20%] top-[65%]"
      >
        <div className="w-3 h-3 bg-secondary rounded-full" />
        <p className="absolute top-4 -left-4 text-xs text-foreground whitespace-nowrap">Buenos Aires</p>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute right-[25%] top-[35%]"
      >
        <div className="w-3 h-3 bg-primary rounded-full" />
        <p className="absolute top-4 -left-2 text-xs text-foreground whitespace-nowrap">Doha 2022</p>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="absolute left-[35%] top-[30%]"
      >
        <div className="w-3 h-3 bg-accent rounded-full" />
        <p className="absolute top-4 -left-2 text-xs text-foreground whitespace-nowrap">Miami 2026</p>
      </motion.div>
      
      {/* Flight Paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M 20 65 Q 50 20, 75 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          className="text-primary"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
        />
        <motion.path
          d="M 20 65 Q 30 30, 35 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          className="text-accent"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1 }}
        />
      </svg>
    </motion.div>
  )
}

export function ViajeSection() {
  const { getIndicador, loading } = useData()
  
  const vuelo = getIndicador("VUELO")
  const paquete = getIndicador("PAQUETE_BASICO")
  const salario = getIndicador("SALARIO_MINIMO")
  const dolar = getIndicador("DOLAR_OFICIAL")
  
  // Vuelos en USD
  const vuelo_2022 = vuelo?.valor_2022 ?? 2800
  const vuelo_2026 = vuelo?.valor_2026 ?? 1800
  const paquete_2022 = paquete?.valor_2022 ?? 8500
  const paquete_2026 = paquete?.valor_2026 ?? 12000
  
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  const dolar_2022 = dolar?.valor_2022 ?? 177
  const dolar_2026 = dolar?.valor_2026 ?? 1070
  
  // Calcular salarios necesarios (convertir salario a USD)
  const salarioUSD2022 = salario_2022 / dolar_2022
  const salarioUSD2026 = salario_2026 / dolar_2026
  
  const salarios2022 = Math.round(paquete_2022 / salarioUSD2022)
  const salarios2026 = Math.round(paquete_2026 / salarioUSD2026)
  
  if (loading) {
    return (
      <SectionWrapper number="05" title="Viajar al Mundial" insight="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="05"
      title="Viajar al Mundial"
      insight={`El viaje al Mundial equivalia a ${salarios2022} salarios minimos en 2022. En 2026 equivale a ${salarios2026}.`}
    >
      <FlightPath />
      
      <div className="space-y-8 mt-12">
        <ComparisonBar
          label="Vuelo ida y vuelta promedio"
          value2022={vuelo_2022}
          value2026={vuelo_2026}
          unit="USD "
          delay={0}
        />
        
        <ComparisonBar
          label="Paquete basico (vuelo + hotel 7 noches + entrada)"
          value2022={paquete_2022}
          value2026={paquete_2026}
          unit="USD "
          delay={0.2}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12"
      >
        <h4 className="text-sm font-medium text-foreground mb-6">
          ¿Cuantos salarios minimos para viajar?
        </h4>
        
        <div className="flex items-end gap-12">
          <div>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {Array.from({ length: Math.min(salarios2022, 30) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.03), duration: 0.2 }}
                  className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-medium"
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-2xl font-light text-primary">{salarios2022} salarios</p>
            <p className="text-sm text-muted-foreground">para Qatar 2022</p>
          </div>
          
          <div>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {Array.from({ length: Math.min(salarios2026, 50) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.03), duration: 0.2 }}
                  className="w-8 h-8 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-medium"
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-2xl font-light text-accent">{salarios2026} salarios</p>
            <p className="text-sm text-muted-foreground">para EEUU 2026</p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
