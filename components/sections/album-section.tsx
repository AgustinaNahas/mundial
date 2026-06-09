"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { SectionLoadingShell } from "@/components/section-skeletons"
import { SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.album
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"
import { InfoTooltip } from "@/components/info-tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { MonthStack } from "@/components/month-stack"
import { sendGaEvent } from "@/lib/analytics"

/* ─── Constantes ────────────────────────────────────────────── */
type AlbumSlot = {
  readonly player: string
  readonly emoji: string
  readonly src: string
  /** Filtro CSS sobre el emoji-pista (p. ej. otro tono del mismo 🍬). */
  readonly emojiClassName?: string
}

const SLOTS: readonly AlbumSlot[] = [
  { player: "Lionel Messi",       emoji: "🐐", src: "/album/figu1.webp"  },
  { player: "Rodrigo De Paul",    emoji: "🍬", src: "/album/figu3.webp"  },
  { player: "Ángel Di María",     emoji: "🍝", src: "/album/figu10.webp" },
  { player: "Nicolás Otamendi",   emoji: "🪖", src: "/album/figu7.webp"  },
  { player: "Marcos Acuña",       emoji: "🥚", src: "/album/figu8.webp"  },
  { player: "Julián Álvarez",     emoji: "🕷️", src: "/album/figu4.webp"  },
  { player: "Lautaro Martínez",   emoji: "🐂", src: "/album/figu12.webp" },
  { player: "Alejandro Gómez",    emoji: "🕺", src: "/album/figu5.webp"  },
  { player: "Emiliano Martínez",  emoji: "🧤", src: "/album/figu2.webp"  },
  { player: "Nahuel Molina",      emoji: "🚀", src: "/album/figu6.webp"  },
  { player: "Cristian Romero",    emoji: "🪓", src: "/album/figu9.webp"  },
  {
    player: "Leandro Paredes",
    emoji: "🍬",
    src: "/album/figu11.webp",
    emojiClassName: "inline-block [filter:hue-rotate(155deg)_saturate(1.15)]",
  },
]
const COLS = 4
const ROWS = 3
const TOTAL = COLS * ROWS
/** Índice en SLOTS / celda del álbum de Messi (siempre el cierre). */
const MESSI_INDEX = 0

/** Las dos 🍬 comparten pista: cualquier celda caramelos vale para De Paul o Paredes. */
const CANDY_SLOT_INDICES = [
  SLOTS.findIndex(s => s.player === "Rodrigo De Paul"),
  SLOTS.findIndex(s => s.player === "Leandro Paredes"),
].filter(i => i >= 0)

function isCandySlot(idx: number) {
  return CANDY_SLOT_INDICES.includes(idx)
}

/** Celda donde pegar y qué figurita mostrar (la del turno actual en slotOrder). */
function resolveAlbumPlacement(
  targetSlot: number,
  clickedIdx: number,
  placed: readonly (SlotData | null)[],
): { placeAt: number; figuIdx: number } | null {
  if (placed[clickedIdx]) return null

  if (isCandySlot(targetSlot)) {
    if (!isCandySlot(clickedIdx)) return null
    return { placeAt: clickedIdx, figuIdx: targetSlot }
  }

  if (clickedIdx !== targetSlot) return null
  return { placeAt: clickedIdx, figuIdx: clickedIdx }
}
/** Primeras figuritas posibles: uno de estos sale primero (al azar). */
const PRIORITY_FIRST_INDICES = [
  SLOTS.findIndex(s => s.player === "Julián Álvarez"),
  SLOTS.findIndex(s => s.player === "Ángel Di María"),
  SLOTS.findIndex(s => s.player === "Marcos Acuña"),
  SLOTS.findIndex(s => s.player === "Lautaro Martínez"),
].filter(i => i >= 0)

const ALBUM_ERA_2022 = {
  year: "2022",
  mobileLabel: "En 2022",
  flags: ["🇶🇦"] as const,
} as const

const ALBUM_ERA_2026 = {
  year: "2026",
  mobileLabel: "En 2026",
  flags: ["🇺🇸", "🇨🇦", "🇲🇽"] as const,
} as const

/* ─── Types ──────────────────────────────────────────────────── */
type SlotFlash = "ok" | "err"

const SLOT_FLASH_MS: Record<SlotFlash, number> = {
  ok: 700,
  err: 380,
}

interface PlacedFigu { src: string; price2022: number; price2026: number }
type SlotData = PlacedFigu | null
interface StickerEntry {
  id: number
  price: number
  figusAdded: number
  kind: "manual" | "missing"
}

interface MobileSnack {
  id: number
  side: "left" | "right"
  amount: number
}

const MotionImage = motion(Image)

/** Precios en grillas 2 columnas: más chicos en mobile para que no desborden. */
const SUMMARY_PRICE_CLASS =
  "font-sans font-bold tabular-nums mt-4 tracking-tight leading-tight text-2xl"
const MOBILE_LIVE_PRICE_CLASS =
  "font-mono font-bold tabular-nums tracking-tight leading-tight text-base"

function FiguCountLine({ count, suffix }: { count: number; suffix: string }) {
  return (
    <p className="text-sm text-muted-foreground text-center md:text-right">
      <span className="inline-flex flex-wrap items-center justify-center md:justify-end gap-x-1 rounded-lg bg-sky-400/10 px-2 py-1">
        <span className="font-semibold tabular-nums text-foreground">
          {count.toLocaleString("es-AR")}
        </span>
        <span>{suffix}</span>
      </span>
    </p>
  )
}

/* ─── Portal para el cursor ─── */
function CursorPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

const FIGU_CURSOR_W = 96
const FIGU_CURSOR_H = 125

function centerSpawnPosition() {
  if (typeof window === "undefined") return { x: 0, y: 0 }
  return {
    x: Math.round(window.innerWidth / 2 - FIGU_CURSOR_W / 2),
    y: Math.round(window.innerHeight / 2 - FIGU_CURSOR_H / 2),
  }
}

/* ─── Cursor figurita ─── */
function FiguraCursor({
  visible,
  cursorX,
  cursorY,
  src,
  emerging,
}: {
  visible: boolean
  cursorX: ReturnType<typeof useMotionValue<number>>
  cursorY: ReturnType<typeof useMotionValue<number>>
  src: string
  emerging: boolean
}) {
  if (!visible) return null

  return (
    <CursorPortal>
      <motion.div
        className="pointer-events-none fixed z-[9999]"
        style={{ left: cursorX, top: cursorY }}
      >
        <motion.div
          initial={emerging ? { scale: 0.35, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={emerging ? { type: "spring", stiffness: 380, damping: 24 } : { duration: 0 }}
          className="origin-center"
        >
          <motion.div
            animate={{ rotate: [-12, -8, -12] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="origin-bottom-left"
          >
          <Image
            src={src}
            alt="figurita"
            width={FIGU_CURSOR_W}
            height={FIGU_CURSOR_H}
            loading="eager"
            fetchPriority="high"
            className="w-24 h-[125px] object-cover rounded-md shadow-2xl border border-white/20"
          />
          </motion.div>
        </motion.div>
      </motion.div>
    </CursorPortal>
  )
}

/* ─── Slot individual ─── */
function Slot({
  figu,
  emoji,
  emojiClassName,
  flash,
  onPlace,
}: {
  figu: SlotData
  emoji: string
  emojiClassName?: string
  flash?: SlotFlash
  onPlace: () => void
}) {
  return (
    <motion.div
      onClick={figu === null ? onPlace : undefined}
      animate={
        flash === "err"
          ? { x: [0, -5, 5, -4, 4, 0] }
          : { x: 0 }
      }
      transition={
        flash === "err"
          ? { duration: 0.26, ease: "easeOut" }
          : { duration: 0 }
      }
      className={cn(
        "relative aspect-[10/13] rounded-md",
        figu
          ? "overflow-visible"
          : cn(
              "overflow-hidden cursor-pointer group border border-dashed",
              flash === "ok" &&
                "border-solid border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.4)] transition-[border-color,box-shadow] duration-150",
              flash === "err" &&
                "border-solid border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.55)] transition-none",
              flash == null &&
                "border-border/40 hover:border-primary/60 transition-[border-color,box-shadow] duration-200",
            ),
      )}
    >
      <AnimatePresence mode="wait">
        {figu ? (
          <MotionImage
            key={figu.src}
            src={figu.src}
            alt="figurita"
            fill
            sizes="(max-width: 768px) 25vw, 110px"
            className="absolute inset-0 origin-center object-cover rounded-md shadow-lg"
            // Emerge desde el centro: entra un poco grande y se asienta al tamaño final
            initial={{ scale: 1.14, opacity: 0 }}
            animate={{
              scale: [1.14, 0.96, 1],
              opacity: 1,
            }}
            transition={{
              duration: 0.34,
              times: [0, 0.52, 1],
              ease: "easeOut",
              opacity: { duration: 0.08 },
            }}
          />
        ) : (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-1 group-hover:bg-primary/5 transition-colors rounded-md">
            <span
              className={cn(
                "text-[50px] md:text-[38px] leading-none select-none",
                emojiClassName,
              )}
            >
              {emoji}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EraFlags({
  flags,
  className,
}: {
  flags: readonly string[]
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-lg leading-none", className)}>
      {flags.map(flag => (
        <span key={flag}>{flag}</span>
      ))}
    </span>
  )
}

/* ─── Panel lateral de costos ─── */
function CostPanel({
  year,
  flags,
  color,
  total,
  entries,
  pricePerFigu,
  unit,
  align,
  albumComplete,
  horasTrabajo,
}: {
  year: string
  flags: readonly string[]
  color: string
  total: number
  entries: StickerEntry[]
  pricePerFigu: number
  unit?: string
  align: "left" | "right"
  albumComplete: boolean
  horasTrabajo: number
}) {
  const isRight = align === "right"
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [entries.length])

  return (
    <div className={cn("flex flex-col h-full", isRight ? "items-start" : "items-end")}>
      {/* Header */}
      <div className={cn("mb-4", isRight ? "text-left" : "text-right")}>
        <EraFlags
          flags={flags}
          className={cn("mb-1.5", isRight ? "justify-start" : "justify-end")}
        />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{year}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatCurrency(pricePerFigu, unit)}/figurita
        </p>
      </div>

      {/* Lista animada de precios */}
      <div
        ref={listRef}
        className={cn(
          "flex-1 w-full space-y-1 min-h-[250px] max-h-[320px] overflow-y-auto pr-1 scrollbar-hide",
          isRight ? "" : "flex flex-col items-end",
        )}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
 
        <AnimatePresence initial={false}>
          {entries.map((e, i) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, x: isRight ? -16 : 16, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={cn(
                "flex items-center gap-1.5 text-[12px]",
                isRight ? "flex-row" : "flex-row-reverse",
              )}
            >
              {e.kind === "missing" && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full border",
                    isRight
                      ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                      : "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
                  )}
                >
                  +{e.figusAdded} figus
                </span>
              )}
              <span className={cn("font-medium", e.kind === "missing" && "text-emerald-300")} style={e.kind === "missing" ? undefined : { color }}>
                +{formatCurrency(e.price, unit)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <p className={cn("text-[11px] text-muted-foreground/40 italic mt-2", isRight ? "text-left" : "text-right")}>
            Pegá una figurita →
          </p>
        )}
      </div>

      {/* Total */}
      <div className={cn("mt-4 pt-3 border-t border-border/20 w-full", isRight ? "text-left" : "text-right")}>
        <AnimatePresence mode="wait">
          {total > 0 ? (
            <motion.div key="total" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[11px] text-muted-foreground mb-1">{ albumComplete ? "En total gastaste..." : "Hasta ahora gastaste..."}</p>
              <motion.p
                className="text-xl font-bold font-mono tabular-nums tracking-tight leading-tight"
                style={{ color }}
                key={total}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {formatCurrency(total, unit)}
              </motion.p>
              {albumComplete && horasTrabajo > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug max-w-2xl">
                  Entonces son al menos {horasTrabajo.toFixed(1)} horas de trabajo para el álbum completo
                </p>
              )}
            </motion.div>
          ) : (
            <p className="text-xs text-muted-foreground/30">—</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Fisher-Yates shuffle ──────────────────────────────────── */
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Orden de celdas a completar: primero uno de los “estrellas”, resto al azar, Messi al final. */
function buildSlotOrder(): number[] {
  const first =
    PRIORITY_FIRST_INDICES[Math.floor(Math.random() * PRIORITY_FIRST_INDICES.length)]
  const rest = Array.from({ length: TOTAL }, (_, i) => i).filter(
    i => i !== MESSI_INDEX && i !== first,
  )
  return [first, ...shuffled(rest), MESSI_INDEX]
}

const CELESTE_CONFETTI = "#5BA3E8"

function AlbumConfettiBurst({ onDone }: { onDone: () => void }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        drift: (Math.random() - 0.5) * 140,
        delay: Math.random() * 0.18,
        duration: 2.1 + Math.random() * 1.35,
        w: (4 + Math.random() * 5) * (Math.random() > 0.45 ? 1 : 2.4),
        h: 4 + Math.random() * 6,
        spin: (Math.random() - 0.5) * 1080,
        celeste: Math.random() < 0.5,
        round: Math.random() > 0.55,
      })),
    [],
  )

  useEffect(() => {
    const t = window.setTimeout(onDone, 3200)
    return () => window.clearTimeout(t)
  }, [onDone])

  const node = (
    <div className="pointer-events-none fixed inset-0 z-[9996] overflow-hidden" aria-hidden>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={cn(
            "absolute -top-6",
            p.round ? "rounded-full" : "rounded-[1px]",
            p.celeste ? "opacity-95" : "bg-white opacity-[0.92] shadow-[0_0_1px_rgba(0,0,0,0.12)]",
          )}
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            ...(p.celeste ? { backgroundColor: CELESTE_CONFETTI } : {}),
          }}
          initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: "115vh",
            x: p.drift,
            rotate: p.spin,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.18, 0.72, 0.24, 0.98],
            opacity: { times: [0, 0.82, 1], duration: p.duration },
          }}
        />
      ))}
    </div>
  )
  return createPortal(node, document.body)
}

