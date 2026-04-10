"use client"

import { motion } from "framer-motion"
import { useData } from "@/lib/data-context"

export function CierreSection() {
  const { getIndicador, loading } = useData()
  
  // Get data for index calculation
  const ps5 = getIndicador("PLAY_STATION")
  const fifa = getIndicador("FIFA")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  const album = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const camiseta = getIndicador("CAMISETA_ADIDAS")
  const viaje = getIndicador("BSAS_MIAMI")
  const asado = getIndicador("ASADO_FINAL")
  const alquiler = getIndicador("ALQUILER_FESTEJO")
  const jubilacion = getIndicador("JUBILACION_MIN_DOLARES")
  
  // Calculate values in minimum wages
  const salario_2022 = salario?.valor_2022 ?? 234
  const salario_2026 = salario?.valor_2026 ?? 180
  
  const calcIndex = (val2022: number, val2026: number) => {
    const salarios2022 = val2022 / salario_2022
    const salarios2026 = val2026 / salario_2026
    return Math.round((salarios2026 / salarios2022) * 100)
  }
  
  const indexData = [
    { 
      category: "PlayStation + FIFA", 
      value2022: 100, 
      value2026: calcIndex(
        (ps5?.valor_2022 ?? 499) + (fifa?.valor_2022 ?? 60),
        (ps5?.valor_2026 ?? 499) + (fifa?.valor_2026 ?? 70)
      )
    },
    { 
      category: "Álbum completo", 
      value2022: 100, 
      value2026: calcIndex(album?.valor_2022 ?? 160, album?.valor_2026 ?? 250)
    },
    { 
      category: "Camiseta oficial", 
      value2022: 100, 
      value2026: calcIndex(camiseta?.valor_2022 ?? 150, camiseta?.valor_2026 ?? 170)
    },
    { 
      category: "Viaje al Mundial", 
      value2022: 100, 
      value2026: calcIndex(viaje?.valor_2022 ?? 8500, viaje?.valor_2026 ?? 12000)
    },
    { 
      category: "Asado para 10", 
      value2022: 100, 
      value2026: calcIndex(asado?.valor_2022 ?? 80, asado?.valor_2026 ?? 65)
    },
    { 
      category: "Alquiler monoambiente", 
      value2022: 100, 
      value2026: calcIndex(alquiler?.valor_2022 ?? 250, alquiler?.valor_2026 ?? 400)
    },
    { 
      category: "Jubilación mínima", 
      value2022: 100, 
      value2026: Math.round(((jubilacion?.valor_2026 ?? 190) / (jubilacion?.valor_2022 ?? 220)) * 100)
    },
  ]
  
  const indexPromedio = Math.round(
    indexData.reduce((acc, d) => acc + d.value2026, 0) / indexData.length
  )

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="h-96 animate-pulse bg-primary-foreground/10 rounded-lg" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm uppercase tracking-[0.3em] mb-4">
            Cierre
          </p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-balance">
            ¿Es más caro soñar?
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-16"
        >
          <div className="p-8 md:p-12 bg-primary-foreground/10 rounded-lg text-center">
            <p className="text-sm text-primary-foreground/60 uppercase tracking-wide mb-4">
              Índice "Ser campeón del mundo"
            </p>
            <p className="text-xs text-primary-foreground/40 mb-6">
              Base 100 = Qatar 2022 (medido en salarios mínimos)
            </p>
            
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-7xl md:text-9xl font-light text-accent"
            >
              {indexPromedio}
            </motion.p>
            
            <p className="mt-4 text-lg text-primary-foreground/70">
              El costo de vivir el Mundial {indexPromedio > 100 ? "subió" : "bajó"} un <span className="text-accent font-medium">{Math.abs(indexPromedio - 100)}%</span>
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <h4 className="text-sm text-primary-foreground/60 mb-6">Desglose por categoría (en salarios mínimos)</h4>
          
          <div className="space-y-4">
            {indexData.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm text-primary-foreground/70 w-40 md:w-48">
                  {item.category}
                </span>
                <div className="flex-1 h-6 bg-primary-foreground/10 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min((item.value2026 / 250) * 100, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded flex items-center justify-end pr-2 bg-accent"
                  >
                    <span className="text-xs font-medium text-accent-foreground">
                      {item.value2026}
                    </span>
                  </motion.div>
                </div>
                <span className="text-sm font-medium w-16 text-right text-accent">
                  {item.value2026 > 100 ? "+" : ""}{item.value2026 - 100}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-center pt-12 border-t border-primary-foreground/20"
        >
          <p className="text-xl md:text-2xl font-light text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed text-balance">
            En 2022 Argentina fue campeona del mundo.
          </p>
          <p className="text-xl md:text-2xl font-light text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mt-2 text-balance">
            En 2026 quiere volver a serlo.
          </p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 text-2xl md:text-3xl font-light text-primary"
          >
            La pregunta es:
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-4 text-3xl md:text-5xl font-light text-primary text-balance"
          >
            ¿cuánto cuesta hoy ese sueño?
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-xs text-primary-foreground/40 uppercase tracking-widest">
            Una visualización de datos
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="w-8 h-1 bg-primary/30" />
            <div className="w-8 h-1 bg-primary-foreground/20" />
            <div className="w-8 h-1 bg-primary/30" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
