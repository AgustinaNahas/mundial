"use client"

import { DataProvider } from "@/lib/data-context"
import {
  DeferredAlbumSection,
  DeferredAsadoSection,
  DeferredCamisetaSection,
  DeferredCanchaSection,
  DeferredCierreSection,
  DeferredDerechosSection,
  DeferredFernetSection,
  DeferredJubilacionSection,
  DeferredMateSection,
  DeferredMicroSection,
  DeferredPelotaSection,
  DeferredPlayStationSection,
} from "@/components/deferred-sections"
import { HeroSection } from "@/components/sections/hero-section"
import { BlockHeader } from "@/components/block-header"
import { ProgressTracker } from "@/components/progress-tracker"

export default function Home() {
  return (
    <DataProvider>
      <main className="bg-background min-h-screen pb-20 overflow-x-clip">
        <HeroSection />

        {/* BLOQUE 01: LA PREVIA */}
        <section id="previa">
          <BlockHeader
            number="01"
            title="La Previa del Mundial"
            subtitle="Arranca la fiebre mundialista. Nos preparamos para palpitar lo que van a ser los próximos días."
          />
          <DeferredPlayStationSection />
          <DeferredAlbumSection />
          <DeferredPelotaSection />
          <DeferredCamisetaSection />
        </section>

        {/* BLOQUE 02: EL MUNDIAL */}
        <section id="mundial">
          <BlockHeader
            number="02"
            title="El Mundial"
            subtitle="El momento de vivirlo."
          />
          <DeferredCanchaSection />
          <DeferredMateSection />
          <DeferredAsadoSection />
        </section>

        {/* BLOQUE 03: EL FESTEJO */}
        <section id="festejo">
          <BlockHeader
            number="03"
            title="El Festejo"
            subtitle="Argentina campeona."
          />
          <DeferredFernetSection />
          <DeferredMicroSection />
        </section>

        {/* BLOQUE 04: LA GENTE */}
        <section id="gente">
          <BlockHeader
            number="04"
            title="La Gente"
            subtitle="El tono cambia. Más íntimo."
          />
          <DeferredJubilacionSection />
          <DeferredDerechosSection />
        </section>

        <DeferredCierreSection />

        <ProgressTracker />
      </main>
    </DataProvider>
  )
}
