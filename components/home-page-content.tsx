"use client"

import { HeroSection } from "@/components/sections/hero-section"
import { ProgressLayoutProvider } from "@/components/progress-layout-provider"
import { ProgressTracker } from "@/components/progress-tracker"
import HomeSections from "@/components/home-sections"

export function HomePageContent() {
  return (
    <ProgressLayoutProvider>
      <main className="bg-background min-h-screen pb-20 overflow-x-clip">
        <HeroSection />
        <HomeSections />
      </main>
      <ProgressTracker />
    </ProgressLayoutProvider>
  )
}
