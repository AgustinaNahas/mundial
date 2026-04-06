"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

function GrillIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 80" fill="currentColor">
      {/* Grill */}
      <rect x="10" y="50" width="80" height="25" rx="3" />
      {/* Grill lines */}
      <rect x="15" y="55" width="70" height="2" />
      <rect x="15" y="60" width="70" height="2" />
      <rect x="15" y="65" width="70" height="2" />
      {/* Meat */}
      <ellipse cx="35" cy="45" rx="15" ry="8" />
      <ellipse cx="65" cy="45" rx="15" ry="8" />
      {/* Fire */}
      <motion.path
        d="M25 75 Q30 65 25 55 Q35 65 30 75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      <motion.path
        d="M50 75 Q55 65 50 55 Q60 65 55 75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
      />
      <motion.path
        d="M75 75 Q80 65 75 55 Q85 65 80 75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
      />
    </svg>
  )
}

export function AsadoSection() {
  const { getIndicador, loading } = useData()
  
  const asado = getIndicador("ASADO_10P")
  const salario = getIndicador("SALARIO_MINIMO")
  
  const asado_2022 = asado?.valor_2022 ?? 12000
  const asado_2026 = asado?.valor_2026 ?? 85000
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  // Cuantos asados compra un salario minimo
  const asados2022 = Math.floor(salario_2022 / asado_2022)
  const asados2026 = Math.floor(salario_2026 / asado_2026)
  
  const formatARS = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  
  if (loading) {
    return (
      <SectionWrapper number="07" title="El asado de la final" insight="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="07"
      title="El asado de la final"
      insight="El ritual argentino por excelencia tambien sintio la inflacion."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <ComparisonBar
            label="Asado para 10 personas"
            value2022={asado_2022}
            value2026={asado_2026}
            formatValue={formatARS}
            delay={0}
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 bg-muted rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-2">Costo total del asado</p>
            <div className="flex items-baseline gap-4 mt-2">
              <div>
                <p className="text-2xl font-light text-primary">{formatARS(asado_2022)}</p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-2xl font-light text-accent">{formatARS(asado_2026)}</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <GrillIcon className="w-48 h-40 text-accent" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h4 className="text-sm font-medium text-foreground mb-4">
              ¿Cuantos asados compra un salario minimo?
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(asados2022, 10) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + (i * 0.05), duration: 0.2 }}
                      className="w-10 h-10 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-bold"
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                <p className="mt-3 text-xl font-light text-primary">{asados2022} asados</p>
                <p className="text-xs text-muted-foreground">en 2022</p>
              </div>
              
              <div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(asados2026, 10) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + (i * 0.05), duration: 0.2 }}
                      className="w-10 h-10 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold"
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                <p className="mt-3 text-xl font-light text-accent">{asados2026} asados</p>
                <p className="text-xs text-muted-foreground">en 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