/* ─── Sección principal ──────────────────────────────────────── */
export function AlbumSection() {
  const { getIndicador, loading } = useData()
  const sobreItem = getIndicador("PRECIO_SOBRE_FIGURITAS")
  const figusSobreItem = getIndicador("FIGURITAS_SOBRE")
  const albumItem = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const salario = getIndicador("SUELDO_MIN_PESOS")
  const cantFiguritas = getIndicador("CANT_FIGURITAS")

  const sobre_2022 = sobreItem?.valor_2022 ?? 150
  const sobre_2026 = sobreItem?.valor_2026 ?? 2500
  const figusSobre2022 = figusSobreItem?.valor_2022 ?? 5
  const figusSobre2026 = figusSobreItem?.valor_2026 ?? 5
  const salario_2022 = salario?.valor_2022 ?? 61953
  const salario_2026 = salario?.valor_2026 ?? 346800
  const totalFigus2022 = Math.max(Math.round(cantFiguritas?.valor_2022 ?? 670), TOTAL)
  const totalFigus2026 = Math.max(Math.round(cantFiguritas?.valor_2026 ?? 1000), TOTAL)
  const unit = sobreItem?.unidad

  const pricePerFigu2022 = sobre_2022 / Math.max(figusSobre2022, 1)
  const pricePerFigu2026 = sobre_2026 / Math.max(figusSobre2026, 1)

  // orden al montar: primero Álvarez/Di María/Acuña/Lautaro, resto al azar, Messi al final
  const [slotOrder] = useState(() => buildSlotOrder())
  // posición dentro del orden shuffled
  const [orderIdx, setOrderIdx] = useState(0)

  const [placed, setPlaced] = useState<SlotData[]>(Array(TOTAL).fill(null))
  const [entries2022, setEntries2022] = useState<StickerEntry[]>([])
  const [entries2026, setEntries2026] = useState<StickerEntry[]>([])
  const entryCounter2022 = useRef(0)
  const entryCounter2026 = useRef(0)
  const snackCounter = useRef(0)
  const bonusStartedRef = useRef(false)
  const [displayCount2022, setDisplayCount2022] = useState(0)
  const [displayCount2026, setDisplayCount2026] = useState(0)
  const [mobileSnacks, setMobileSnacks] = useState<MobileSnack[]>([])
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  const [confettiBurst, setConfettiBurst] = useState(false)
  const albumCompleteConfettiRef = useRef(false)

  const [inAlbum, setInAlbum] = useState(false)
  const [cursorEmerging, setCursorEmerging] = useState(false)
  const [slotFlash, setSlotFlash] = useState<Partial<Record<number, SlotFlash>>>({})
  const flashTimeoutRef = useRef<Record<number, number>>({})
  const cursorFollowingRef = useRef(false)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    for (const slot of SLOTS) {
      const img = new window.Image()
      img.src = slot.src
    }
  }, [])

  const placeCursorAt = useCallback(
    (clientX: number, clientY: number) => {
      rawX.jump(clientX + 8)
      rawY.jump(clientY - 24)
    },
    [rawX, rawY],
  )

  const spawnCursorAtCenter = useCallback(() => {
    const { x, y } = centerSpawnPosition()
    rawX.jump(x)
    rawY.jump(y)
  }, [rawX, rawY])

  const revealCursorAtCenter = useCallback(() => {
    spawnCursorAtCenter()
    setInAlbum(true)
    setCursorEmerging(true)
    cursorFollowingRef.current = false
  }, [spawnCursorAtCenter])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!inAlbum) {
        revealCursorAtCenter()
        return
      }
      if (!cursorFollowingRef.current) {
        cursorFollowingRef.current = true
        setCursorEmerging(false)
        placeCursorAt(e.clientX, e.clientY)
        return
      }
      placeCursorAt(e.clientX, e.clientY)
    },
    [inAlbum, placeCursorAt, revealCursorAtCenter],
  )

  const handleAlbumMouseEnter = useCallback(() => {
    if (!inAlbum) revealCursorAtCenter()
  }, [inAlbum, revealCursorAtCenter])

  const handleAlbumMouseLeave = useCallback(() => {
    setInAlbum(false)
    setCursorEmerging(false)
    cursorFollowingRef.current = false
  }, [])

  const pushMobileSnack = useCallback((side: "left" | "right", amount: number) => {
    const id = ++snackCounter.current
    setMobileSnacks(prev => [...prev, { id, side, amount }])
    window.setTimeout(() => {
      setMobileSnacks(prev => prev.filter(s => s.id !== id))
    }, 1100)
  }, [])

  const pulseSlotFlash = useCallback((idx: number, kind: SlotFlash) => {
    const prev = flashTimeoutRef.current[idx]
    if (prev) window.clearTimeout(prev)
    setSlotFlash(s => ({ ...s, [idx]: kind }))
    flashTimeoutRef.current[idx] = window.setTimeout(() => {
      setSlotFlash(s => {
        if (s[idx] !== kind) return s
        const next = { ...s }
        delete next[idx]
        return next
      })
      delete flashTimeoutRef.current[idx]
    }, SLOT_FLASH_MS[kind])
  }, [])

  useEffect(() => {
    return () => {
      for (const id of Object.values(flashTimeoutRef.current)) {
        window.clearTimeout(id)
      }
    }
  }, [])

  const placedCount = placed.filter(Boolean).length
  const allFilled = placedCount === TOTAL

  const placeSticker = useCallback((clickedIdx: number) => {
    const targetSlot = slotOrder[orderIdx]
    if (allFilled) return

    const resolved = resolveAlbumPlacement(targetSlot, clickedIdx, placed)
    if (!resolved) {
      if (!placed[clickedIdx]) pulseSlotFlash(clickedIdx, "err")
      return
    }

    const { placeAt, figuIdx } = resolved
    pulseSlotFlash(placeAt, "ok")

    const newPlaced = [...placed]
    newPlaced[placeAt] = {
      src: SLOTS[figuIdx].src,
      price2022: pricePerFigu2022,
      price2026: pricePerFigu2026,
    }
    setPlaced(newPlaced)
    setEntries2022(prev => [
      ...prev,
      {
        id: ++entryCounter2022.current,
        price: pricePerFigu2022,
        figusAdded: 1,
        kind: "manual",
      },
    ])
    setEntries2026(prev => [
      ...prev,
      {
        id: ++entryCounter2026.current,
        price: pricePerFigu2026,
        figusAdded: 1,
        kind: "manual",
      },
    ])
    if (isMobile) {
      pushMobileSnack("left", pricePerFigu2022)
      pushMobileSnack("right", pricePerFigu2026)
    }
    if (orderIdx + 1 < TOTAL) setOrderIdx(orderIdx + 1)

    sendGaEvent("album_sticker_click", {
      section_name: "album",
      slot_index: placeAt,
      sticker_index: figuIdx,
      sticker_player: SLOTS[figuIdx].player,
      stickers_completed: newPlaced.filter(Boolean).length,
      is_mobile: isMobile,
    })
  }, [
    slotOrder,
    orderIdx,
    placed,
    allFilled,
    pricePerFigu2022,
    pricePerFigu2026,
    isMobile,
    pushMobileSnack,
    pulseSlotFlash,
  ])

  useEffect(() => {
    if (!allFilled) {
      albumCompleteConfettiRef.current = false
      setConfettiBurst(false)
      return
    }
    if (prefersReducedMotion === true || albumCompleteConfettiRef.current) return
    albumCompleteConfettiRef.current = true
    setConfettiBurst(true)
  }, [allFilled, prefersReducedMotion])

  const endAlbumConfetti = useCallback(() => {
    setConfettiBurst(false)
  }, [])

  useEffect(() => {
    if (allFilled) return
    bonusStartedRef.current = false
    setEntries2022(prev => prev.filter(e => e.kind === "manual"))
    setEntries2026(prev => prev.filter(e => e.kind === "manual"))
    setDisplayCount2022(placedCount)
    setDisplayCount2026(placedCount)
  }, [allFilled, placedCount])

  useEffect(() => {
    if (!allFilled || bonusStartedRef.current) return
    bonusStartedRef.current = true
    setMobileSnacks([])

    let count2022 = placedCount
    let count2026 = placedCount
    let tick = 0
    const INTERVAL_MS = 50
    const MAX_DURATION_MS = 3000
    const totalTicks = Math.max(1, Math.ceil(MAX_DURATION_MS / INTERVAL_MS))

    const id = window.setInterval(() => {
      tick += 1
      const progress = Math.min(1, tick / totalTicks)

      if (count2022 < totalFigus2022) {
        const target = placedCount + Math.round((totalFigus2022 - placedCount) * progress)
        const add = Math.max(0, Math.min(target - count2022, totalFigus2022 - count2022))
        count2022 += add
        setDisplayCount2022(count2022)
        if (add > 0) {
          setEntries2022(prev => [
            ...prev,
            {
              id: ++entryCounter2022.current,
              price: add * pricePerFigu2022,
              figusAdded: add,
              kind: "missing",
            },
          ])
        }
      }

      if (count2026 < totalFigus2026) {
        const target = placedCount + Math.round((totalFigus2026 - placedCount) * progress)
        const add = Math.max(0, Math.min(target - count2026, totalFigus2026 - count2026))
        count2026 += add
        setDisplayCount2026(count2026)
        if (add > 0) {
          setEntries2026(prev => [
            ...prev,
            {
              id: ++entryCounter2026.current,
              price: add * pricePerFigu2026,
              figusAdded: add,
              kind: "missing",
            },
          ])
        }
      }

      const done = progress >= 1 || (count2022 >= totalFigus2022 && count2026 >= totalFigus2026)
      if (done) window.clearInterval(id)
    }, INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [allFilled, placedCount, totalFigus2022, totalFigus2026, pricePerFigu2022, pricePerFigu2026])

  const effectiveCount2022 = allFilled ? displayCount2022 : placedCount
  const effectiveCount2026 = allFilled ? displayCount2026 : placedCount
  const totalCost2022 = effectiveCount2022 * pricePerFigu2022
  const totalCost2026 = effectiveCount2026 * pricePerFigu2026

  const hora_2022 = salario_2022 / 176
  const hora_2026 = salario_2026 / 176
  const horasTrabajo2022 = totalCost2022 > 0 ? totalCost2022 / hora_2022 : 0
  const horasTrabajo2026 = totalCost2026 > 0 ? totalCost2026 / hora_2026 : 0

  const couponGamma = 0.5772156649
  const laborCount2022 = Math.ceil(totalFigus2022 * (Math.log(totalFigus2022) + couponGamma))
  const laborCount2026 = Math.ceil(totalFigus2026 * (Math.log(totalFigus2026) + couponGamma))

  const blessedTotal2022 = totalFigus2022 * pricePerFigu2022
  const blessedTotal2026 = totalFigus2026 * pricePerFigu2026
  const laborTotal2022 = laborCount2022 * pricePerFigu2022
  const laborTotal2026 = laborCount2026 * pricePerFigu2026
  const blessedMonths2022 = blessedTotal2022 / salario_2022
  const blessedMonths2026 = blessedTotal2026 / salario_2026
  const laborMonths2022 = laborTotal2022 / salario_2022
  const laborMonths2026 = laborTotal2026 / salario_2026

  // cursor muestra la figurita que toca pegar ahora
  const cursorSrc = SLOTS[slotOrder[orderIdx] ?? 0]?.src ?? SLOTS[0].src
  const mobileLeftSnacks = mobileSnacks.filter(s => s.side === "left")
  const mobileRightSnacks = mobileSnacks.filter(s => s.side === "right")

  if (loading) {
    return (
      <SectionLoadingShell
        sectionId="album"
        number={copy.number}
        title={copy.title}
        intro={copy.intro}
        bgColor="muted"
      />
    )
  }

  return (
    <>
      {confettiBurst && <AlbumConfettiBurst onDone={endAlbumConfetti} />}
      <FiguraCursor
        visible={!isMobile && inAlbum && !allFilled}
        cursorX={rawX}
        cursorY={rawY}
        src={cursorSrc}
        emerging={cursorEmerging}
      />

      <SectionWrapper progressSection="album"
        number={copy.number}
        title={copy.title}
        intro={copy.intro}
        closing={copy.closing}
        bgColor="muted"
        sources={[sobreItem, figusSobreItem, albumItem, cantFiguritas, salario]}
      >
        <p className="text-[17px] text-foreground/85 font-medium text-center max-w-xl 
        mx-auto mb-5 md:mb-12 leading-relaxed px-1">
          <span className="hidden md:inline">
            💡 Pasá el mouse por encima del álbum para revelar las figuritas, y hacé clic en donde te parece que van en función de las pistas dadas.
          </span>
          <span className="md:hidden">
            💡 Tocá el casillero correcto según las pistas de la figurita actual (se ve arriba).
          </span>
        </p>

        {/* ── Tres columnas: [2022] [álbum] [2026] ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_1fr] lg:grid-cols-[1fr_450px_1fr] gap-6 items-start">

          {/* Panel 2022 (izquierda) */}
          <div className="hidden md:block">
            <CostPanel
              year={ALBUM_ERA_2022.year}
              flags={ALBUM_ERA_2022.flags}
              color="oklch(0.97 0.01 220)"
              total={totalCost2022}
              entries={entries2022}
              pricePerFigu={pricePerFigu2022}
              unit={unit}
              align="left"
              albumComplete={allFilled}
              horasTrabajo={horasTrabajo2022}
            />
          </div>

          {/* Álbum central */}
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={handleAlbumMouseEnter}
            onMouseLeave={handleAlbumMouseLeave}
            style={{ cursor: !isMobile && inAlbum && !allFilled ? "none" : "auto" }}
            className="relative isolate rounded-xl overflow-hidden border border-border/40 bg-card"
          >
            <div className="px-4 py-3 flex items-center justify-between bg-primary/10 border-b border-border/20">
              <p className="text-foreground font-semibold text-sm tracking-wide text-center mx-auto">
                {placedCount}/{TOTAL} figuritas
              </p>
              {allFilled && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[11px] text-primary font-medium"
                >
                  ¡Álbum completo! 🎉
                </motion.p>
              )}
            </div>
            {isMobile && !allFilled && (
              <div className="px-4 py-3 border-b border-border/20 bg-card/70">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 text-center mx-auto">Figurita actual</p>
                <div className="flex items-center justify-center">
                  <Image
                    src={cursorSrc}
                    alt="figurita actual"
                    width={80}
                    height={104}
                    className="w-20 h-26 object-cover rounded-md shadow-lg border border-border/30"
                  />
                </div>
              </div>
            )}
            {isMobile && !allFilled && (
              <>
                <div className="pointer-events-none absolute top-14 left-2 z-[80] flex flex-col gap-1.5">
                  <AnimatePresence initial={false}>
                    {mobileLeftSnacks.map(snack => (
                      <motion.div
                        key={snack.id}
                        initial={{ opacity: 0, x: -12, y: 4 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -12, y: -4 }}
                        className="text-[11px] px-2 py-1 rounded-md border border-accent/30 bg-accent/15 text-accent font-medium"
                      >
                        +{formatCurrency(snack.amount, unit)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="pointer-events-none absolute top-14 right-2 z-[80] flex flex-col gap-1.5 items-end">
                  <AnimatePresence initial={false}>
                    {mobileRightSnacks.map(snack => (
                      <motion.div
                        key={snack.id}
                        initial={{ opacity: 0, x: 12, y: 4 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 12, y: -4 }}
                        className="text-[11px] px-2 py-1 rounded-md border border-primary/30 bg-primary/15 text-primary font-medium"
                      >
                        +{formatCurrency(snack.amount, unit)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
            <div className="p-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {placed.map((figu, idx) => (
                <Slot
                  key={idx}
                  figu={figu}
                  emoji={SLOTS[idx].emoji}
                  emojiClassName={SLOTS[idx].emojiClassName}
                  flash={slotFlash[idx]}
                  onPlace={() => placeSticker(idx)}
                />
              ))}
            </div>
          </div>

          {/* Panel 2026 (derecha) */}
          <div className="hidden md:block">
            <CostPanel
              year={ALBUM_ERA_2026.year}
              flags={ALBUM_ERA_2026.flags}
              color="oklch(0.65 0.18 222)"
              total={totalCost2026}
              entries={entries2026}
              pricePerFigu={pricePerFigu2026}
              unit={unit}
              align="right"
              albumComplete={allFilled}
              horasTrabajo={horasTrabajo2026}
            />
          </div>
        </div>

        {/* ── Paneles en mobile (apilados) ── */}
        {placedCount > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2 md:hidden min-w-0">
            <div className="relative rounded-xl bg-card border border-border/30 p-3 min-w-0 overflow-hidden">
              <EraFlags
                flags={ALBUM_ERA_2022.flags}
                className="absolute top-2.5 right-2.5 text-base"
              />
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 pr-10">
                {ALBUM_ERA_2022.mobileLabel}
              </p>
              <p className="text-[11px] text-muted-foreground mb-1">{allFilled ? "En total gastaste..." : "Hasta ahora gastaste..."}</p>
              <p className={cn(MOBILE_LIVE_PRICE_CLASS, "text-accent")}>{formatCurrency(totalCost2022, unit)}</p>
              {allFilled && horasTrabajo2022 > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                  Entonces son al menos {horasTrabajo2022.toFixed(1)} horas de trabajo para el álbum completo
                </p>
              )}
            </div>
            <div className="relative rounded-xl bg-card border border-border/30 p-3 min-w-0 overflow-hidden">
              <EraFlags
                flags={ALBUM_ERA_2026.flags}
                className="absolute top-2.5 right-2.5 text-base"
              />
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 pr-14">
                {ALBUM_ERA_2026.mobileLabel}
              </p>
              <p className="text-[11px] text-muted-foreground mb-1">{allFilled ? "En total gastaste..." : "Hasta ahora gastaste..."}</p>
              <p className={cn(MOBILE_LIVE_PRICE_CLASS, "text-primary")}>{formatCurrency(totalCost2026, unit)}</p>
              {allFilled && horasTrabajo2026 > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug max-w-2xl">
                  Entonces son {horasTrabajo2026.toFixed(1)} horas de trabajo para el álbum completo
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Resumen final en dos escenarios ── */}
        <div className="mt-12 pt-8 border-t border-border/10 space-y-8">
          <h3 className="text-center font-semibold tracking-tight text-foreground text-[26px] md:text-[28px] px-2">
            Entonces, ¿cuánto sale completar el álbum?
          </h3>

          <div className="rounded-xl bg-card border border-border/20 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 justify-center">
              <p className="text-[20px] md:text-[22px] font-medium text-foreground">Si sos un iluminado y no te toca ninguna repetida...</p>
              <InfoTooltip
                placement="above-left"
                wide
                label="Más información sobre completar el álbum sin repetidas"
              >
                Solo vas a necesitar 980 figuritas si no te toca ninguna repetida; es como ganar el loto 60 veces, es decir, imposible.
              </InfoTooltip>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 min-w-0">
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between min-w-0">
                <MonthStack
                  className="order-2 md:order-none"
                  months={blessedMonths2022}
                  color="oklch(0.97 0.01 220)"
                  toneClass="text-accent"
                  align="right"
                />
                <div className="order-1 md:order-none space-y-1.5 text-center md:text-right min-w-0 overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Qatar 2022</p>
                  <FiguCountLine count={totalFigus2022} suffix="figuritas totales" />
                  <p className={cn(SUMMARY_PRICE_CLASS, "text-accent")}>{formatCurrency(blessedTotal2022, unit)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between md:border-l md:border-border/10 md:pl-6 min-w-0">
                <div className="order-1 md:order-none space-y-1.5 text-center md:text-right min-w-0 overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">EEUU 2026</p>
                  <FiguCountLine count={totalFigus2026} suffix="figuritas totales" />
                  <p className={cn(SUMMARY_PRICE_CLASS, "text-primary")}>{formatCurrency(blessedTotal2026, unit)}</p>
                </div>
                <MonthStack
                  className="order-2 md:order-none"
                  months={blessedMonths2026}
                  color="oklch(0.65 0.18 222)"
                  toneClass="text-primary"
                  align="left"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border/20 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 justify-center">
              <p className="text-[20px] md:text-[22px] font-medium text-foreground">Si lo tuyo es más huevo que suerte...</p>
            <InfoTooltip
              placement="above-left"
              wide
              label="Más información sobre el promedio de figuritas (coupon collector)"
            >
                Promedio sin intercambiar figuritas (coupon collector): n · (ln n + γ)
              </InfoTooltip>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 min-w-0">
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between min-w-0">
                <MonthStack
                  className="order-2 md:order-none"
                  months={laborMonths2022}
                  color="oklch(0.97 0.01 220)"
                  toneClass="text-accent"
                  align="right"
                />
                <div className="order-1 md:order-none space-y-1.5 text-center md:text-right min-w-0 overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Qatar 2022</p>
                  <FiguCountLine count={laborCount2022} suffix="figuritas estimadas" />
                  <p className={cn(SUMMARY_PRICE_CLASS, "text-accent")}>{formatCurrency(laborTotal2022, unit)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between md:border-l md:border-border/10 md:pl-6 min-w-0">
                <div className="order-1 md:order-none space-y-1.5 text-center md:text-right min-w-0 overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">EEUU 2026</p>
                  <FiguCountLine count={laborCount2026} suffix="figuritas estimadas" />
                  <p className={cn(SUMMARY_PRICE_CLASS, "text-primary")}>{formatCurrency(laborTotal2026, unit)}</p>
                </div>
                <MonthStack
                  className="order-2 md:order-none"
                  months={laborMonths2026}
                  color="oklch(0.65 0.18 222)"
                  toneClass="text-primary"
                  align="left"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
