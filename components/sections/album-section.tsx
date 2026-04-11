"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"

/* ─── Constantes ────────────────────────────────────────────── */
const SLOTS = [
  { player: "Lionel Messi",       emoji: "🐐", src: "/mundial/album/figu1.webp"  },
  { player: "Rodrigo De Paul",    emoji: "🔋", src: "/mundial/album/figu3.webp"  },
  { player: "Ángel Di María",     emoji: "👼", src: "/mundial/album/figu10.webp" },
  { player: "Nicolás Otamendi",   emoji: "🧱", src: "/mundial/album/figu7.webp"  },
  { player: "Marcos Acuña",       emoji: "🥚", src: "/mundial/album/figu8.webp"  },
  { player: "Julián Álvarez",     emoji: "🕷️", src: "/mundial/album/figu4.webp"  },
  { player: "Lautaro Martínez",   emoji: "🐂", src: "/mundial/album/figu12.webp" },
  { player: "Alejandro Gómez",    emoji: "🍬", src: "/mundial/album/figu5.webp"  },
  { player: "Emiliano Martínez",  emoji: "🧤", src: "/mundial/album/figu2.webp"  },
  { player: "Nahuel Molina",      emoji: "🚀", src: "/mundial/album/figu6.webp"  },
  { player: "Cristian Romero",    emoji: "✂️", src: "/mundial/album/figu9.webp"  },
  { player: "Leandro Paredes",    emoji: "🧠", src: "/mundial/album/figu11.webp" },
] as const
const COLS = 4
const ROWS = 3
const TOTAL = COLS * ROWS

