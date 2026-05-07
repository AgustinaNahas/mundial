"use client"

import Image from "next/image"

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
}: PurchasingPowerPictogramProps) {
  const total = Math.max(count2022, 1)
  const loss = Math.max(0, count2022 - count2026)
  const src = imageFile ? `${BASE_PATH}/${imageFile}` : null

  return (
    <div className="w-full max-w-md p-6 bg-card rounded-lg border border-border">
      <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>
      {footnote ? (
        <p className="text-xs text-muted-foreground mb-5">{footnote}</p>
      ) : (
        <p className="text-xs text-muted-foreground mb-5">
          Referencia: cantidad que alcanzaba un salario mínimo en 2022. Lo que ya no alcanza en 2026 se muestra con menor opacidad
          {loss > 0 ? ` (${loss} ${unitLabel} menos).` : "."}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 items-center leading-none">
        {Array.from({ length: total }).map((_, i) => {
          const faded = i >= count2026
          return (
            <span
              key={i}
              className={`inline-flex size-10 shrink-0 items-center justify-center ${faded ? "opacity-30" : "opacity-100"}`}
            >
              {src ? (
                <Image
                  src={src}
                  alt={imageAlt}
                  width={15}
                  height={30}
                  className="size-full object-cover "
                />
              ) : (
                <span className="text-xl leading-none">{emoji}</span>
              )}
            </span>
          )
        })}
      </div>

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
