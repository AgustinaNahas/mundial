"use client"

import { HeroSection } from "@/components/sections/hero-section"
import { ProgressTracker } from "@/components/progress-tracker"
import HomeSections from "@/components/home-sections"

export function HomePageContent() {
  return (
    <>
      <main className="bg-background min-h-screen pb-20 overflow-x-clip">
        <HeroSection />
        <HomeSections />
      </main>
      <ProgressTracker />
    </>
  )
}
