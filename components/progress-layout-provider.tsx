"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useProgressLayout } from "@/hooks/use-progress-layout"
import type { ProgressLayout } from "@/lib/progress-layout"

type ProgressLayoutContextValue = {
  layout: ProgressLayout | null
  festejoUnlocked: boolean
}

const ProgressLayoutContext = createContext<ProgressLayoutContextValue>({
  layout: null,
  festejoUnlocked: false,
})

export function ProgressLayoutProvider({ children }: { children: ReactNode }) {
  const { layout, festejoUnlocked } = useProgressLayout()

  return (
    <ProgressLayoutContext.Provider value={{ layout, festejoUnlocked }}>
      {children}
    </ProgressLayoutContext.Provider>
  )
}

export function useProgressLayoutContext() {
  return useContext(ProgressLayoutContext)
}
