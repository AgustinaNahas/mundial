"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { MonthStack } from "@/components/month-stack"
import { sendGaEvent } from "@/lib/analytics"

/* ─── Constantes ────────────────────────────────────────────── */
const SLOTS = [
  { player: "Lionel Messi",       emoji: "🐐", src: "/mundial/album/figu1.webp"  },
  { player: "Rodrigo De Paul",    emoji: "🍬", src: "/mundial/album/figu3.webp"  },
  { player: "Ángel Di María",     emoji: "🍝", src: "/mundial/album/figu10.webp" },
  { player: "Nicolás Otamendi",   emoji: "🧱", src: "/mundial/album/figu7.webp"  },
  { player: "Marcos Acuña",       emoji: "🥚", src: "/mundial/album/figu8.webp"  },
  { player: "Julián Álvarez",     emoji: "🕷️", src: "/mundial/album/figu4.webp"  },
  { player: "Lautaro Martínez",   emoji: "🐂", src: "/mundial/album/figu12.webp" },
  { player: "Alejandro Gómez",    emoji: "🤪", src: "/mundial/album/figu5.webp"  },
  { player: "Emiliano Martínez",  emoji: "🧤", src: "/mundial/album/figu2.webp"  },
  { player: "Nahuel Molina",      emoji: "🚀", src: "/mundial/album/figu6.webp"  },
  { player: "Cristian Romero",    emoji: "🪓", src: "/mundial/album/figu9.webp"  },
  { player: "Leandro Paredes",    emoji: "🧠", src: "/mundial/album/figu11.webp" },
] as const
const COLS = 4
const ROWS = 3
const TOTAL = COLS * ROWS
/** Índice en SLOTS / celda del álbum de Messi (siempre el cierre). */
const MESSI_INDEX = 0

/* ─── Types ──────────────────────────────────────────────────── */
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

/* ─── Portal para el cursor ─── */
function CursorPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

