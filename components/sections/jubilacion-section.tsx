"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"

export function JubilacionSection() {
  const { getIndicador, loading } = useData()
  
  const jubilacion = getIndicador("JUBILACION_MIN_DOLARES")
  const alquiler = getIndicador("ALQUILER_FESTEJO")
  const asado = getIndicador("ASADO_FINAL")
  const album = getIndicador("PRECIO_ALBUM_FIGURITAS")
  
  const jubilacion_2022 = jubilacion?.valor_2022 ?? 220
  const jubilacion_2026 = jubilacion?.valor_2026 ?? 190
  
  const alquiler_2022 = alquiler?.valor_2022 ?? 250
  const alquiler_2026 = alquiler?.valor_2026 ?? 400
  
  const asado_2022 = asado?.valor_2022 ?? 80
  const asado_2026 = asado?.valor_2026 ?? 65
  
  const albumTotal_2022 = album?.valor_2022 ?? 160
  const albumTotal_2026 = album?.valor_2026 ?? 250
  
  // Equivalencias
  const albumes2022 = (jubilacion_2022 / albumTotal_2022).toFixed(1)
  const albumes2026 = (jubilacion_2026 / albumTotal_2026).toFixed(1)
  
  const asados2022 = Math.floor(jubilacion_2022 / asado_2022)
  const asados2026 = Math.floor(jubilacion_2026 / asado_2026)
  
  const alquilerPorcentaje2022 = Math.round((alquiler_2022 / jubilacion_2022) * 100)
  const alquilerPorcentaje2026 = Math.round((alquiler_2026 / jubilacion_2026) * 100)
  
  if (loading) {
    return (
      <SectionWrapper number="12" title="La abuela que festejó" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="12"
      title="La abuela que festejó"
      intro="Este es uno de los golpes emocionales más fuertes de la comparación."
      bgColor="muted"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
          Jubilación mínima en dólares
        </p>
        <div className="flex items-center justify-center gap-8 md:gap-16">
          <div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-light text-primary"
            >
              ${jubilacion_2022}
            </motion.p>
            <p className="text-muted-foreground mt-2">2022</p>
          </div>
          
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-12 h-0.5 bg-border"
          />
          
          <div>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl md:text-7xl font-light text-accent"
            >
              ${jubilacion_2026}
            </motion.p>
            <p className="text-muted-foreground mt-2">2026</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-12"
      >
        <h4 className="text-sm font-medium text-foreground mb-6 text-center">
          ¿Qué puede comprar una jubilación mínima?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Álbumes completos</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-light text-primary">{albumes2022}</p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground mb-1">→</span>
              <div>
                <p className="text-3xl font-light text-accent">{albumes2026}</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Asados para 10</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-light text-primary">{asados2022}</p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground mb-1">→</span>
              <div>
                <p className="text-3xl font-light text-accent">{asados2026}</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">% del alquiler monoamb</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-light text-primary">{alquilerPorcentaje2022}%</p>
                <p className="text-xs text-muted-foreground">2022</p>
              </div>
              <span className="text-muted-foreground mb-1">→</span>
              <div>
                <p className="text-3xl font-light text-accent">{alquilerPorcentaje2026}%</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="p-8 bg-primary text-primary-foreground rounded-lg text-center"
      >
        <p className="text-lg md:text-xl font-light max-w-2xl mx-auto text-balance">
          Una jubilación mínima no alcanza para un alquiler de monoambiente.
          <span className="block mt-2 text-primary">
            Ni en 2022, ni en 2026.
          </span>
        </p>
      </motion.div>
    </SectionWrapper>
  )
}
