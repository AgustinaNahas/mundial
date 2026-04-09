"use client"

import { motion } from "framer-motion"

export function TimelineSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
          
        </motion.div>
      </div>
    </section>
  )
}
