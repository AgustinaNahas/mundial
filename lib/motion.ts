import type { Transition, Variants } from "framer-motion"

/** Curva editorial única — aceleración suave, aterrizaje sin rebote. */
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const MOTION_DURATION = {
  /** Entradas de texto / bloques */
  content: 0.5,
  /** Barras, datos, hatch overlays */
  data: 0.7,
  /** Hover, toggles, feedback inmediato */
  micro: 0.2,
  /** Hero — un poco más largo pero mucho más corto que antes */
  hero: 0.55,
  /** Loops (scroll cue, etc.) */
  loop: 1.6,
} as const

export const MOTION_OFFSET = {
  contentY: 12,
  heroY: 16,
  slideX: 12,
} as const

export const MOTION_VIEWPORT = {
  once: true,
  margin: "-100px",
} as const

export const MOTION_STAGGER = {
  hero: 0.07,
  heroChildDelay: 0.04,
} as const

export function contentTransition(delay = 0, reduced = false): Transition {
  if (reduced) {
    return { duration: MOTION_DURATION.micro, delay: delay > 0 ? delay * 0.5 : 0 }
  }
  return {
    duration: MOTION_DURATION.content,
    ease: [...MOTION_EASE],
    delay,
  }
}

export function dataTransition(delay = 0, reduced = false): Transition {
  if (reduced) {
    return { duration: MOTION_DURATION.micro, delay: delay > 0 ? delay * 0.5 : 0 }
  }
  return {
    duration: MOTION_DURATION.data,
    ease: [...MOTION_EASE],
    delay,
  }
}

export function heroTransition(delay = 0, reduced = false): Transition {
  if (reduced) {
    return { duration: MOTION_DURATION.micro, delay: delay > 0 ? delay * 0.4 : 0 }
  }
  return {
    duration: MOTION_DURATION.hero,
    ease: [...MOTION_EASE],
    delay,
  }
}

/** Variants para hero con stagger unificado. */
export function heroContainerVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: MOTION_DURATION.micro } },
    }
  }
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: MOTION_STAGGER.hero,
        delayChildren: MOTION_STAGGER.heroChildDelay,
      },
    },
  }
}

export function heroItemVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  }
  return {
    hidden: { opacity: 0, y: MOTION_OFFSET.heroY },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATION.hero,
        ease: [...MOTION_EASE],
      },
    },
  }
}

export const contentEnterInitial = { opacity: 0, y: MOTION_OFFSET.contentY }
export const contentEnterVisible = { opacity: 1, y: 0 }

export const fadeInitial = { opacity: 0 }
export const fadeVisible = { opacity: 1 }
