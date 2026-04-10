"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DataItem } from "@/lib/data-context"

interface SourcesPanelProps {
  items: (DataItem | undefined)[]
}

export function SourcesPanel({ items }: SourcesPanelProps) {
  const [open, setOpen] = useState(false)

  const sources = Array.from(
    new Set(
      items.flatMap(item =>
        item ? [item.fuente_2022, item.fuente_2026].filter(Boolean) : []
      )
    )
  ) as string[]

  if (sources.length === 0) return null

  return (
    <div className="mt-10 pt-6 border-t border-border/40">
      <button
        onClick={() => setOpen(v => !v)}
        className="cursor-pointer flex items-center gap-2 text-muted-foreground/80 hover:text-foreground transition-colors text-xs group"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current text-[10px] font-bold leading-none shrink-0 group-hover:bg-primary/10 transition-colors">
          i
        </span>
        <span className="uppercase tracking-[0.18em]">Fuentes</span>
        <span className="ml-1 opacity-70 text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 space-y-1.5 overflow-hidden"
          >
            {sources.map((src, i) => (
              <li key={i} className="text-[12px] text-muted-foreground/75 leading-relaxed">
                {src.startsWith("http") ? (
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:text-primary transition-colors underline underline-offset-2"
                  >
                    {src}
                  </a>
                ) : (
                  <span>{src}</span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
