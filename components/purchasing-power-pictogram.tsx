"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIconButton } from "@/components/ui/info-icon-button"

const BASE_PATH = "/mundial"

export interface PurchasingPowerPictogramProps {
  count2022: number
  count2026: number
  title: string
  footnote?: string
  /** Etiqueta plural para el texto de pérdida, ej. "kilos", "asados", "fernets" */
  unitLabel: string
  emoji?: string
  /** Relativo a `public` con basePath, ej. `viajero.webp` → `/mundial/viajero.webp` */
  imageFile?: string
  imageAlt?: string
  /** Nota metodológica que aparece en el tooltip del botón ⓘ */
  methodologyNote?: string
}

export function PurchasingPowerPictogram({
  count2022,
  count2026,
  title,
  footnote,
  unitLabel,
  emoji,
  imageFile,
  imageAlt = "",
  methodologyNote,
}: PurchasingPowerPictogramProps) {
  const total = Math.max(count2022, 1)
  const loss = Math.max(0, count2022 - count2026)
  const src = imageFile ? `${BASE_PATH}/${imageFile}` : null

  // Estado controlado para el tooltip del ⓘ (funciona en mobile con tap)
  const [infoOpen, setInfoOpen] = useState(false)
  const infoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!infoOpen) return
    const close = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !infoRef.current?.contains(e.target as Node)) {
        setInfoOpen(false)
      }
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [infoOpen])

  const tooltipContentClass =
    "max-w-xs leading-relaxed bg-card border border-border text-card-foreground"

  return (
    <div className="w-full max-w-md p-6 bg-card rounded-lg border border-border">
      {/* Título con botón ⓘ opcional */}
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        {methodologyNote && (
          <Tooltip open={infoOpen} onOpenChange={setInfoOpen}>
            <TooltipTrigger asChild>
              <InfoIconButton
                ref={infoRef}
                size="sm"
                label="Nota metodológica"
                onPointerEnter={(e) => { if (e.pointerType !== "touch") setInfoOpen(true) }}
                onPointerLeave={(e) => { if (e.pointerType !== "touch") setInfoOpen(false) }}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") {
                    e.preventDefault()
                    setInfoOpen((o) => !o)
                  }
                }}
              />
            </TooltipTrigger>
            <TooltipContent sideOffset={6} className={tooltipContentClass}>
              {methodologyNote}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {footnote ? (
        <p className="text-xs text-muted-foreground mb-5">{footnote}</p>
      ) : (
        <p className="text-xs text-muted-foreground mb-5">
          Cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad
          {loss > 0 ? ` (${loss} ${unitLabel} menos).` : "."}
        </p>
      )}

      {/* Grid de íconos con tooltip hover (2022 vs 2026) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="grid grid-cols-10 gap-0.5 cursor-default"
            role="img"
            aria-label={`${count2022} ${unitLabel} en 2022, ${count2026} en 2026`}
          >
            {Array.from({ length: total }).map((_, i) => {
              const faded = i >= count2026
              return (
                <span
                  key={i}
                  className={`inline-flex size-8 shrink-0 items-center justify-center transition-opacity ${faded ? "opacity-25" : "opacity-100"}`}
                >
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      width={28}
                      height={28}
                      className="size-full object-contain"
                    />
                  ) : (
                    <span className="text-lg leading-none select-none">{emoji}</span>
                  )}
                </span>
              )
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className={`${tooltipContentClass} space-y-1`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Con un salario mínimo…
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold" style={{ color: "oklch(0.97 0.01 220)" }}>{count2022}</span>
            <span className="text-sm">{unitLabel} en Qatar 2022</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold" style={{ color: "oklch(0.65 0.18 222)" }}>{count2026}</span>
            <span className="text-sm">{unitLabel} en EEUU 2026</span>
          </div>
          {loss > 0 && (
            <p className="pt-1.5 border-t border-border/40 text-xs text-muted-foreground">
              −{loss} {unitLabel} de poder adquisitivo perdido
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      <div className="mt-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{count2022}</span> en 2022
        <span className="mx-2">·</span>
        <span className="font-medium text-foreground">{count2026}</span> en 2026
        {loss > 0 && (
          <span className="mt-1 block text-xs">
            ({loss} {unitLabel} menos con el mismo salario mínimo)
          </span>
        )}
      </div>
    </div>
  )
}
