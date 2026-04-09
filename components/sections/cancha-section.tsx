"use client"

import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

export function CanchaSection() {
  const { getIndicador, loading } = useData()
  
  const entradaPrimera = getIndicador("ENTRADA_PRIMERA")
  const tituloEntrada = entradaPrimera?.descripcion || "Entrada partido de primera"
  
  const entrada_2022 = entradaPrimera?.valor_2022 ?? 1360
  const entrada_2026 = entradaPrimera?.valor_2026 ?? 30000
  
  const cambio = Math.round(((entrada_2026 - entrada_2022) / entrada_2022) * 100)
  
  if (loading) {
    return (
      <SectionWrapper number="04" title="Ver a la Seleccion en el Mundial" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="04"
      title="Ir a la cancha"
      intro="Comparamos una entrada de partido de primera entre 2022 y 2026."
      bgColor="muted"
    >
      <div className="space-y-8">
        <ComparisonBar
          label={tituloEntrada}
          value2022={entrada_2022}
          value2026={entrada_2026}
          unit="$ "
          delay={0}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <StatCard
          value={`$ ${entrada_2022.toLocaleString("es-AR")}`}
          label="Entrada 2022"
          subtext="Precio mas accesible"
          delay={0.4}
        />
        <StatCard
          value={`$ ${entrada_2026.toLocaleString("es-AR")}`}
          label="Entrada 2026"
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