/* ─── Cursor figurita ─── */
function FiguraCursor({ visible, cursorX, cursorY, src }: { visible: boolean; cursorX: any; cursorY: any; src: string }) {
  return (
    <CursorPortal>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="cursor"
            className="pointer-events-none fixed z-[9999] top-0 left-0"
            style={{ x: cursorX, y: cursorY }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              animate={{ rotate: [-12, -8, -12] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="origin-bottom-left"
            >
              <Image
                src={src}
                alt="figurita"
                width={80}
                height={104}
                loading="eager"
                fetchPriority="high"
                className="w-20 h-26 object-cover rounded-md shadow-2xl border border-white/20"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CursorPortal>
  )
}

/* ─── Slot individual ─── */
function Slot({ figu, emoji, onPlace }: { figu: SlotData; emoji: string; onPlace: () => void }) {
  return (
    <div
      onClick={figu === null ? onPlace : undefined}
      className={cn(
        "relative aspect-[10/13] rounded-md",
        // overflow-visible cuando hay figurita para que pueda sobresalir durante la animación
        figu ? "overflow-visible" : "overflow-hidden cursor-pointer group border border-dashed border-border/40 hover:border-primary/60 transition-colors",
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
            className="absolute inset-0 object-cover rounded-md shadow-lg"
            // Viene de arriba-izquierda rotada, cae con overshoot y se pega
            initial={{ y: -28, x: -6, rotate: -22, scale: 1.08, opacity: 0 }}
            animate={{
              y:      [null, 7,    -3,   0],
              x:      [null, 1,     0,   0],
              rotate: [null, 1.5, -0.8,  0],
              scale:  [null, 1.0,  0.98, 1],
              opacity: 1,
            }}
            transition={{
              duration: 0.42,
              times: [0, 0.52, 0.76, 1],
              ease: "easeOut",
              opacity: { duration: 0.12 },
            }}
          />
        ) : (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-1 group-hover:bg-primary/5 transition-colors rounded-md">
            <span className="text-3xl leading-none select-none">{emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Panel lateral de costos ─── */
function CostPanel({
  year,
  color,
  total,
  entries,
  currentCount,
  targetCount,
  pricePerFigu,
  salario,
  unit,
  align,
}: {
  year: string
  color: string
  total: number
  entries: StickerEntry[]
  currentCount: number
  targetCount: number
  pricePerFigu: number
  salario: number
  unit?: string
  align: "left" | "right"
}) {
  const horasTrabajo = total > 0 ? total / (salario / 176) : 0
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
              <motion.p
                className="text-xl font-bold font-mono"
                style={{ color }}
                key={total}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {formatCurrency(total, unit)}
              </motion.p>
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

/** Orden de celdas a completar: primero el resto al azar, Messi siempre al final. */
function buildSlotOrder(): number[] {
  const rest = Array.from({ length: TOTAL }, (_, i) => i).filter(i => i !== MESSI_INDEX)
  return [...shuffled(rest), MESSI_INDEX]
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

  // orden random al montar; Messi (índice 0) siempre es la última figurita
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
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)
  const cursorX = useSpring(rawX, { stiffness: 420, damping: 30 })
  const cursorY = useSpring(rawY, { stiffness: 420, damping: 30 })

  useEffect(() => {
    if (typeof window === "undefined") return
    for (const slot of SLOTS) {
      const img = new window.Image()
      img.src = slot.src
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    rawX.set(e.clientX + 8)
    rawY.set(e.clientY - 24)
  }, [rawX, rawY])

  const pushMobileSnack = useCallback((side: "left" | "right", amount: number) => {
    const id = ++snackCounter.current
    setMobileSnacks(prev => [...prev, { id, side, amount }])
    window.setTimeout(() => {
      setMobileSnacks(prev => prev.filter(s => s.id !== id))
    }, 1100)
  }, [])

  const placeSticker = useCallback((clickedIdx: number) => {
    const targetSlot = slotOrder[orderIdx]
    if (placed[clickedIdx]) return
    if (!isMobile && clickedIdx !== targetSlot) return

    const newPlaced = [...placed]
    const figuIdx = isMobile ? targetSlot : clickedIdx
    newPlaced[clickedIdx] = {
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
      slot_index: clickedIdx,
      sticker_index: figuIdx,
      sticker_player: SLOTS[figuIdx].player,
      stickers_completed: newPlaced.filter(Boolean).length,
      is_mobile: isMobile,
    })
  }, [slotOrder, orderIdx, placed, pricePerFigu2022, pricePerFigu2026, isMobile, pushMobileSnack])

  const placedCount = placed.filter(Boolean).length
  const allFilled = placedCount === TOTAL

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
  const blessedHoras2022 = blessedTotal2022 / hora_2022
  const blessedHoras2026 = blessedTotal2026 / hora_2026

  const laborTotal2022 = laborCount2022 * pricePerFigu2022
  const laborTotal2026 = laborCount2026 * pricePerFigu2026
  const laborHoras2022 = laborTotal2022 / hora_2022
  const laborHoras2026 = laborTotal2026 / hora_2026
  const blessedMonths2022 = blessedTotal2022 / salario_2022
  const blessedMonths2026 = blessedTotal2026 / salario_2026
  const laborMonths2022 = laborTotal2022 / salario_2022
  const laborMonths2026 = laborTotal2026 / salario_2026

  // cursor muestra la figurita que toca pegar ahora
  const cursorSrc = SLOTS[slotOrder[orderIdx] ?? 0]?.src ?? SLOTS[0].src
  const mobileLeftSnacks = mobileSnacks.filter(s => s.side === "left")
  const mobileRightSnacks = mobileSnacks.filter(s => s.side === "right")

  if (loading) return null

  return (
    <>
      {confettiBurst && <AlbumConfettiBurst onDone={endAlbumConfetti} />}
      <FiguraCursor visible={!isMobile && inAlbum && !allFilled} cursorX={cursorX} cursorY={cursorY} src={cursorSrc} />

      <SectionWrapper
        number="02"
        title="El álbum del Mundial"
        intro="Completar el álbum pasó de ser un hobby familiar a un lujo."
        bgColor="muted"
        sources={[sobreItem, figusSobreItem, albumItem, cantFiguritas, salario]}
      >
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed px-1">
          <span className="hidden md:inline">
            💡 Pasá el mouse por encima del álbum para revelar las figuritas, y hacé clic en donde te parece que van en función de las pistas dadas.
          </span>
          <span className="md:hidden">
            💡 Tocá el casillero donde creas que va cada figurita según las pistas (la figurita actual se ve arriba).
          </span>
        </p>

        {/* ── Tres columnas: [2022] [álbum] [2026] ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_1fr] lg:grid-cols-[1fr_450px_1fr] gap-6 items-start">

          {/* Panel 2022 (izquierda) */}
          <div className="hidden md:block">
            <CostPanel
              year="Qatar 2022"
              color="oklch(0.97 0.01 220)"
              total={totalCost2022}
              entries={entries2022}
              currentCount={effectiveCount2022}
              targetCount={totalFigus2022}
              pricePerFigu={pricePerFigu2022}
              salario={salario_2022}
              unit={unit}
              align="left"
            />
          </div>

          {/* Álbum central */}
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setInAlbum(true)}
            onMouseLeave={() => setInAlbum(false)}
            style={{ cursor: !isMobile && inAlbum && !allFilled ? "none" : "auto" }}
            className="relative isolate rounded-xl overflow-hidden border border-border/40 bg-card"
          >
            <div className="px-4 py-3 flex items-center justify-between bg-primary/10 border-b border-border/20">
              <p className="text-foreground font-semibold text-sm tracking-wide">
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
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Figurita actual</p>
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
                <Slot key={idx} figu={figu} emoji={SLOTS[idx].emoji} onPlace={() => placeSticker(idx)} />
              ))}
            </div>
          </div>

          {/* Panel 2026 (derecha) */}
          <div className="hidden md:block">
            <CostPanel
              year="EEUU 2026"
              color="oklch(0.65 0.18 222)"
              total={totalCost2026}
              entries={entries2026}
              currentCount={effectiveCount2026}
              targetCount={totalFigus2026}
              pricePerFigu={pricePerFigu2026}
              salario={salario_2026}
              unit={unit}
              align="right"
            />
          </div>
        </div>

        {/* ── Paneles en mobile (apilados) ── */}
        {placedCount > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 md:hidden">
            <div className="rounded-xl bg-card border border-border/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Qatar 2022</p>
              <p className="text-lg font-bold text-accent font-mono">{formatCurrency(totalCost2022, unit)}</p>
              <p className="text-[11px] text-muted-foreground">{horasTrabajo2022.toFixed(1)} horas de trabajo</p>
            </div>
            <div className="rounded-xl bg-card border border-border/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">EEUU 2026</p>
              <p className="text-lg font-bold text-primary font-mono">{formatCurrency(totalCost2026, unit)}</p>
              <p className="text-[11px] text-muted-foreground">{horasTrabajo2026.toFixed(1)} horas de trabajo</p>
            </div>
          </div>
        )}

        {/* ── Resumen final en dos escenarios ── */}
        <div className="mt-12 pt-8 border-t border-border/10 space-y-8">
          <h3 className="text-center font-semibold tracking-tight text-foreground text-base md:text-lg px-2">
            Entonces, ¿cuánto sale completar el álbum?
          </h3>

          <div className="rounded-xl bg-card border border-border/20 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 justify-center">
              <p className="text-sm font-medium text-foreground">Si sos más del "Elijo creer"...</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/40 text-[11px] text-muted-foreground hover:text-foreground"
                    aria-label="Más información"
                  >
                    i
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6} className="max-w-xs leading-relaxed">
                  Solo vas a necesitar 980 figuritas si no te toca ninguna repetida; es como ganar el loto 60 veces, es decir, imposible.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between">
              <MonthStack months={blessedMonths2022} color="oklch(0.97 0.01 220)" toneClass="text-accent" align="right" />
              <div className="space-y-1.5 text-center md:text-right min-w-0 shrink">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Qatar 2022</p>
                  <p className="text-sm text-muted-foreground">{totalFigus2022} figuritas totales</p>
                  <p className="text-2xl font-light text-accent font-mono">{formatCurrency(blessedTotal2022, unit)}</p>
                  <p className="text-sm text-muted-foreground">{blessedHoras2022.toFixed(1)} horas de trabajo</p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 md:flex-row md:items-stretch md:justify-between md:border-l md:border-border/10 md:pl-6">
                <div className="space-y-1.5 text-center md:text-right min-w-0 shrink">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">EEUU 2026</p>
                  <p className="text-sm text-muted-foreground">{totalFigus2026} figuritas totales</p>
                  <p className="text-2xl font-light text-primary font-mono">{formatCurrency(blessedTotal2026, unit)}</p>
                  <p className="text-sm text-muted-foreground">{blessedHoras2026.toFixed(1)} horas de trabajo</p>
                </div>
                <MonthStack months={blessedMonths2026} color="oklch(0.65 0.18 222)" toneClass="text-primary" align="left" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border/20 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 justify-center">
              <p className="text-sm font-medium text-foreground">Si lo tuyo es más huevo que suerte...</p>
            <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/40 text-[11px] text-muted-foreground hover:text-foreground"
                    aria-label="Más información"
                  >
                    i
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6} className="max-w-xs leading-relaxed">
                  Promedio sin intercambiar figuritas (coupon collector): n · (ln n + γ)
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between">
              <MonthStack months={laborMonths2022} color="oklch(0.97 0.01 220)" toneClass="text-accent" align="right" />
              <div className="space-y-1.5 text-center md:text-right min-w-0 shrink">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Qatar 2022</p>
                  <p className="text-sm text-muted-foreground">{laborCount2022} figuritas estimadas</p>
                  <p className="text-2xl font-light text-accent font-mono">{formatCurrency(laborTotal2022, unit)}</p>
                  <p className="text-sm text-muted-foreground">{laborHoras2022.toFixed(1)} horas de trabajo</p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 md:flex-row md:items-stretch md:justify-between md:border-l md:border-border/10 md:pl-6">
                <div className="space-y-1.5 text-center md:text-right min-w-0 shrink">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">EEUU 2026</p>
                  <p className="text-sm text-muted-foreground">{laborCount2026} figuritas estimadas</p>
                  <p className="text-2xl font-light text-primary font-mono">{formatCurrency(laborTotal2026, unit)}</p>
                  <p className="text-sm text-muted-foreground">{laborHoras2026.toFixed(1)} horas de trabajo</p>
                </div>
                <MonthStack months={laborMonths2026} color="oklch(0.65 0.18 222)" toneClass="text-primary" align="left" />
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
