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
  /** No muestra el valor numérico junto a la descripción (p. ej. secciones con muchos datos). */
  hideValues?: boolean
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

export function SourcesPanel({ items = [], extraRows = [], hideValues = false }: SourcesPanelProps) {
  const [open, setOpen] = useState(false)
  const { rawData } = useData()

  const indicadores = new Set(items.filter(Boolean).map((item) => item!.indicador.toLowerCase()))
  const csvRows: SourceRow[] = rawData
    .filter((row) => indicadores.has(row.indicador.toLowerCase()) && row.fuente)
    .map((row, index) => ({
      key: `${row.indicador}-${row.periodo}-${index}`,
      descripcion: row.descripcion || row.indicador,
      valor: hideValues ? undefined : row.valor,
      unidad: hideValues ? undefined : row.unidad,
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
    <div className="mt-8 pt-4 border-t border-border/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer flex w-full max-w-full items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <InfoIconSurface size="sm" />
        <span className="uppercase tracking-[0.14em]">Fuentes</span>
        <ChevronDown
          strokeWidth={2.6}
          className={cn(
            "ml-auto size-4 shrink-0 text-primary transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 overflow-hidden overflow-x-auto"
          >
            <table className="w-full min-w-[280px] md:mt-6 text-xs text-muted-foreground/85 border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-left text-[10px] 
                uppercase tracking-[0.12em] text-muted-foreground bg-muted/50">
                  <th className="py-1.5 pr-3 font-bold pl-4">Indicador</th>
                  <th className="py-1.5 pr-3 font-bold whitespace-nowrap">Valor</th>
                  <th className="py-1.5 font-bold">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-border/30 last:border-0 align-top even:bg-muted/50"
                  >
                    <td className="py-1.5 pr-3 leading-snug pl-4">{row.descripcion}</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap tabular-nums">
                      {row.valor != null ? formatSourceValue(row.valor, row.unidad) : "—"}
                    </td>
                    <td className="py-1.5 leading-snug">
                      <SourceAttributionLink
                        url={row.fuente}
                        corta={row.fuenteCorta}
                        fecha={row.fechaFuente}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
