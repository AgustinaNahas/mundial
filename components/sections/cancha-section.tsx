"use client"

import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

export function CanchaSection() {
  const { getIndicador, loading } = useData()
  
  const entradaGrupo = getIndicador("ENTRADA_GRUPO")
  const entradaFinal = getIndicador("ENTRADA_FINAL")
  
  // Entradas en USD
  const grupo_2022 = entradaGrupo?.valor_2022 ?? 220
  const grupo_2026 = entradaGrupo?.valor_2026 ?? 300
  const final_2022 = entradaFinal?.valor_2022 ?? 1600
  const final_2026 = entradaFinal?.valor_2026 ?? 2500
  
  const cambio = Math.round(((grupo_2026 - grupo_2022) / grupo_2022) * 100)
  
  if (loading) {
    return (
      <SectionWrapper number="04" title="Ver a la Seleccion en el Mundial" insight="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="04"
      title="Ver a la Seleccion en el Mundial"
      insight="Las entradas al Mundial aumentaron significativamente entre ediciones."
      bgColor="muted"
    >
      <div className="space-y-8">
        <ComparisonBar
          label="Entrada fase de grupos"
          value2022={grupo_2022}
          value2026={grupo_2026}
          unit="USD "
          delay={0}
        />
        
        <ComparisonBar
          label="Entrada final"
          value2022={final_2022}
          value2026={final_2026}
          unit="USD "
          delay={0.2}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <StatCard
          value={`USD ${grupo_2022}`}
          label="Entrada grupo 2022"
          subtext="Precio mas accesible"
          delay={0.4}
        />
        <StatCard
          value={`USD ${grupo_2026}`}
          label="Entrada grupo 2026"
          subtext="Precio mas alto"
          delay={0.5}
        />
        <StatCard
          value={`+${cambio}%`}
          label="Aumento"
          subtext="En 4 anos"
          delay={0.6}
          variant="highlight"
        />
      </div>
    </SectionWrapper>
  )
}
