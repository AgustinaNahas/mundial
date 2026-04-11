"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"

/* ─── Constantes ────────────────────────────────────────────── */
const FIGUS = [
  "/mundial/album/figu1.webp", "/mundial/album/figu2.webp", "/mundial/album/figu3.webp",
  "/mundial/album/figu4.webp", "/mundial/album/figu5.webp", "/mundial/album/figu6.webp",
  "/mundial/album/figu7.webp", "/mundial/album/figu8.webp", "/mundial/album/figu9.webp",
  "/mundial/album/figu10.webp", "/mundial/album/figu11.webp", "/mundial/album/figu12.webp",
]
const COLS = 4
const ROWS = 3   // 4 × 3 = 12 slots por álbum
const TOTAL = COLS * ROWS

/* ─── Types ──────────────────────────────────────────────────── */
interface PlacedFigu { src: string; price: number }
type Slot = PlacedFigu | null

interface PriceBadge { id: number; price: number; slotIdx: number }

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
function Slot({ figu, idx, badges, onPlace, unit }: { figu: Slot; idx: number; badges: PriceBadge[]; onPlace: () => void; unit?: string }) {
  const badgeHere = badges.find(b => b.slotIdx === idx)
  return (
    <div
      onClick={figu === null ? onPlace : undefined}
      className={cn(
        "relative aspect-[10/13] rounded-md overflow-visible",
        figu === null ? "cursor-pointer group border border-dashed border-border/40 hover:border-primary/60 transition-colors" : "",
      )}
    >
      <AnimatePresence mode="wait">
        {figu ? (
          <motion.img
            key={figu.src + idx}
            src={figu.src}
            alt="figurita"
            className="absolute inset-0 w-full h-full object-cover rounded-md"
            initial={{ scale: 1.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          />
        ) : (
          <motion.div className="absolute inset-0 flex items-center justify-center group-hover:bg-primary/5 transition-colors rounded-md">
            <span className="text-border/40 text-lg select-none">+</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {badgeHere && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: 4, scale: 0.7 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
              +{formatCurrency(badgeHere.price, unit)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Álbum completo ─── */
function Album({ yearLabel, headerColor, placed, badges, totalCost, pricePerFigu, onPlace, unit }: any) {
  const allFilled = placed.every((s: any) => s !== null)
  return (
    <motion.div className="rounded-xl overflow-hidden border border-border/40 bg-card flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: headerColor }}>
        <div>
          <p className="text-white font-bold text-sm tracking-widest uppercase">{yearLabel}</p>
          <p className="text-white/60 text-[11px] mt-0.5">{formatCurrency(pricePerFigu, unit)}/figurita</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] uppercase tracking-wider">Gastado</p>
          <motion.p className="text-white font-bold text-sm font-mono">{formatCurrency(totalCost, unit)}</motion.p>
        </div>
      </div>
      <div className="p-3 grid gap-1 sm:gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {placed.map((figu: any, idx: number) => (
          <Slot key={idx} figu={figu} idx={idx} badges={badges} onPlace={() => onPlace(idx)} unit={unit} />
        ))}
      </div>
      <AnimatePresence>
        {allFilled && (
          <motion.div className="px-4 py-3 text-center border-t border-border/30">
            <p className="text-sm font-medium text-foreground">¡Álbum completo! 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total: {formatCurrency(totalCost, unit)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
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

  const pricePerFigu2022 = sobre_2022 / 5
  const pricePerFigu2026 = sobre_2026 / 5
  const unit = sobreItem?.unidad

  const [placed2022, setPlaced2022] = useState<Slot[]>(Array(TOTAL).fill(null))
  const [placed2026, setPlaced2026] = useState<Slot[]>(Array(TOTAL).fill(null))
  const [badges2022, setBadges2022] = useState<PriceBadge[]>([])
  const [badges2026, setBadges2026] = useState<PriceBadge[]>([])
  const [figuIdx, setFiguIdx] = useState(0)
  const badgeCounter = useRef(0)

  const totalCost2022 = placed2022.reduce((s, p) => s + (p?.price ?? 0), 0)
  const totalCost2026 = placed2026.reduce((s, p) => s + (p?.price ?? 0), 0)

  const [inSection, setInSection] = useState(false)
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)
  const cursorX = useSpring(rawX, { stiffness: 420, damping: 30 })
  const cursorY = useSpring(rawY, { stiffness: 420, damping: 30 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    rawX.set(e.clientX + 8)
    rawY.set(e.clientY - 24)
  }, [rawX, rawY])

  const placeSticker = useCallback((year: "2022" | "2026", idx: number) => {
    const price = year === "2022" ? pricePerFigu2022 : pricePerFigu2026
    const src = FIGUS[figuIdx]
    const id = ++badgeCounter.current
    if (year === "2022") {
      setPlaced2022(prev => { if (prev[idx]) return prev; const n = [...prev]; n[idx] = { src, price }; return n; })
      setBadges2022(prev => [...prev, { id, price, slotIdx: idx }])
      setTimeout(() => setBadges2022(prev => prev.filter(b => b.id !== id)), 1200)
    } else {
      setPlaced2026(prev => { if (prev[idx]) return prev; const n = [...prev]; n[idx] = { src, price }; return n; })
      setBadges2026(prev => [...prev, { id, price, slotIdx: idx }])
      setTimeout(() => setBadges2026(prev => prev.filter(b => b.id !== id)), 1200)
    }
    setFiguIdx(i => (i + 1) % FIGUS.length)
  }, [figuIdx, pricePerFigu2022, pricePerFigu2026])

  if (loading) return null

  const sobres2022 = Math.floor(salario_2022 / sobre_2022)
  const sobres2026 = Math.floor(salario_2026 / sobre_2026)

  return (
    <>
      <FiguraCursor visible={inSection} cursorX={cursorX} cursorY={cursorY} src={FIGUS[figuIdx]} />
      <div onMouseMove={handleMouseMove} onMouseEnter={() => setInSection(true)} onMouseLeave={() => setInSection(false)} style={{ cursor: inSection ? "none" : "auto" }}>
        <SectionWrapper number="02" title="El álbum del Mundial" intro="Completar el álbum pasó de ser un hobby familiar a un lujo." bgColor="muted" sources={[sobreItem, albumItem, salario]}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Album yearLabel="Qatar 2022" headerColor="oklch(0.52 0.16 222)" placed={placed2022} badges={badges2022} totalCost={totalCost2022} pricePerFigu={pricePerFigu2022} onPlace={(i:any) => placeSticker("2022", i)} unit={unit} />
            <Album yearLabel="EEUU 2026" headerColor="oklch(0.40 0.12 240)" placed={placed2026} badges={badges2026} totalCost={totalCost2026} pricePerFigu={pricePerFigu2026} onPlace={(i:any) => placeSticker("2026", i)} unit={unit} />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "Sobres por sueldo mínimo", v22: sobres2022, v26: sobres2026, s: " sobres" },
              { label: "Precio del sobre", v22: sobre_2022, v26: sobre_2026, f: true }
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xl font-light text-primary">{item.f ? formatCurrency(item.v22, unit) : item.v22}{item.s}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">2022</p>
                  </div>
                  <div>
                    <p className="text-xl font-light text-accent">{item.f ? formatCurrency(item.v26, unit) : item.v26}{item.s}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">2026</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </>
  )
}
