"use client"

import { motion } from "framer-motion"

interface IconGridProps {
  count: number
  icon: React.ReactNode
  label: string
  delay?: number
}

export function IconGrid({ count, icon, label, delay = 0 }: IconGridProps) {
  const displayCount = Math.min(count, 50)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="space-y-3"
    >
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: displayCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + (i * 0.02), duration: 0.3 }}
            className="text-accent"
          >
            {icon}
          </motion.div>
        ))}
        {count > 50 && (
          <span className="text-muted-foreground text-sm self-center ml-2">
            +{count - 50} más
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}
