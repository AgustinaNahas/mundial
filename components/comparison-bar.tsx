"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  CLOSED_FOLLOW_TIP,
  FollowCursorTooltip,
  bindFollowTooltip,
} from "@/components/follow-cursor-tooltip"
import { useCloseOnScroll } from "@/hooks/use-close-on-scroll"
import {
  MOTION_OFFSET,
  contentEnterInitial,
  contentEnterVisible,
  contentTransition,
  dataTransition,
  fadeInitial,
  fadeVisible,
} from "@/lib/motion"
import { formatCurrency } from "@/lib/utils"

const HATCH_OPACITY = 0.6

// Sueldo en barra 2026 (fondo blanco/primary) → rayas blancas
const HATCH_PATTERN_WHITE = `repeating-linear-gradient(-45deg, transparent 0px, transparent 4px, rgba(255,255,255,${HATCH_OPACITY}) 4px, rgba(255,255,255,${HATCH_OPACITY}) 7px)`

// Sueldo en barra 2022 (fondo celeste/accent) → rayas celestes
const HATCH_PATTERN_CELESTE = `repeating-linear-gradient(-45deg, transparent 0px, transparent 4px, rgba(0,164,220,${HATCH_OPACITY}) 4px, rgba(0,164,220,${HATCH_OPACITY}) 7px)`

interface ComparisonBarProps {
  label: string
  value2022: number
  value2026: number
  unit?: string
  maxValue?: number
  delay?: number
  formatValue?: (value: number) => string
  showChange?: boolean
  referenceValue2022?: number
  referenceValue2026?: number
  referenceLabel?: string
}

