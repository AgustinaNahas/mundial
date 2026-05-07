"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DataItem, useData } from "@/lib/data-context"

interface SourcesPanelProps {
  items: (DataItem | undefined)[]
}

export function SourcesPanel({ items }: SourcesPanelProps) {
  const [open, setOpen] = useState(false)
  const { rawData } = useData()

  const indicadores = new Set(items.filter(Boolean).map((item) => item!.indicador.toLowerCase()))
  const sourceRows = rawData
    .filter((row) => indicadores.has(row.indicador.toLowerCase()) && row.fuente)
    .map((row, index) => ({
      key: `${row.indicador}-${row.periodo}-${index}`,
      descripcion: row.descripcion || row.indicador,
      fuente: row.fuente,
      fuenteCorta: row.fuente_corta || "Fuente",
      fechaFuente: row.fecha_fuente || "",
      periodo: row.periodo,
    }))

  if (sourceRows.length === 0) return null

  const sortedRows = [...sourceRows].sort((a, b) => {
    const desc = a.descripcion.localeCompare(b.descripcion, "es")
    if (desc !== 0) return desc
    return a.periodo - b.periodo
  })

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
            {sortedRows.map((row) => (
              <li key={row.key} className="text-[12px] text-muted-foreground/75 leading-relaxed">
                {row.fuente.startsWith("http") ? (
                  <a
                    href={row.fuente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:text-primary transition-colors underline underline-offset-2"
                  >
                    {row.descripcion} - Fuente: {row.fuenteCorta + " "}
                    {row.fechaFuente ? `(${row.fechaFuente})` : ""}
                  </a>
                ) : (
                  <span>
                    {row.descripcion} - Fuente: {row.fuenteCorta + " "}
                    {row.fechaFuente ? `(${row.fechaFuente})` : ""}
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
