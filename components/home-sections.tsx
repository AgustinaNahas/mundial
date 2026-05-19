"use client"

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
import { BlockHeader } from "@/components/block-header"

export default function HomeSections() {
  return (
    <>
      <section id="previa">
        <BlockHeader
          number="01"
          title="La Previa del Mundial"
          subtitle="Arranca la fiebre mundialista. Nos preparamos para palpitar lo que van a ser los próximos días."
        />
        <DeferredAlbumSection />
        <DeferredPlayStationSection />
        <DeferredPelotaSection />
        <DeferredCamisetaSection />
      </section>

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

      <section id="festejo">
        <BlockHeader
          number="03"
          title="El Festejo"
          subtitle="Argentina campeona."
        />
        <DeferredFernetSection />
        <DeferredMicroSection />
      </section>

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
    </>
  )
}
