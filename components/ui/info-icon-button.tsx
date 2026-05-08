"use client"

import { forwardRef } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

/** Contenedor del icono: un solo borde neutro (sin borde celeste exterior). */
const shell =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/50 text-primary shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"

const interactive =
  "hover:bg-muted/75 hover:border-border/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"

const sizes = {
  default: "size-9 [&_svg]:size-[1.125rem]",
  sm: "size-8 [&_svg]:size-4",
}

/** Icono decorativo (ej. dentro del botón “Fuentes”, sin anidar otro botón). */
export function InfoIconSurface({
  className,
  size = "default",
}: {
  className?: string
  size?: keyof typeof sizes
}) {
  return (
    <span className={cn(shell, sizes[size], className)} aria-hidden>
      <Info strokeWidth={2.6} className="shrink-0" />
    </span>
  )
}

export type InfoIconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** aria-label del botón */
  label?: string
  size?: keyof typeof sizes
}

export const InfoIconButton = forwardRef<HTMLButtonElement, InfoIconButtonProps>(function InfoIconButton(
  { className, label = "Más información", size = "default", type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} className={cn(shell, interactive, sizes[size], className)} {...props}>
      <Info strokeWidth={2.6} className="shrink-0" aria-hidden />
    </button>
  )
})

InfoIconButton.displayName = "InfoIconButton"
