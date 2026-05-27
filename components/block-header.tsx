"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  MOTION_VIEWPORT,
  contentEnterInitial,
  contentEnterVisible,
  contentTransition,
  fadeInitial,
  fadeVisible,
} from "@/lib/motion"

interface BlockHeaderProps {
  number: string
  title: string
  subtitle: string
}

export function BlockHeader({ number, title, subtitle }: BlockHeaderProps) {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <motion.section
      initial={reducedMotion ? fadeInitial : contentEnterInitial}
      whileInView={reducedMotion ? fadeVisible : contentEnterVisible}
      viewport={MOTION_VIEWPORT}
      transition={contentTransition(0, reducedMotion)}
      className="py-16 md:py-24 bg-primary text-primary-foreground"
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
