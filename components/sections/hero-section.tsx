"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-primary">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-secondary/30" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/30" />
      </div>
      
      <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="text-secondary text-sm md:text-base uppercase tracking-[0.3em] mb-6">
            Visualización de datos
          </p>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground leading-tight tracking-tight text-balance max-w-4xl mx-auto">
            ¿Cuánto cuesta ser
            <span className="block mt-2 font-normal text-secondary">
              campeón del mundo?
            </span>
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-12 flex items-center justify-center gap-6 md:gap-12"
          >
            <div className="text-center">
              <p className="text-secondary text-3xl md:text-5xl font-light">2022</p>
              <p className="text-primary-foreground/60 text-sm mt-1">Qatar</p>
            </div>
            
            <div className="w-16 md:w-24 h-px bg-secondary/50" />
            
            <div className="text-center">
              <p className="text-secondary text-3xl md:text-5xl font-light">2026</p>
              <p className="text-primary-foreground/60 text-sm mt-1">EEUU</p>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 text-primary-foreground/50 text-lg max-w-2xl mx-auto"
          >
            Argentina entre dos mundiales: un análisis económico del sueño de todo un país.
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-primary-foreground/40">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-px h-8 bg-primary-foreground/30"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
