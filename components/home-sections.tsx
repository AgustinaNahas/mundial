"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  DeferredAlbumSection,
  DeferredAsadoSection,
  DeferredCamisetaSection,
  DeferredCanchaSection,
  DeferredCierreSection,
  DeferredResumenSection,
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
import { MOTION_EASE } from "@/lib/motion"
import { BLOCKS } from "@/lib/site-copy"

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
        <BlockHeader {...BLOCKS.previa} />
        <DeferredAlbumSection />
        <DeferredPlayStationSection />
        <DeferredPelotaSection />
        <DeferredCamisetaSection />
      </section>

      <section id="mundial">
        <BlockHeader {...BLOCKS.mundial} />
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
            transition={{ duration: 0.55, ease: [...MOTION_EASE] }}
          >
            <section id="festejo">
              <BlockHeader {...BLOCKS.festejo} />
              <DeferredFernetSection />
              <DeferredMicroSection />
            </section>

            <section id="gente">
              <BlockHeader {...BLOCKS.gente} />
              <DeferredNinosSection />
              <DeferredJubilacionSection />
              <DeferredDerechosSection />
            </section>

            <DeferredResumenSection />
            <DeferredCierreSection />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
