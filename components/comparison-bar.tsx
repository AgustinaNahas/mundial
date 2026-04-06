"use client"

import { motion } from "framer-motion"

interface ComparisonBarProps {
  label: string
  value2022: number
  value2026: number
  unit?: string
  maxValue?: number
  delay?: number
  formatValue?: (value: number) => string
  showChange?: boolean
}

export function ComparisonBar({ 
  label, 
  value2022, 
  value2026, 
  unit = "", 
  maxValue,
  delay = 0,
  formatValue,
  showChange = true
}: ComparisonBarProps) {
  const max = maxValue || Math.max(value2022, value2026) * 1.2
  const width2022 = (value2022 / max) * 100
  const width2026 = (value2026 / max) * 100
  const percentChange = value2022 > 0 ? ((value2026 - value2022) / value2022 * 100).toFixed(0) : "0"
  
  const displayValue = (v: number) => formatValue ? formatValue(v) : `${unit}${v.toLocaleString('es-AR')}`
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm md:text-base font-medium text-foreground">{label}</h4>
        {showChange && (
          <span className="text-xs text-accent font-medium">
            {Number(percentChange) >= 0 ? "+" : ""}{percentChange}%
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {/* 2022 Bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-12">2022</span>
          <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${width2022}%` }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary flex items-center justify-end pr-3"
            >
              <span className="text-xs font-medium text-primary-foreground">
                {displayValue(value2022)}
              </span>
            </motion.div>
          </div>
        </div>
        
        {/* 2026 Bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-12">2026</span>
          <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${width2026}%` }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-accent flex items-center justify-end pr-3"
            >
              <span className="text-xs font-medium text-accent-foreground">
                {displayValue(value2026)}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
