"use client"

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function pushDataLayerEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  if (!window.dataLayer) window.dataLayer = []

  window.dataLayer.push({
    event,
    ...params,
  })
}
