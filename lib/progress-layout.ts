/**
 * Layout virtual para el medidor de avance y alturas de skeleton.
 * Alturas medidas con `node scripts/measure-progress-layout.mjs` (página cargada + carta desbloqueada).
 */

export type ProgressBreakpoint = "mobile" | "desktop"

export type NarrativeBlockId = "previa" | "mundial" | "festejo" | "gente"

export type ProgressSectionId =
  | "album"
  | "playstation"
  | "pelota"
  | "camiseta"
  | "cancha"
  | "mate"
  | "asado"
  | "carta"
  | "fernet"
  | "micro"
  | "ninos"
  | "jubilacion"
  | "derechos"

/** Secciones lazy con skeleton; incluye las que no están en el medidor de avance. */
export type LazySectionId = ProgressSectionId | "resumen" | "cierre"

export type ProgressLayoutSegment = {
  sectionId: ProgressSectionId | "carta-locked"
  blockId: NarrativeBlockId | "mundial"
  top: number
  height: number
}

export type ProgressLayout = {
  breakpoint: ProgressBreakpoint
  festejoUnlocked: boolean
  segments: ProgressLayoutSegment[]
  /** Origen del recorrido (top del primer ancla, px documento). */
  trackOrigin: number
  /** Fin del recorrido (bottom del último ancla, px documento). */
  trackEnd: number
  /** trackEnd - trackOrigin */
  trackSpan: number
  totalHeight: number
  dotPositions: number[]
  blockRanges: { id: NarrativeBlockId; start: number; end: number }[]
}

export const PROGRESS_BLOCKS = [
  { id: "previa" as const, label: "La Previa", short: "Previa" },
  { id: "mundial" as const, label: "El Mundial", short: "Mundial" },
  { id: "festejo" as const, label: "El Festejo", short: "Festejo" },
  { id: "gente" as const, label: "La Gente", short: "Gente" },
]

const BLOCK_IDS = new Set(PROGRESS_BLOCKS.map(b => b.id))

/** Espacio hero + cabecera de bloque antes del primer ancla (medido). */
export const PROGRESS_PREFIX_PX: Record<ProgressBreakpoint, number> = {
  mobile: 974,
  desktop: 1148,
}

/** Cabeceras de bloque entre previa → mundial → festejo → gente (medido). */
export const BLOCK_HEADER_GAP_PX: Record<ProgressBreakpoint, number> = {
  mobile: 283,
  desktop: 335,
}

/** Alturas de sección en px (contenido con padding, post-carga). */
export const SECTION_HEIGHT_PX: Record<
  ProgressSectionId,
  Record<ProgressBreakpoint, number>
> = {
  album: { mobile: 2572, desktop: 2351 },
  playstation: { mobile: 960, desktop: 1088 },
  pelota: { mobile: 840, desktop: 1219 },
  camiseta: { mobile: 808, desktop: 1099 },
  cancha: { mobile: 6186, desktop: 4907 },
  mate: { mobile: 1639, desktop: 1252 },
  asado: { mobile: 1251, desktop: 927 },
  carta: { mobile: 592, desktop: 701 },
  fernet: { mobile: 1456, desktop: 1178 },
  micro: { mobile: 3295, desktop: 4663 },
  ninos: { mobile: 2458, desktop: 1652 },
  jubilacion: { mobile: 1271, desktop: 947 },
  derechos: { mobile: 1285, desktop: 1352 },
}

/** Alturas de skeleton para secciones fuera del medidor de avance. */
const SKELETON_EXTRA_HEIGHT_PX: Record<
  Exclude<LazySectionId, ProgressSectionId>,
  Record<ProgressBreakpoint, number>
> = {
  resumen: { mobile: 920, desktop: 1080 },
  cierre: { mobile: 640, desktop: 780 },
}

/** Carta antes de desbloquear festejo: pantalla completa. */
export function cartaLockedHeightPx(breakpoint: ProgressBreakpoint, viewportHeight: number): number {
  return viewportHeight
}

const PREVIA_ORDER: ProgressSectionId[] = ["album", "playstation", "pelota", "camiseta"]
const MUNDIAL_ORDER: ProgressSectionId[] = ["cancha", "mate", "asado"]
const FESTEJO_ORDER: ProgressSectionId[] = ["fernet", "micro"]
export const GENTE_SECTION_IDS: ProgressSectionId[] = ["ninos", "jubilacion", "derechos"]
const GENTE_ORDER = GENTE_SECTION_IDS

export function resolveBreakpoint(width: number): ProgressBreakpoint {
  return width < 768 ? "mobile" : "desktop"
}

export function sectionSkeletonMinHeight(
  sectionId: LazySectionId,
  breakpoint: ProgressBreakpoint,
): string | undefined {
  const row =
    SECTION_HEIGHT_PX[sectionId as ProgressSectionId] ??
    SKELETON_EXTRA_HEIGHT_PX[sectionId as keyof typeof SKELETON_EXTRA_HEIGHT_PX]
  const px = row?.[breakpoint]
  return px != null ? `${px}px` : undefined
}

