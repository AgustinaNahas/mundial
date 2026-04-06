"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

function BottleIcon({ className, variant }: { className?: string; variant: "fernet" | "coca" }) {
  return (
    <svg className={className} viewBox="0 0 40 100" fill="currentColor">
      {variant === "fernet" ? (
        <>
          {/* Fernet bottle */}
          <rect x="12" y="10" width="16" height="8" rx="2" />
          <rect x="14" y="5" width="12" height="5" rx="1" />
          <path d="M10 20 L10 90 Q10 95 15 95 L25 95 Q30 95 30 90 L30 20 Z" />
          <rect x="14" y="30" width="12" height="30" fill="none" stroke="white" strokeWidth="1" />
        </>
      ) : (
        <>
          {/* Coca bottle */}
          <ellipse cx="20" cy="8" rx="6" ry="3" />
          <path d="M14 8 Q12 20 14 40 Q10 50 10 70 Q10 95 20 95 Q30 95 30 70 Q30 50 26 40 Q28 20 26 8 Z" />
        </>
      )}
    </svg>
  )
}

export function FernetSection() {
  const { getIndicador, loading } = useData()
  
  const fernet = getIndicador("FERNET")
  const salario = getIndicador("SALARIO_MINIMO")
  
  const fernet_2022 = fernet?.valor_2022 ?? 1800
  const fernet_2026 = fernet?.valor_2026 ?? 12500
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  const fernetsSalario2022 = Math.floor(salario_2022 / fernet_2022)
  const fernetsSalario2026 = Math.floor(salario_2026 / fernet_2026)
  
  const formatARS = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  
  if (loading) {
    return (
      <SectionWrapper number="09" title="El fernet del campeon" insight="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="09"
      title="El fernet del campeon"
      insight="El festejo tambien tiene inflacion."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <ComparisonBar
            label="Fernet Branca (750ml)"
            value2022={fernet_2022}
            value2026={fernet_2026}
            formatValue={formatARS}
            delay={0}
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="p-6 bg-card rounded-lg border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3">Fernets que compra un sueldo minimo</p>
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-3xl font-light text-primary">{fernetsSalario2022}</p>
                <p className="text-xs text-muted-foreground">en 2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-3xl font-light text-accent">{fernetsSalario2026}</p>
                <p className="text-xs text-muted-foreground">en 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center items-end gap-4"
        >
          <motion.div
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <BottleIcon className="w-16 h-40 text-primary" variant="fernet" />
          </motion.div>
          <span className="text-4xl text-muted-foreground mb-8">+</span>
          <motion.div
            animate={{ rotate: [2, -2, 2] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <BottleIcon className="w-14 h-36 text-accent" variant="coca" />
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-12 grid grid-cols-2 gap-4"
      >
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-light text-primary">{fernetsSalario2022}</p>
          <p className="text-xs text-muted-foreground">Fernets con sueldo minimo 2022</p>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-light text-accent">{fernetsSalario2026}</p>
          <p className="text-xs text-muted-foreground">Fernets con sueldo minimo 2026</p>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
