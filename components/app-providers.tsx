"use client"

import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={120}>
      {children}
    </TooltipProvider>
  )
}
