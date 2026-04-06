"use client"

import { motion } from "framer-motion"

interface StatCardProps {
  value: string | number
  label: string
  subtext?: string
  delay?: number
  variant?: "default" | "highlight"
}

export function StatCard({ value, label, subtext, delay = 0, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className={`p-6 rounded-lg ${
        variant === "highlight" 
          ? "bg-primary text-primary-foreground" 
          : "bg-card border border-border"
      }`}
    >
      <p className={`text-3xl md:text-4xl font-light ${
        variant === "highlight" ? "text-secondary" : "text-accent"
      }`}>
        {value}
      </p>
      <p className={`mt-2 text-sm font-medium ${
        variant === "highlight" ? "text-primary-foreground" : "text-foreground"
      }`}>
        {label}
      </p>
      {subtext && (
        <p className={`mt-1 text-xs ${
          variant === "highlight" ? "text-primary-foreground/60" : "text-muted-foreground"
        }`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}
