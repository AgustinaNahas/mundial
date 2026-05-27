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

interface SectionClosingProps {
  children: string
}

export function SectionClosing({ children }: SectionClosingProps) {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <motion.p
      initial={reducedMotion ? fadeInitial : contentEnterInitial}
      whileInView={reducedMotion ? fadeVisible : contentEnterVisible}
      viewport={{ ...MOTION_VIEWPORT, margin: "-80px" }}
      transition={contentTransition(0, reducedMotion)}
      className="mt-12 md:mt-16 pt-8 border-t border-border/40 text-lg md:text-2xl 
      font-light italic text-foreground/90 leading-snug 
      max-w-3xl text-balance text-center mx-auto"
    >
      {children}
    </motion.p>
  )
}
