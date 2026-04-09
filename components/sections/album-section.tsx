"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

function StickerPackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="2" y="3" width="16" height="14" rx="1" />
    </svg>
  )
}

export function AlbumSection() {
  const { getIndicador, loading } = useData()
  
  const album = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const sobre = getIndicador("PRECIO_SOBRE_FIGURITAS")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const sobre_2022 = sobre?.valor_2022 ?? 150
  const sobre_2026 = sobre?.valor_2026 ?? 800
  const album_2022 = album?.valor_2022 ?? 750
  const album_2026 = album?.valor_2026 ?? 4500
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  const sobres2022 = Math.floor(salario_2022 / sobre_2022)
  const sobres2026 = Math.floor(salario_2026 / sobre_2026)
  
  // Para completar album: ~450 sobres
  const sobresParaCompletar = 450
  const meses2022 = (sobresParaCompletar * sobre_2022 / salario_2022).toFixed(1)
  const meses2026 = (sobresParaCompletar * sobre_2026 / salario_2026).toFixed(1)
  
  const formatARS = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  
  if (loading) {
    return (
      <SectionWrapper number="02" title="El album del Mundial" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="02"
      title="El album del Mundial"
      intro="Completar el album paso de ser un hobby familiar a un lujo cada vez mas dificil de alcanzar."
      bgColor="muted"
    >
      <div className="space-y-8">
        <ComparisonBar
          label="Precio del sobre"
          value2022={sobre_2022}
          value2026={sobre_2026}
          formatValue={formatARS}
          delay={0}
        />
        
        <ComparisonBar
          label="Precio del album"
          value2022={album_2022}
          value2026={album_2026}
          formatValue={formatARS}
          delay={0.2}
        />
      </div>
      
      <div className="mt-12 space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h4 className="text-sm font-medium text-foreground mb-4">
            ¿Cuantos sobres compra un sueldo minimo?
          </h4>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-muted-foreground mb-3">2022</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(sobres2022, 40) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.01), duration: 0.2 }}
                  >
                    <StickerPackIcon className="w-3 h-3 text-primary" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-2 text-lg font-light text-primary">{sobres2022} sobres</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-3">2026</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(sobres2026, 40) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.01), duration: 0.2 }}
                  >
                    <StickerPackIcon className="w-3 h-3 text-accent" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-2 text-lg font-light text-accent">{sobres2026} sobres</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-12 p-8 bg-card rounded-lg border border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Para completar el album se estiman ~450 sobres en promedio
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <StatCard
              value={meses2022}
              label="meses de sueldo minimo"
              subtext="Para completar el album en 2022"
              delay={0.6}
            />
            <StatCard
              value={meses2026}
              label="meses de sueldo minimo"
              subtext="Para completar el album en 2026"
              delay={0.7}
              variant="highlight"
            />
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
