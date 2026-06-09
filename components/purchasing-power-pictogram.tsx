"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  CLOSED_FOLLOW_TIP,
  FollowCursorTooltip,
  bindFollowTooltip,
} from "@/components/follow-cursor-tooltip"
import { useCloseOnScroll } from "@/hooks/use-close-on-scroll"

import { BASE_PATH } from "@/lib/base-path"

/** Contorno blanco para separar íconos densos (mobile y desktop). */
const PICTO_HALO =
  "drop-shadow-[0_0_1px_#fff] drop-shadow-[0_0_2px_#fff] md:drop-shadow-[0_0_1.5px_#fff] md:drop-shadow-[0_0_3px_#fff]"

const TOOLTIP_CLASS =
  "pointer-events-none z-[100] max-w-xs space-y-1 rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-card-foreground shadow-lg"

export interface PurchasingPowerPictogramProps {
  count2022: number
  count2026: number
  title: string
  footnote?: string
  /** Etiqueta plural para el texto de pérdida, ej. "kilos", "asados", "fernets" */
  unitLabel: string
  emoji?: string
  /** Relativo a `public`, ej. `viajero.webp` → `/viajero.webp` */
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

  const [tip, setTip] = useState(CLOSED_FOLLOW_TIP)
  const containerRef = useRef<HTMLDivElement>(null)

  const closeTip = () => setTip(CLOSED_FOLLOW_TIP)

  useCloseOnScroll(tip.open, closeTip)

  useEffect(() => {
    const handleOutsideTouch = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !containerRef.current?.contains(e.target as Node)) {
        closeTip()
      }
    }
    document.addEventListener("pointerdown", handleOutsideTouch)
    return () => document.removeEventListener("pointerdown", handleOutsideTouch)
  }, [])

  const defaultDescription =
    loss > 0
      ? `Cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad (${loss} ${unitLabel} menos).`
      : "Cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad."

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md md:max-w-xl p-6 bg-card rounded-lg border border-border"
    >
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

      <div
        className="grid grid-cols-8 md:grid-cols-10 gap-0 cursor-pointer touch-manipulation"
        role="img"
        aria-label={`${count2022} ${unitLabel} en 2022, ${count2026} en 2026`}
        {...bindFollowTooltip(setTip, closeTip)}
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

      <FollowCursorTooltip
        open={tip.open}
        x={tip.x}
        y={tip.y}
        placement={tip.placement}
        className={TOOLTIP_CLASS}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          Con un salario mínimo…
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: "oklch(0.97 0.01 220)" }}>
            {count2022}
          </span>
          <span className="text-sm">{unitLabel} en Qatar 2022</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: "oklch(0.65 0.18 222)" }}>
            {count2026}
          </span>
          <span className="text-sm">{unitLabel} en EEUU 2026</span>
        </div>
        {loss > 0 && (
          <p className="pt-1.5 border-t border-border/40 text-xs text-muted-foreground">
            −{loss} {unitLabel} de poder adquisitivo perdido
          </p>
        )}
      </FollowCursorTooltip>

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