/** Cabecera típica de SectionWrapper (número + título + intro) — para reservar alto del contenido. */
export const SECTION_HEADER_ESTIMATE_PX: Record<ProgressBreakpoint, number> = {
  mobile: 248,
  desktop: 312,
}

/** Alto mínimo del área de contenido (sin header) para evitar saltos al cargar datos. */
export function sectionContentMinHeight(
  sectionId: LazySectionId,
  breakpoint: ProgressBreakpoint,
): number | undefined {
  const totalPx =
    SECTION_HEIGHT_PX[sectionId as ProgressSectionId]?.[breakpoint] ??
    SKELETON_EXTRA_HEIGHT_PX[sectionId as keyof typeof SKELETON_EXTRA_HEIGHT_PX]?.[breakpoint]
  if (totalPx == null) return undefined
  return Math.max(totalPx - SECTION_HEADER_ESTIMATE_PX[breakpoint], 280)
}

type StackEntry = {
  sectionId: ProgressSectionId | "carta-locked"
  blockId: NarrativeBlockId | "mundial"
  height: number
}

function buildStack(
  breakpoint: ProgressBreakpoint,
  festejoUnlocked: boolean,
  viewportHeight: number,
): StackEntry[] {
  const h = (id: ProgressSectionId) => SECTION_HEIGHT_PX[id][breakpoint]
  const stack: StackEntry[] = [
    ...PREVIA_ORDER.map(id => ({ sectionId: id, blockId: "previa" as const, height: h(id) })),
  ]

  stack.push(
    ...MUNDIAL_ORDER.map(id => ({ sectionId: id, blockId: "mundial" as const, height: h(id) })),
    {
      sectionId: festejoUnlocked ? "carta" : "carta-locked",
      blockId: "mundial",
      height: festejoUnlocked ? h("carta") : cartaLockedHeightPx(breakpoint, viewportHeight),
    },
  )

  if (festejoUnlocked) {
    stack.push(
      ...FESTEJO_ORDER.map(id => ({ sectionId: id, blockId: "festejo" as const, height: h(id) })),
      ...GENTE_ORDER.map(id => ({ sectionId: id, blockId: "gente" as const, height: h(id) })),
    )
  }

  return stack
}

function needsBlockHeaderGap(prev: NarrativeBlockId | "mundial", next: NarrativeBlockId | "mundial"): boolean {
  return (
    (prev === "previa" && next === "mundial") ||
    (prev === "mundial" && next === "festejo") ||
    (prev === "festejo" && next === "gente")
  )
}

export function buildEstimatedLayout(
  breakpoint: ProgressBreakpoint,
  festejoUnlocked: boolean,
  viewportHeight: number,
): ProgressLayout {
  const stack = buildStack(breakpoint, festejoUnlocked, viewportHeight)
  const gap = BLOCK_HEADER_GAP_PX[breakpoint]
  let y = PROGRESS_PREFIX_PX[breakpoint]
  let prevBlock: StackEntry["blockId"] | null = null
  const segments: ProgressLayoutSegment[] = []

  for (const entry of stack) {
    if (prevBlock && needsBlockHeaderGap(prevBlock, entry.blockId)) {
      y += gap
    }
    segments.push({
      sectionId: entry.sectionId,
      blockId: entry.blockId,
      top: y,
      height: entry.height,
    })
    y += entry.height
    prevBlock = entry.blockId
  }

  return finalizeLayout(breakpoint, festejoUnlocked, segments)
}

function finalizeLayout(
  breakpoint: ProgressBreakpoint,
  festejoUnlocked: boolean,
  segments: ProgressLayoutSegment[],
): ProgressLayout {
  const dotSegs = segments.filter(seg => seg.sectionId !== "carta-locked")
  const trackOrigin = dotSegs[0]?.top ?? 0
  const trackEnd =
    (dotSegs[dotSegs.length - 1]?.top ?? 0) +
    (dotSegs[dotSegs.length - 1]?.height ?? 0)
  const trackSpan = Math.max(trackEnd - trackOrigin, 1)
  const totalHeight = segments.reduce((sum, s) => sum + s.height, 0)

  /** Posición en barra = inicio real de sección en el documento (fija tras calibrar). */
  const dotPositions = dotSegs.map(
    seg => ((seg.top - trackOrigin) / trackSpan) * 100,
  )

  const blockRanges = PROGRESS_BLOCKS.map(b => {
    const blockSegs = segments.filter(s => s.blockId === b.id)
    if (blockSegs.length === 0) return { id: b.id, start: 0, end: 0 }
    const startPx = blockSegs[0].top - trackOrigin
    const endPx =
      blockSegs[blockSegs.length - 1].top +
      blockSegs[blockSegs.length - 1].height -
      trackOrigin
    return {
      id: b.id,
      start: startPx / trackSpan,
      end: endPx / trackSpan,
    }
  })

  return {
    breakpoint,
    festejoUnlocked,
    segments,
    trackOrigin,
    trackEnd,
    trackSpan,
    totalHeight,
    dotPositions,
    blockRanges,
  }
}

