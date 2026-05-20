"use client"

import { motion } from "framer-motion"

interface SectionClosingProps {
  children: string
}

export function SectionClosing({ children }: SectionClosingProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="mt-12 md:mt-16 pt-8 border-t border-border/40 text-lg md:text-xl 
      lg:text-xl font-light italic text-foreground/90 leading-snug 
      max-w-3xl text-balance text-center mx-auto"
    >
      {children}
    </motion.p>
  )
}
