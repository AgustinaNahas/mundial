"use client"

import { ChartLegend } from "@/components/chart-legend"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { FifaPitchAnimation } from "@/components/fifa-pitch-animation"
import { SectionLoadingShell } from "@/components/section-skeletons"
import { useData } from "@/lib/data-context"
import { SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.playstation

export function PlayStationSection() {
  const { getIndicador, loading } = useData()

  const ps5 = getIndicador("PLAY_STATION")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const ps5_2022 = ps5?.valor_2022 ?? 299999
  const ps5_2026 = ps5?.valor_2026 ?? 1499999
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718

  if (loading) {
    return (
      <SectionLoadingShell
        sectionId="playstation"
        number={copy.number}
        title={copy.title}
        intro={copy.intro}
      />
    )
  }

  return (
    <SectionWrapper progressSection="playstation"
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[ps5, salario]}
    >
      <div className="space-y-8">
        <ChartLegend />
        <ComparisonBar
          label="PlayStation 5"
          value2022={ps5_2022}
          value2026={ps5_2026}
          unit={ps5?.unidad}
          delay={0}
          referenceValue2022={salario_2022}
          referenceValue2026={salario_2026}
          referenceLabel="salario mínimo"
        />
        <FifaPitchAnimation />
      </div>
    </SectionWrapper>
  )
}
