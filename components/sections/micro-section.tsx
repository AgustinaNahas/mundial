"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="currentColor">
      {/* Bus body */}
      <rect x="5" y="10" width="110" height="40" rx="5" />
      {/* Windows */}
      <rect x="12" y="15" width="15" height="15" rx="2" fill="white" opacity="0.9" />
      <rect x="32" y="15" width="15" height="15" rx="2" fill="white" opacity="0.9" />
      <rect x="52" y="15" width="15" height="15" rx="2" fill="white" opacity="0.9" />
      <rect x="72" y="15" width="15" height="15" rx="2" fill="white" opacity="0.9" />
      <rect x="92" y="15" width="15" height="15" rx="2" fill="white" opacity="0.9" />
      {/* Wheels */}
      <circle cx="30" cy="50" r="8" fill="white" />
      <circle cx="30" cy="50" r="4" />
      <circle cx="90" cy="50" r="8" fill="white" />
      <circle cx="90" cy="50" r="4" />
      {/* Front */}
      <rect x="105" y="20" width="8" height="20" rx="2" fill="white" opacity="0.7" />
    </svg>
  )
}

export function MicroSection() {
  const { getIndicador, loading } = useData()
  
  const micro = getIndicador("BOLETO_AMBA")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const micro_2022 = micro?.valor_2022 ?? 3500
  const micro_2026 = micro?.valor_2026 ?? 25000
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  const pasajes2022 = Math.floor(salario_2022 / micro_2022)
  const pasajes2026 = Math.floor(salario_2026 / micro_2026)
  
  const formatARS = (n: number) => formatCurrency(n, micro?.unidad)
  
  const jugadores = 26
  
  if (loading) {
    return (
      <SectionWrapper number="11" title="El micro que no avanzaba" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="11"
      title="El micro que no avanzaba"
      intro="Si el recorrido del festejo hubiese sido en colectivo comun..."
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Bus animation */}
        <div className="overflow-hidden py-8">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "linear"
            }}
            className="flex items-center"
          >
            <BusIcon className="w-40 h-20 text-accent" />
          </motion.div>
        </div>
        
        {/* Road */}
        <div className="h-2 bg-muted rounded-full relative overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "0%"] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "linear"
            }}
            className="absolute inset-0 flex gap-4"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-8 h-1 bg-foreground/30 rounded" />
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <h4 className="text-sm font-medium text-foreground">Precio pasaje Buenos Aires - Rosario</h4>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xl font-light text-primary">{formatCurrency(micro_2022, micro?.unidad)}</p>
              <p className="text-xs text-muted-foreground mt-1">2022</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex-1 p-4 bg-card rounded-lg border border-border text-center">
              <p className="text-xl font-light text-accent">{formatCurrency(micro_2026, micro?.unidad)}</p>
              <p className="text-xs text-muted-foreground mt-1">2026</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="p-6 bg-primary/5 rounded-lg"
        >
          <h4 className="text-sm font-medium text-foreground mb-4">
            Pasajes que compra un sueldo minimo
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">En 2022</span>
              <span className="font-medium text-primary">{pasajes2022} pasajes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">En 2026</span>
              <span className="font-medium text-accent">{pasajes2026} pasajes</span>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-muted-foreground italic">
            * Claro que el micro del campeon no pago boleto
          </p>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <div className="flex flex-wrap gap-1 max-w-md justify-center">
          {Array.from({ length: jugadores }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + (i * 0.02), duration: 0.2 }}
              className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-medium"
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
