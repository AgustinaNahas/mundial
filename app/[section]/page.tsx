import { notFound } from "next/navigation"
import { DebugSectionPage } from "@/components/debug/debug-section-page"
import {
  debugSectionRegistry,
  debugSectionSlugs,
  isDebugSectionSlug,
} from "@/components/debug/section-registry"
import { DataProvider } from "@/lib/data-context"

export function generateStaticParams() {
  return debugSectionSlugs.map((section) => ({ section }))
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isDebugSectionSlug(section)) return {}

  return {
    title: `Debug ${debugSectionRegistry[section].label}`,
  }
}

export default async function DebugSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isDebugSectionSlug(section)) notFound()

  return (
    <DataProvider>
      <DebugSectionPage section={section} />
    </DataProvider>
  )
}