/** Segmentos que muestran un punto en la barra (sin placeholder de carta bloqueada). */
export function getProgressDotSegments(layout: ProgressLayout): ProgressLayoutSegment[] {
  return layout.segments.filter(seg => seg.sectionId !== "carta-locked")
}

/** Prende cuando el pivote alcanza la posición del punto en la barra (misma escala que la pelota). */
export function isProgressDotLit(
  layout: ProgressLayout,
  scrollY: number,
  windowHeight: number,
  dotIndex: number,
): boolean {
  const threshold = layout.dotPositions[dotIndex]
  if (threshold == null) return false
  const progress = computeProgressFromLayout(layout, scrollY, windowHeight)
  return progress >= threshold
}

function resolveDomSectionId(sectionId: ProgressLayoutSegment["sectionId"]): string {
  return sectionId === "carta-locked" ? "carta" : sectionId
}

export function isProgressSectionInDom(sectionId: ProgressSectionId): boolean {
  return Boolean(
    document.querySelector(`[data-progress-section="${sectionId}"]`),
  )
}

export function areGenteSectionsInDom(): boolean {
  return GENTE_SECTION_IDS.every(isProgressSectionInDom)
}

function isSegmentInDom(seg: ProgressLayoutSegment): boolean {
  if (seg.sectionId === "carta-locked") return isProgressSectionInDom("carta")
  return isProgressSectionInDom(seg.sectionId)
}

/** Fracción 0–1 en la barra, con margen para que el último punto no se recorte. */
export function dotBarPosition(layout: ProgressLayout, dotIndex: number): number {
  const pct = layout.dotPositions[dotIndex] ?? 0
  const frac = pct / 100
  const clamped = Math.min(Math.max(frac, 0.02), 0.98)
  return clamped
}

function getSectionElement(sectionId: ProgressLayoutSegment["sectionId"]): Element | null {
  return document.querySelector(
    `[data-progress-section="${resolveDomSectionId(sectionId)}"]`,
  )
}

/** Top absoluto en documento en el momento del scroll (para encendido / pelota). */
export function getSectionDocumentTop(
  sectionId: ProgressLayoutSegment["sectionId"],
  scrollY: number = window.scrollY,
): number | null {
  const el = getSectionElement(sectionId)
  if (!el) return null
  return scrollY + el.getBoundingClientRect().top
}

function getSegmentGeometryLive(
  seg: ProgressLayoutSegment,
  scrollY: number,
): { top: number; height: number } {
  const el = getSectionElement(seg.sectionId)
  if (!el) return { top: seg.top, height: seg.height }
  const rect = el.getBoundingClientRect()
  return {
    top: scrollY + rect.top,
    height: Math.max(rect.height, 1),
  }
}

/** Actualiza alturas (y tops de respaldo) desde DOM; posiciones en barra quedan fijas vía finalizeLayout. */
export function refreshLayoutGeometryFromDom(layout: ProgressLayout): ProgressLayout {
  const scrollY = window.scrollY
  const updated = layout.segments.map(seg => {
    const geo = getSegmentGeometryLive(seg, scrollY)
    return { ...seg, top: geo.top, height: geo.height }
  })
  return finalizeLayout(layout.breakpoint, layout.festejoUnlocked, updated)
}

export const PIVOT_RATIO = 0.45

export function computeProgressFromLayout(
  layout: ProgressLayout,
  scrollY: number,
  windowHeight: number,
): number {
  const pivot = scrollY + windowHeight * PIVOT_RATIO
  const progress = ((pivot - layout.trackOrigin) / layout.trackSpan) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function resolveActiveSectionFromLayout(
  layout: ProgressLayout,
  scrollY: number,
  windowHeight: number,
): number {
  const pivot = scrollY + windowHeight * PIVOT_RATIO
  for (let i = PROGRESS_BLOCKS.length - 1; i >= 0; i--) {
    const block = PROGRESS_BLOCKS[i]
    const segs = layout.segments.filter(s => s.blockId === block.id)
    if (segs.length === 0) continue
    const firstTop = getSectionDocumentTop(segs[0].sectionId, scrollY) ?? segs[0].top
    if (pivot >= firstTop) return i
  }
  return -1
}

/** Mapea un nodo DOM al índice de segmento esperado (por orden de aparición). */
export function resolveBlockIdFromElement(el: Element): NarrativeBlockId | "mundial" {
  const block = el.closest("section[id]") as HTMLElement | null
  const id = block?.id
  if (id === "carta") return "mundial"
  if (id && BLOCK_IDS.has(id as NarrativeBlockId)) return id as NarrativeBlockId
  return "mundial"
}

export function calibrateLayoutFromDom(
  estimated: ProgressLayout,
  festejoUnlocked: boolean,
): ProgressLayout | null {
  const matched = estimated.segments.filter(isSegmentInDom).length
  if (matched < 8) return null
  if (festejoUnlocked && !areGenteSectionsInDom()) return null

  return refreshLayoutGeometryFromDom(estimated)
}
