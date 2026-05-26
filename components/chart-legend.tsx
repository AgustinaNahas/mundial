"use client"

import { CHART_LEGEND_COPY } from "@/lib/site-copy"

const HATCH_OPACITY = 0.6
const HATCH_PATTERN_CELESTE = `repeating-linear-gradient(-45deg, transparent 0px, transparent 4px, rgba(0,164,220,${HATCH_OPACITY}) 4px, rgba(0,164,220,${HATCH_OPACITY}) 7px)`
const HATCH_PATTERN_WHITE = `repeating-linear-gradient(-45deg, transparent 0px, transparent 4px, rgba(255,255,255,${HATCH_OPACITY}) 4px, rgba(255,255,255,${HATCH_OPACITY}) 7px)`

export function ChartLegend() {
  const { ariaLabel, price, salary, percent } = CHART_LEGEND_COPY

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      aria-label={ariaLabel}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="flex shrink-0 gap-0.5" aria-hidden>
          <span className="h-2.5 w-4 rounded-sm bg-accent" />
          <span className="h-2.5 w-4 rounded-sm bg-primary" />
        </span>
        {price}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="flex shrink-0 gap-0.5" aria-hidden>
          <span
            className="h-2.5 w-4 rounded-sm bg-accent/75"
            style={{ backgroundImage: HATCH_PATTERN_CELESTE }}
          />
          <span
            className="h-2.5 w-4 rounded-sm bg-primary/75"
            style={{ backgroundImage: HATCH_PATTERN_WHITE }}
          />
        </span>
        {salary}
      </span>
      <span className="text-muted-foreground/75">{percent}</span>
    </div>
  )
}
