"use client"

import { motion } from "framer-motion"

interface SectionWrapperProps {
  children: React.ReactNode
  number: string
  title: string
  intro?: string
  bgColor?: "background" | "muted"
}

export function SectionWrapper({
  children,
  number,
  title,
  intro,
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
          {intro && (
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {intro}
            </p>
          )}
        </motion.div>

        {children}
      </div>
    </section>
  )
}
