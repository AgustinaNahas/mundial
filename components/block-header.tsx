"use client"

import { motion } from "framer-motion"

interface BlockHeaderProps {
  number: string
  title: string
  subtitle: string
}

export function BlockHeader({ number, title, subtitle }: BlockHeaderProps) {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="py-24 md:py-32 bg-primary text-primary-foreground"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="text-white/25 text-6xl md:text-8xl font-light">
            {number}
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-balance text-white">
              {title}
            </h2>
            <p className="mt-3 text-lg md:text-xl text-white/65 max-w-xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
