"use client"

import { DataProvider } from "@/lib/data-context"
import { HeroSection } from "@/components/sections/hero-section"
import { TimelineSection } from "@/components/sections/timeline-section"
import { PlayStationSection } from "@/components/sections/playstation-section"
import { AlbumSection } from "@/components/sections/album-section"
import { CamisetaSection } from "@/components/sections/camiseta-section"
import { PelotaSection } from "@/components/sections/pelota-section"
import { CanchaSection } from "@/components/sections/cancha-section"
import { ViajeSection } from "@/components/sections/viaje-section"
import { MateSection } from "@/components/sections/mate-section"
import { AsadoSection } from "@/components/sections/asado-section"
import { TrabajoSection } from "@/components/sections/trabajo-section"
import { FernetSection } from "@/components/sections/fernet-section"
import { AlquilerSection } from "@/components/sections/alquiler-section"
import { MicroSection } from "@/components/sections/micro-section"
import { JubilacionSection } from "@/components/sections/jubilacion-section"
import { DerechosSection } from "@/components/sections/derechos-section"
import { CierreSection } from "@/components/sections/cierre-section"
import { BlockHeader } from "@/components/block-header"
import { ProgressTracker } from "@/components/progress-tracker"

export default function Home() {
  return (
    <DataProvider>
      <main className="bg-background min-h-screen pb-20 overflow-x-hidden">
        <HeroSection />
        
        {/* BLOQUE 01: LA PREVIA */}
        <section id="previa">
          <BlockHeader 
            number="01" 
            title="La Previa del Mundial" 
            subtitle="Arranca la fiebre mundialista. Nos preparamos para palpitar lo que van a ser los próximos días."
          />
          <PlayStationSection />
          <AlbumSection />
          <PelotaSection />
          <CamisetaSection />
        </section>
        
        {/* BLOQUE 02: EL MUNDIAL */}
        <section id="mundial">
          <BlockHeader 
            number="02" 
            title="El Mundial" 
            subtitle="El momento de vivirlo."
          />
          <CanchaSection />
          <ViajeSection />
          <MateSection />
          <AsadoSection />
          <TrabajoSection />
        </section>
        
        {/* BLOQUE 03: EL FESTEJO */}
        <section id="festejo">
          <BlockHeader 
            number="03" 
            title="El Festejo" 
            subtitle="Argentina campeona."
          />
          <FernetSection />
          <AlquilerSection />
          <MicroSection />
        </section>
        
        {/* BLOQUE 04: LA GENTE */}
        <section id="gente">
          <BlockHeader 
            number="04" 
            title="La Gente" 
            subtitle="El tono cambia. Más íntimo."
          />
          <JubilacionSection />
          <DerechosSection />
        </section>
        
        <CierreSection />
        
        <ProgressTracker />
      </main>
    </DataProvider>
  )
}