/* ─── Types ──────────────────────────────────────────────────── */
interface PlacedFigu { src: string; price2022: number; price2026: number }
type SlotData = PlacedFigu | null
interface StickerEntry { id: number; price2022: number; price2026: number }

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
              <img
                src={src}
                alt="figurita"
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
          <motion.img
            key={figu.src}
            src={figu.src}
            alt="figurita"
            className="absolute inset-0 w-full h-full object-cover rounded-md shadow-lg"
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
            <span className="text-xl leading-none select-none">{emoji}</span>
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
  pricePerFigu,
  salario,
  unit,
  align,
}: {
  year: string
  color: string
  total: number
  entries: StickerEntry[]
  pricePerFigu: number
  salario: number
  unit?: string
  align: "left" | "right"
}) {
  const sueldos = total > 0 ? total / salario : 0
  const isRight = align === "right"

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
      <div className={cn("flex-1 w-full space-y-1 min-h-[250px]", isRight ? "" : "flex flex-col items-end")}>
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
              <span className="text-muted-foreground/50 w-4 text-[10px]">{i + 1}</span>
              <span className="font-medium" style={{ color }}>
                +{formatCurrency(isRight ? e.price2026 : e.price2022, unit)}
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
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {sueldos.toFixed(2)} sueldos
              </p>
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

/* ─── Sección principal ──────────────────────────────────────── */
export function AlbumSection() {
  const { getIndicador, loading } = useData()
  const sobreItem = getIndicador("PRECIO_SOBRE_FIGURITAS")
  const albumItem = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const sobre_2022 = sobreItem?.valor_2022 ?? 150
  const sobre_2026 = sobreItem?.valor_2026 ?? 2500
  const salario_2022 = salario?.valor_2022 ?? 61953
  const salario_2026 = salario?.valor_2026 ?? 346800
  const unit = sobreItem?.unidad

  const pricePerFigu2022 = sobre_2022 / 5
  const pricePerFigu2026 = sobre_2026 / 5

  // orden random generado una sola vez al montar
  const [slotOrder] = useState(() => shuffled(Array.from({ length: TOTAL }, (_, i) => i)))
  // posición dentro del orden shuffled
  const [orderIdx, setOrderIdx] = useState(0)

  const [placed, setPlaced] = useState<SlotData[]>(Array(TOTAL).fill(null))
  const [entries, setEntries] = useState<StickerEntry[]>([])
  const entryCounter = useRef(0)

  const [inAlbum, setInAlbum] = useState(false)
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)
  const cursorX = useSpring(rawX, { stiffness: 420, damping: 30 })
  const cursorY = useSpring(rawY, { stiffness: 420, damping: 30 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    rawX.set(e.clientX + 8)
    rawY.set(e.clientY - 24)
  }, [rawX, rawY])

  const placeSticker = useCallback((clickedIdx: number) => {
    const targetSlot = slotOrder[orderIdx]
    if (clickedIdx !== targetSlot) return
    if (placed[clickedIdx]) return

    const newPlaced = [...placed]
    newPlaced[clickedIdx] = {
      src: SLOTS[clickedIdx].src,
      price2022: pricePerFigu2022,
      price2026: pricePerFigu2026,
    }
    setPlaced(newPlaced)
    setEntries(prev => [...prev, { id: ++entryCounter.current, price2022: pricePerFigu2022, price2026: pricePerFigu2026 }])
    if (orderIdx + 1 < TOTAL) setOrderIdx(orderIdx + 1)
  }, [slotOrder, orderIdx, placed, pricePerFigu2022, pricePerFigu2026])

  const placedCount = placed.filter(Boolean).length
  const totalCost2022 = placedCount * pricePerFigu2022
  const totalCost2026 = placedCount * pricePerFigu2026
  const allFilled = placedCount === TOTAL

  const sueldos2022 = totalCost2022 > 0 ? totalCost2022 / salario_2022 : 0
  const sueldos2026 = totalCost2026 > 0 ? totalCost2026 / salario_2026 : 0

  // cursor muestra la figurita que toca pegar ahora
  const cursorSrc = SLOTS[slotOrder[orderIdx] ?? 0]?.src ?? SLOTS[0].src

  if (loading) return null

  return (
    <>
      <FiguraCursor visible={inAlbum && !allFilled} cursorX={cursorX} cursorY={cursorY} src={cursorSrc} />

      <SectionWrapper
        number="02"
        title="El álbum del Mundial"
        intro="Completar el álbum pasó de ser un hobby familiar a un lujo."
        bgColor="muted"
        sources={[sobreItem, albumItem, salario]}
      >
        {/* ── Tres columnas: [2022] [álbum] [2026] ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_1fr] lg:grid-cols-[1fr_360px_1fr] gap-6 items-start">

          {/* Panel 2022 (izquierda) */}
          <div className="hidden md:block">
            <CostPanel
              year="Qatar 2022"
              color="oklch(0.65 0.18 222)"
              total={totalCost2022}
              entries={entries}
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
            style={{ cursor: inAlbum && !allFilled ? "none" : "auto" }}
            className="rounded-xl overflow-hidden border border-border/40 bg-card"
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
              color="oklch(0.85 0.10 215)"
              total={totalCost2026}
              entries={entries}
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
              <p className="text-lg font-bold text-primary font-mono">{formatCurrency(totalCost2022, unit)}</p>
              <p className="text-[11px] text-muted-foreground">{sueldos2022.toFixed(2)} sueldos</p>
            </div>
            <div className="rounded-xl bg-card border border-border/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">EEUU 2026</p>
              <p className="text-lg font-bold text-secondary font-mono">{formatCurrency(totalCost2026, unit)}</p>
              <p className="text-[11px] text-muted-foreground">{sueldos2026.toFixed(2)} sueldos</p>
            </div>
          </div>
        )}

        {/* ── Stats abajo en 2 columnas ── */}
        <div className="mt-12 pt-8 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 2022 */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Qatar 2022</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-light text-primary font-mono">{formatCurrency(totalCost2022, unit)}</p>
              <p className="text-sm text-muted-foreground">gastado</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{placedCount} figurita{placedCount !== 1 ? "s" : ""} × {formatCurrency(pricePerFigu2022, unit)}</p>
              <p>{formatCurrency(sobre_2022, unit)}/sobre</p>
            </div>
            <div className="pt-2 border-t border-border/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sueldos mínimos necesarios</p>
              <p className="text-2xl font-bold text-primary">
                {sueldos2022 > 0 ? sueldos2022.toFixed(2) : "—"}
                {sueldos2022 > 0 && <span className="text-sm font-normal text-muted-foreground ml-1">sueldos</span>}
              </p>
            </div>
          </div>

          {/* 2026 */}
          <div className="space-y-3 md:border-l md:border-border/10 md:pl-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">EEUU 2026</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-light text-secondary font-mono">{formatCurrency(totalCost2026, unit)}</p>
              <p className="text-sm text-muted-foreground">gastado</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{placedCount} figurita{placedCount !== 1 ? "s" : ""} × {formatCurrency(pricePerFigu2026, unit)}</p>
              <p>{formatCurrency(sobre_2026, unit)}/sobre</p>
            </div>
            <div className="pt-2 border-t border-border/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sueldos mínimos necesarios</p>
              <p className="text-2xl font-bold text-secondary">
                {sueldos2026 > 0 ? sueldos2026.toFixed(2) : "—"}
                {sueldos2026 > 0 && <span className="text-sm font-normal text-muted-foreground ml-1">sueldos</span>}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  )
}
