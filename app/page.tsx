import { DataProvider } from "@/lib/data-context"
import { debugLog } from "@/lib/debug-log"
import { DebugRenderTracer } from "@/components/debug-render-tracer"
import { HomePageContent } from "@/components/home-page-content"

let homeRenderCount = 0

export default function Home() {
  homeRenderCount += 1
  const renderId = homeRenderCount
  const t0 = Date.now()
  // #region agent log
  debugLog(
    "app/page.tsx:Home",
    "SSR render start",
    { renderId, t0, isServer: typeof window === "undefined" },
    "H3",
  )
  // #endregion

  return (
    <DataProvider>
      <DebugRenderTracer />
      <HomePageContent />
    </DataProvider>
  )
}
