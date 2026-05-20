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
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <section id="festejo">
              <BlockHeader {...BLOCKS.festejo} />
              <DeferredFernetSection />
              <DeferredMicroSection />
            </section>

            <section id="gente">
              <BlockHeader {...BLOCKS.gente} />
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
