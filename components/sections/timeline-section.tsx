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
          
          {/* Timeline Points */}
          <div className="relative flex justify-between items-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <div className="mt-4 text-center">
                <p className="text-2xl md:text-4xl font-light text-primary">Qatar 2022</p>
                <p className="text-muted-foreground text-sm mt-1">Campeones</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-secondary origin-left"
            />
            
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-4 h-4 rounded-full bg-accent border-4 border-background" />
              <div className="mt-4 text-center">
                <p className="text-2xl md:text-4xl font-light text-primary">EEUU 2026</p>
                <p className="text-muted-foreground text-sm mt-1">El próximo sueño</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
