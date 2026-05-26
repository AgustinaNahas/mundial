"use client"

import { Table2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HERO_COPY, SPREADSHEET_URL } from "@/lib/site-copy"
import { cn } from "@/lib/utils"

const shell =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/50 text-primary shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"

const interactive =
  "hover:bg-muted/75 hover:border-border/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"

type SpreadsheetIconLinkProps = {
  className?: string
  label?: string
}

export function SpreadsheetIconLink({
  className,
  label = HERO_COPY.spreadsheetLabel,
}: SpreadsheetIconLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={SPREADSHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(shell, interactive, "size-8 [&_svg]:size-4", className)}
        >
          <Table2 strokeWidth={2.6} className="shrink-0" aria-hidden />
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
