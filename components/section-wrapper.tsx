"use client"

import { motion } from "framer-motion"

interface SectionWrapperProps {
  children: React.ReactNode
  number: string
  title: string
  insight?: string
  bgColor?: "background" | "muted"
}

export function SectionWrapper({ 
  children, 
  number, 
  title, 
  insight,
  bgColor = "background" 
}: SectionWrapperProps) {
  return (
    <section className={`py-20 md:py-28 ${bgColor === "muted" ? "bg-muted" : "bg-background"}`}>
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="text-accent text-sm font-medium tracking-wide">{number}</span>
          <h3 className="text-2xl md:text-4xl font-light text-foreground mt-2 tracking-tight text-balance">
            {title}
          </h3>
        </motion.div>
        
        {children}
        
        {insight && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-border"
          >
            <p className="text-lg md:text-xl text-muted-foreground italic max-w-2xl">
              "{insight}"
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
