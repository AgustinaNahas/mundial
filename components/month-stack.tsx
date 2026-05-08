"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { cn } from "@/lib/utils"

const LABOR_WORK_DAYS_PER_MONTH = 22

/** Equivalente meses SMVM → "X meses de trabajo", o "X días de trabajo" si equivalen a menos de 22 días hábiles. */
export function formatLaborDurationFromSalaryMonths(months: number): string {
  if (months <= 0) return "—"
  const workDays = months * LABOR_WORK_DAYS_PER_MONTH
  if (workDays < LABOR_WORK_DAYS_PER_MONTH) {
    const d = Math.max(1, Math.round(workDays))
    return d === 1 ? "1 día de trabajo" : `${d} días de trabajo`
  }
  const rounded = Math.round(months * 10) / 10
  const label = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1).replace(".", ",")
  return rounded === 1 ? "1 mes de trabajo" : `${label} meses de trabajo`
}

function MiniMonthCalendar({
  progress,
  color,
  label,
}: {
  progress: number
  color: string
  label: string
}) {
  const DAYS_IN_MONTH = 31
  const WORK_DAYS_PER_MONTH = 22
  const COLS = 7
  const ROWS = 6
  const viewSize = 100
  const pad = 8
  const gap = 2
  const cell = (viewSize - pad * 2 - gap * (COLS - 1)) / COLS
  const labels = ["D", "L", "M", "M", "J", "V", "S"]
  const rootRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(rootRef, { once: true, amount: 0.35 })
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const filledWorkDays = Math.max(0, Math.min(WORK_DAYS_PER_MONTH, Math.round(animatedProgress * WORK_DAYS_PER_MONTH)))
  let seenWorkdays = 0

  useEffect(() => {
    if (!isInView) return
    let raf = 0
    const duration = 700
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // Easing suave al final para que "encienda" más orgánico
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedProgress(progress * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, progress])

  return (
    <div ref={rootRef} className="space-y-1">
      <div className="grid grid-cols-7 gap-0.5 px-1">
        {labels.map((l, i) => (
          <span key={`${label}-${l}-${i}`} className={cn("text-[7px] sm:text-[8px] text-center", i === 0 || i === 6 ? "text-muted-foreground/35" : "text-muted-foreground/55")}>
            {l}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-[78px] h-[78px] sm:w-[92px] sm:h-[92px] rounded-md border border-border/30 bg-card">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const row = Math.floor(idx / COLS)
          const col = idx % COLS
          const x = pad + col * (cell + gap)
          const y = pad + row * (cell + gap)
          const inMonth = idx < DAYS_IN_MONTH
          const isWeekendCol = col === 0 || col === 6
          const isWorkday = inMonth && !isWeekendCol
          if (isWorkday) seenWorkdays += 1
          const isFilled = isWorkday && seenWorkdays <= filledWorkDays

          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx={1.6}
              fill={
                !inMonth
                  ? "transparent"
                  : isFilled
                  ? color
                  : "oklch(0.22 0.07 255 / 0.85)"
              }
              stroke={!inMonth ? "none" : "oklch(0.30 0.09 252 / 0.9)"}
              strokeWidth={0.4}
            />
          )
        })}
      </svg>
      <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center">{label}</p>
    </div>
  )
}

export function MonthStack({
  months,
  color,
  toneClass,
  align = "left",
  className,
}: {
  months: number
  color: string
  toneClass: string
  align?: "left" | "right"
  className?: string
}) {
  const fullMonths = Math.floor(months)
  const remainder = months - fullMonths
  const blocks = [
    ...Array.from({ length: fullMonths }, () => 1),
    ...(remainder > 0 ? [remainder] : []),
  ]

  return (
    <div className={cn("flex flex-col w-full md:max-w-[min(100%,13rem)]", className)}>
      <div
        className={cn(
          "w-full gap-x-3 gap-y-2 max-md:grid max-md:grid-cols-2 max-md:gap-x-2 max-md:gap-y-3 max-md:justify-items-center",
          "md:flex md:flex-wrap",
          align === "right" ? "md:justify-end" : "md:justify-start",
        )}
      >
        {blocks.map((p, i) => (
          <MiniMonthCalendar key={i} progress={p} color={color} label={`Mes ${i + 1}`} />
        ))}
      </div>
      <p
        className={cn(
          "text-xs font-medium mt-2 leading-snug tabular-nums text-center",
          toneClass,
          // align === "right" ? "text-right" : "text-left",
        )}
      >
        {formatLaborDurationFromSalaryMonths(months)}
      </p>
    </div>
  )
}
