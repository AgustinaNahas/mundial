"use client"

import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

export function PlayStationSection() {
  const { getIndicador, getValue, loading } = useData()
  
  const ps5 = getIndicador("PLAY_STATION")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const ps5_2022 = ps5?.valor_2022 ?? 299999
  const ps5_2026 = ps5?.valor_2026 ?? 1499999
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  const salarios_2022 = (ps5_2022 / salario_2022).toFixed(1)
  const salarios_2026 = (ps5_2026 / salario_2026).toFixed(1)
  
  // Format numbers in Argentine style
  const formatARS = (n: number) => {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  }
  
  if (loading) {
    return (
      <SectionWrapper number="01" title="La Play en la previa" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="01"
      title="La Play en la previa"
      intro="Jugar al FIFA antes del mundial ya no es lo mismo. Aunque la consola cuesta mas en pesos, el poder adquisitivo cambio."
    >
      <div className="space-y-8">
        <ComparisonBar
          label="PlayStation 5"
          value2022={ps5_2022}
          value2026={ps5_2026}
          unit="$"
          formatValue={(v) => formatARS(v)}
          delay={0}
        />
        
        <ComparisonBar
          label="Salario Minimo"
          value2022={salario_2022}
          value2026={salario_2026}
          unit="$"
          formatValue={(v) => formatARS(v)}
          delay={0.2}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
        <StatCard
          value={salarios_2022}
          label="Salarios minimos para comprar la consola"
          subtext="En 2022"
          delay={0.4}
        />
        <StatCard
          value={salarios_2026}
          label="Salarios minimos para comprar la consola"
          subtext="En 2026"
          delay={0.6}
          variant="highlight"
        />
      </div>
    </SectionWrapper>
  )
}
