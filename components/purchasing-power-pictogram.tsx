"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const BASE_PATH = "/mundial"

/** Contorno blanco para separar íconos densos (mobile y desktop). */
const PICTO_HALO =
  "drop-shadow-[0_0_1px_#fff] drop-shadow-[0_0_2px_#fff] md:drop-shadow-[0_0_1.5px_#fff] md:drop-shadow-[0_0_3px_#fff]"

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
  /** Nota metodológica mostrada junto al texto descriptivo sobre el pictograma */
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

  const [gridOpen, setGridOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridOpen) return
    const close = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !gridRef.current?.contains(e.target as Node)) {
        setGridOpen(false)
      }
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [gridOpen])

  const tooltipContentClass =
    "max-w-xs leading-relaxed bg-card border border-border text-card-foreground"

  const defaultDescription =
    loss > 0
      ? `Cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad (${loss} ${unitLabel} menos).`
      : "Cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad."

  return (
    <div className="w-full max-w-md md:max-w-xl p-6 bg-card rounded-lg border border-border">
      <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>

      <p className="text-xs text-muted-foreground mb-5">
        {footnote ?? defaultDescription}
        {methodologyNote ? (
          <>
            {" "}
            <span className="block mt-2">{methodologyNote}</span>
          </>
        ) : null}
      </p>

      <Tooltip open={gridOpen} onOpenChange={setGridOpen}>
        <TooltipTrigger asChild>
          <div
            ref={gridRef}
            className="grid grid-cols-8 md:grid-cols-10 gap-0 cursor-default touch-manipulation"
            role="img"
            aria-label={`${count2022} ${unitLabel} en 2022, ${count2026} en 2026`}
            onPointerEnter={(e) => {
              if (e.pointerType !== "touch") setGridOpen(true)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== "touch") setGridOpen(false)
            }}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") {
                e.preventDefault()
                setGridOpen((o) => !o)
              }
            }}
          >
            {Array.from({ length: total }).map((_, i) => {
              const faded = i >= count2026
              return (
                <span
                  key={i}
                  className="flex aspect-square w-full items-center justify-center"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      width={28}
                      height={28}
                      className={`size-[92%] object-contain transition-opacity ${PICTO_HALO} ${faded ? "opacity-25" : "opacity-100"}`}
                    />
                  ) : (
                    <span
                      className={`text-base leading-none select-none transition-opacity md:text-lg ${PICTO_HALO} ${faded ? "opacity-25" : "opacity-100"}`}
                    >
                      {emoji}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} showArrow={false} className={`${tooltipContentClass} space-y-1`}>
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
