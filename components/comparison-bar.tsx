"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"

interface ComparisonBarProps {
  label: string
  value2022: number
  value2026: number
  unit?: string
  maxValue?: number
  delay?: number
  formatValue?: (value: number) => string
  showChange?: boolean
  referenceValue2022?: number
  referenceValue2026?: number
  referenceLabel?: string
}

export function ComparisonBar({
  label,
  value2022,
  value2026,
  unit = "",
  maxValue,
  delay = 0,
  formatValue,
  showChange = true,
  referenceValue2022,
  referenceValue2026,
  referenceLabel,
}: ComparisonBarProps) {
  const max = maxValue || Math.max(value2022, value2026)

  const MIN_WIDTH = 12 // % de ancho mínimo para que se vea el número

  const rawWidth2022 = (value2022 / max) * 100
  const rawWidth2026 = (value2026 / max) * 100

  const width2022 = Math.max(rawWidth2022, value2022 === 0 ? 0 : MIN_WIDTH)
  const width2026 = Math.max(rawWidth2026, value2026 === 0 ? 0 : MIN_WIDTH)

  const compact2022 = rawWidth2022 < MIN_WIDTH
  const compact2026 = rawWidth2026 < MIN_WIDTH
  const percentChange = value2022 > 0 ? ((value2026 - value2022) / value2022 * 100).toFixed(0) : "0"
  
  const displayValue = (v: number) => {
    if (formatValue) return formatValue(v)
    return formatCurrency(v, unit)
  }
  
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
          <div className="flex-1 h-8 bg-muted rounded relative overflow-hidden flex items-center">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${width2022}%` }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-accent flex items-center justify-end pr-3 shrink-0"
            >
              {!compact2022 && (
                <span className="text-xs font-medium text-accent-foreground truncate px-1">
                  {displayValue(value2022)}
                </span>
              )}
            </motion.div>
            {compact2022 && (
              <div className="pl-2 pr-1 text-xs font-medium text-accent truncate shrink-0">
                {displayValue(value2022)}
              </div>
            )}
            {referenceValue2022 != null && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${(referenceValue2022 / max) * 100}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: delay + 0.9, duration: 0.6, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full z-10 pointer-events-none rounded"
                style={{ border: "2px dashed rgba(0, 164, 220, 0.9)", background: "transparent" }}
              />
            )}
          </div>
        </div>

        {/* 2026 Bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-12">2026</span>
          <div className="flex-1 h-8 bg-muted rounded relative overflow-hidden flex items-center">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${width2026}%` }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary flex items-center justify-end pr-3 shrink-0"
            >
              {!compact2026 && (
                <span className="text-xs font-medium text-primary-foreground truncate px-1">
                  {displayValue(value2026)}
                </span>
              )}
            </motion.div>
            {compact2026 && (
              <div className="pl-2 pr-1 text-xs font-medium text-primary truncate shrink-0">
                {displayValue(value2026)}
              </div>
            )}
            {referenceValue2026 != null && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${(referenceValue2026 / max) * 100}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: delay + 1.1, duration: 0.6, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full z-10 pointer-events-none rounded"
                style={{ border: "2px dashed rgba(255,255,255,0.9)", background: "transparent" }}
              />
            )}
          </div>
        </div>

        {referenceLabel && (referenceValue2022 != null || referenceValue2026 != null) && (
          <div className="flex items-center pl-16 text-xs text-muted-foreground/70">
            <div className="w-6 h-4 shrink-0 rounded-l " style={{ borderTop: "2px dashed rgba(0, 164, 220, 0.75)", borderBottom: "2px dashed rgba(0, 164, 220, 0.75)", borderLeft: "2px dashed rgba(0, 164, 220, 0.75)" }} />
            <div className="w-6 h-4 shrink-0 rounded-r mr-4" style={{ borderTop: "2px dashed rgba(255,255,255,0.75)", borderBottom: "2px dashed rgba(255,255,255,0.75)", borderRight:"2px dashed rgba(255,255,255,0.75)" }} />
            <span>{referenceLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
