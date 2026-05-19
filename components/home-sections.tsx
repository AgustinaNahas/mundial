"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
  DeferredNinosSection,
  DeferredPelotaSection,
  DeferredPlayStationSection,
} from "@/components/deferred-sections"
import { BlockHeader } from "@/components/block-header"
import { CartaRevealSection } from "@/components/sections/carta-reveal-section"

export default function HomeSections() {
  const [festejoUnlocked, setFestejoUnlocked] = useState(false)

  useEffect(() => {
    if (!festejoUnlocked) return
    const timer = window.setTimeout(() => {
      document.getElementById("festejo")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [festejoUnlocked])

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

      <CartaRevealSection
        unlocked={festejoUnlocked}
        onUnlock={() => setFestejoUnlocked(true)}
      />

      <AnimatePresence>
        {festejoUnlocked && (
          <motion.div
            key="post-carta"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
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
              <DeferredNinosSection />
              <DeferredDerechosSection />
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <DeferredCierreSection />
    </>
  )
}
