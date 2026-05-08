"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  debugSectionRegistry,
  debugSectionSlugs,
  type DebugSectionSlug,
} from "@/components/debug/section-registry"

export function DebugSectionPage({ section }: { section: DebugSectionSlug }) {
  const config = debugSectionRegistry[section]
  const activeLinkClass = "rounded-full bg-primary px-3 py-1 text-primary-foreground"
  const inactiveLinkClass = "rounded-full border border-border/40 px-3 py-1 hover:text-foreground"
  const Section = useMemo(
    () =>
      dynamic(config.load, {
        loading: () => (
          <div className="min-h-[40vh] w-full animate-pulse rounded-2xl bg-muted/25" />
        ),
      }),
    [config.load],
  )

  const [showDebug, setShowDebug] = useState(false)

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground pt-6">
      <button type="button" className="absolute top-0 right-0 z-500" onClick={() => setShowDebug(prev => !prev)}>
        {showDebug ? "Hide debug" : "Show debug"}
      </button>
      <div style={{ display: showDebug ? "block" : "none" }} className="sticky top-0 z-[1000] border-b border-border/40 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-3 px-6 py-4 md:px-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Debug section</p>
            <h1 className="mt-1 text-2xl font-light tracking-tight">{config.label}</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
            {debugSectionSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className={slug === section ? activeLinkClass : inactiveLinkClass}
              >
                {slug}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <Section />
    </main>
  )
}
