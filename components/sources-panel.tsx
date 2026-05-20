"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { DataItem, useData } from "@/lib/data-context"
import { InfoIconSurface } from "@/components/ui/info-icon-button"
import { cn, formatCurrency } from "@/lib/utils"

export interface SourceRow {
  key: string
  descripcion: string
  fuente: string
  fuenteCorta: string
  fechaFuente: string
  periodo: number
  valor?: number
  unidad?: string
}

interface SourcesPanelProps {
  items?: (DataItem | undefined)[]
  extraRows?: SourceRow[]
}

function formatSourceValue(valor: number, unidad?: string) {
  const u = unidad?.trim().toUpperCase()
  if (u === "ARS" || u === "USD") return formatCurrency(valor, unidad)
  return valor.toLocaleString("es-AR")
}

function SourceAttributionLink({
  url,
  corta,
  fecha,
}: {
  url: string
  corta: string
  fecha: string
}) {
  const label = fecha ? `${corta} (${fecha})` : corta
  if (!url.startsWith("http")) return <span>{label}</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer hover:text-primary transition-colors underline underline-offset-2"
    >
      {label}
    </a>
  )
}

export function SourcesPanel({ items = [], extraRows = [] }: SourcesPanelProps) {
  const [open, setOpen] = useState(false)
  const { rawData } = useData()

  const indicadores = new Set(items.filter(Boolean).map((item) => item!.indicador.toLowerCase()))
  const csvRows: SourceRow[] = rawData
    .filter((row) => indicadores.has(row.indicador.toLowerCase()) && row.fuente)
    .map((row, index) => ({
      key: `${row.indicador}-${row.periodo}-${index}`,
      descripcion: row.descripcion || row.indicador,
      valor: row.valor,
      unidad: row.unidad,
      fuente: row.fuente,
      fuenteCorta: row.fuente_corta || "Fuente",
      fechaFuente: row.fecha_fuente || "",
      periodo: row.periodo,
    }))

  const sourceRows = [...csvRows, ...extraRows]

  if (sourceRows.length === 0) return null

  const sortedRows = [...sourceRows].sort((a, b) => {
    const desc = a.descripcion.localeCompare(b.descripcion, "es")
    if (desc !== 0) return desc
    return a.periodo - b.periodo
  })

  return (
    <div className="mt-10 pt-6 border-t border-border/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer flex w-full max-w-full items-center gap-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <InfoIconSurface size="sm" />
        <span className="uppercase tracking-[0.16em]">Fuentes</span>
        <ChevronDown
          strokeWidth={2.6}
          className={cn(
            "ml-auto size-5 shrink-0 text-primary transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
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
              <li key={row.key} className="text-sm text-muted-foreground/85 leading-relaxed">
                {row.valor != null ? (
                  <>
                    {row.descripcion}: {formatSourceValue(row.valor, row.unidad)} — Fuente:{" "}
                  </>
                ) : (
                  <>{row.descripcion} — Fuente: </>
                )}
                <SourceAttributionLink
                  url={row.fuente}
                  corta={row.fuenteCorta}
                  fecha={row.fechaFuente}
                />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