export function ComparisonBar({
  label,
  value2022,
  value2026,
  unit = "",
  maxValue,
  delay = 0,
  formatValue,
  showChange = true,
  referenceValue2022,
  referenceValue2026,
  referenceLabel,
}: ComparisonBarProps) {
  const reducedMotion = useReducedMotion() ?? false
  const max = maxValue || Math.max(value2022, value2026)

  const MIN_WIDTH = 12 // % de ancho mínimo para que se vea el número

  const rawWidth2022 = (value2022 / max) * 100
  const rawWidth2026 = (value2026 / max) * 100

  const width2022 = Math.max(rawWidth2022, value2022 === 0 ? 0 : MIN_WIDTH)
  const width2026 = Math.max(rawWidth2026, value2026 === 0 ? 0 : MIN_WIDTH)

  const compact2022 = rawWidth2022 < MIN_WIDTH
  const compact2026 = rawWidth2026 < MIN_WIDTH
  const percentChange =
    value2022 > 0 ? (((value2026 - value2022) / value2022) * 100).toFixed(0) : "0"

  const displayValue = (v: number) => {
    if (formatValue) return formatValue(v)
    return formatCurrency(v, unit)
  }

  const tooltipLines = (
    year: string,
    productValue: number,
    referenceValue: number | undefined,
    productSwatchClass: string,
    referenceSwatchBg: string,
    referenceSwatchPattern: string,
  ) => {
    const multiple =
      referenceLabel != null && referenceValue != null && referenceValue > 0
        ? (productValue / referenceValue).toFixed(1)
        : null
    return (
      <div className="space-y-2 text-left">
        <p className="border-b border-border pb-1 font-semibold">{year}</p>
        <div className="flex items-start gap-2.5">
          <span
            className={`mt-1 size-2.5 shrink-0 rounded-sm ${productSwatchClass}`}
            aria-hidden
          />
          <p className="min-w-0 leading-snug">
            <span className="text-muted-foreground">{label}: </span>
            <span className="font-medium">{displayValue(productValue)}</span>
          </p>
        </div>
        {referenceLabel != null && referenceValue != null && (
          <div className="flex items-start gap-2.5">
            <span
              className="mt-1 size-2.5 shrink-0 rounded-sm"
              style={{ background: referenceSwatchBg, backgroundImage: referenceSwatchPattern }}
              aria-hidden
            />
            <p className="min-w-0 leading-snug">
              <span className="text-muted-foreground">{referenceLabel}: </span>
              <span className="font-medium">{displayValue(referenceValue)}</span>
              {multiple != null && (
                <span className="ml-1 text-muted-foreground">({multiple} sueldos mínimos)</span>
              )}
            </p>
          </div>
        )}
      </div>
    )
  }

  const [tip2022, setTip2022] = useState(CLOSED_FOLLOW_TIP)
  const [tip2026, setTip2026] = useState(CLOSED_FOLLOW_TIP)
  const anyTipOpen = tip2022.open || tip2026.open

  const closeAllTips = () => {
    setTip2022(CLOSED_FOLLOW_TIP)
    setTip2026(CLOSED_FOLLOW_TIP)
  }

  useCloseOnScroll(anyTipOpen, closeAllTips)

  // Cierra ambos tooltips cuando el usuario toca fuera de las barras
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleOutsideTouch = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !containerRef.current?.contains(e.target as Node)) {
        closeAllTips()
      }
    }
    document.addEventListener("pointerdown", handleOutsideTouch)
    return () => document.removeEventListener("pointerdown", handleOutsideTouch)
  }, [])

  const barBaseDelay = delay + 0.12
  const bar2026Delay = barBaseDelay + 0.08

  return (
    <motion.div
      ref={containerRef}
      initial={
        reducedMotion
          ? fadeInitial
          : { ...contentEnterInitial, x: -MOTION_OFFSET.slideX }
      }
      whileInView={
        reducedMotion ? fadeVisible : { ...contentEnterVisible, x: 0 }
      }
      viewport={{ once: true }}
      transition={contentTransition(delay, reducedMotion)}
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-medium text-foreground md:text-base">{label}</h4>
        {showChange && (
          <span className="text-xs font-medium text-accent">
            {Number(percentChange) >= 0 ? "+" : ""}
            {percentChange}%
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* 2022 Bar */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="w-10 shrink-0 text-xs text-muted-foreground sm:w-12">2022</span>
          <div
            className="relative min-w-0 flex-1 cursor-pointer touch-manipulation"
            {...bindFollowTooltip(setTip2022, () => setTip2026(CLOSED_FOLLOW_TIP))}
          >
            <div className="relative flex h-8 min-w-0 flex-row items-stretch overflow-hidden rounded bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width2022}%` }}
                viewport={{ once: true }}
                transition={dataTransition(barBaseDelay, reducedMotion)}
                className="flex h-full shrink-0 items-center justify-end bg-accent pr-0 md:pr-3"
              >
                {!compact2022 && (
                  <span className="hidden truncate px-1 text-xs font-medium text-accent-foreground md:inline">
                    {displayValue(value2022)}
                  </span>
                )}
              </motion.div>
              <span className="max-w-[min(11rem,48vw)] shrink-0 self-center truncate px-1 text-right text-xs font-medium text-accent tabular-nums md:hidden">
                {displayValue(value2022)}
              </span>
              {compact2022 && (
                <div className="hidden items-center truncate pl-2 pr-1 text-xs font-medium text-accent md:flex">
                  {displayValue(value2022)}
                </div>
              )}
              <div className="min-w-0 flex-1" aria-hidden />
              {referenceValue2022 != null && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{
                    width: `${(referenceValue2022 / max) * 100}%`,
                    opacity: 1,
                  }}
                  viewport={{ once: true }}
                  transition={dataTransition(barBaseDelay, reducedMotion)}
                  className="pointer-events-none absolute top-0 left-0 z-10 h-full rounded-l"
                  style={{ backgroundImage: HATCH_PATTERN_CELESTE }}
                />
              )}
            </div>
          </div>
          <FollowCursorTooltip
            open={tip2022.open}
            x={tip2022.x}
            y={tip2022.y}
            placement={tip2022.placement}
          >
            {tooltipLines(
              "2022",
              value2022,
              referenceValue2022,
              "bg-accent",
              "rgba(0, 164, 220, 0.85)",
              HATCH_PATTERN_CELESTE,
            )}
          </FollowCursorTooltip>
        </div>

        {/* 2026 Bar */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="w-10 shrink-0 text-xs text-muted-foreground sm:w-12">2026</span>
          <div
            className="relative min-w-0 flex-1 cursor-pointer touch-manipulation"
            {...bindFollowTooltip(setTip2026, () => setTip2022(CLOSED_FOLLOW_TIP))}
          >
            <div className="relative flex h-8 items-center overflow-hidden rounded bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${width2026}%` }}
                viewport={{ once: true }}
                transition={dataTransition(bar2026Delay, reducedMotion)}
                className="flex h-full shrink-0 items-center justify-end bg-primary pr-3"
              >
                {!compact2026 && (
                  <span className="truncate px-1 text-xs font-medium text-primary-foreground">
                    {displayValue(value2026)}
                  </span>
                )}
              </motion.div>
              {compact2026 && (
                <div className="truncate pl-2 pr-1 text-xs font-medium text-primary">
                  {displayValue(value2026)}
                </div>
              )}
              {referenceValue2026 != null && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{
                    width: `${(referenceValue2026 / max) * 100}%`,
                    opacity: 1,
                  }}
                  viewport={{ once: true }}
                  transition={dataTransition(bar2026Delay, reducedMotion)}
                  className="pointer-events-none absolute top-0 left-0 z-10 h-full rounded-l"
                  style={{ backgroundImage: HATCH_PATTERN_WHITE }}
                />
              )}
            </div>
          </div>
          <FollowCursorTooltip
            open={tip2026.open}
            x={tip2026.x}
            y={tip2026.y}
            placement={tip2026.placement}
          >
            {tooltipLines(
              "2026",
              value2026,
              referenceValue2026,
              "bg-primary",
              "oklch(0.65 0.18 222 / 0.85)",
              HATCH_PATTERN_WHITE,
            )}
          </FollowCursorTooltip>
        </div>

        {referenceLabel && (referenceValue2022 != null || referenceValue2026 != null) && (
          <div className="flex items-center gap-1.5 pl-14 text-xs text-muted-foreground/70 sm:pl-16">
            {referenceValue2022 != null && (
              <div
                className="h-3 w-5 shrink-0 rounded-sm bg-accent/75"
                style={{ backgroundImage: HATCH_PATTERN_CELESTE }}
                aria-hidden
              />
            )}
            {referenceValue2026 != null && (
              <div
                className="h-3 w-5 shrink-0 rounded-sm bg-primary/75"
                style={{ backgroundImage: HATCH_PATTERN_WHITE }}
                aria-hidden
              />
            )}
            <span className="ml-1">{referenceLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
