"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
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
const ROWS = 3   // 4 × 4 = 16 slots por álbum
const TOTAL = COLS * ROWS

/* ─── Types ──────────────────────────────────────────────────── */
interface PlacedFigu { src: string; price: number }
type Slot = PlacedFigu | null

interface PriceBadge { id: number; price: number; slotIdx: number }

/* ─── Portal para el cursor (evita problemas con transform parents) */
function CursorPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

/* ─── Cursor figurita ────────────────────────────────────────── */
function FiguraCursor({
  visible,
  cursorX,
  cursorY,
  src,
}: {
  visible: boolean
  cursorX: ReturnType<typeof useSpring>
  cursorY: ReturnType<typeof useSpring>
  src: string
}) {
  return (
    <CursorPortal>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="cursor"
            className="pointer-events-none fixed z-9999 top-0 left-0"
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
                className="w-20 h-26 object-cover rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.55)] border border-white/20"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CursorPortal>
  )
}

/* ─── Slot individual ────────────────────────────────────────── */
function Slot({
  figu,
  idx,
  badges,
  onPlace,
  formatARS,
}: {
  figu: Slot
  idx: number
  badges: PriceBadge[]
  onPlace: () => void
  formatARS: (n: number) => string
}) {
  const badgeHere = badges.find(b => b.slotIdx === idx)

  return (
    <div
      onClick={figu === null ? onPlace : undefined}
      className={cn(
        "relative aspect-[10/13] rounded-md overflow-visible",
        figu === null
          ? "cursor-pointer group border border-dashed border-border/40 hover:border-primary/60 transition-colors"
          : "",
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
          <motion.div
            key="empty"
            className="absolute inset-0 flex items-center justify-center group-hover:bg-primary/5 transition-colors rounded-md"
          >
            <span className="text-border/40 text-lg select-none">+</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de precio que flota brevemente al pegar */}
      <AnimatePresence>
        {badgeHere && (
          <motion.div
            key={badgeHere.id}
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, y: 4, scale: 0.7 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
              +{formatARS(badgeHere.price)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Álbum completo ─────────────────────────────────────────── */
function Album({
  yearLabel,
  headerColor,
  placed,
  badges,
  totalCost,
  pricePerFigu,
  onPlace,
  formatARS,
}: {
  yearLabel: string
  headerColor: string
  placed: Slot[]
  badges: PriceBadge[]
  totalCost: number
  pricePerFigu: number
  onPlace: (idx: number) => void
  formatARS: (n: number) => string
}) {
  const allFilled = placed.every(s => s !== null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-xl overflow-hidden border border-border/40 bg-card flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: headerColor }}>
        <div>
          <p className="text-white font-bold text-sm tracking-widest uppercase">{yearLabel}</p>
          <p className="text-white/60 text-[11px] mt-0.5">
            {formatARS(pricePerFigu)}/figurita
          </p>
        </div>

        {/* Total gastado — anima al cambiar */}
        <div className="text-right">
          <p className="text-white/60 text-[10px] uppercase tracking-wider">Gastado</p>
          <motion.p
            key={totalCost}
            initial={{ scale: 1.3, color: "#fff" }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="text-white font-bold text-sm font-mono"
          >
            {formatARS(totalCost)}
          </motion.p>
        </div>
      </div>

      {/* Grid de slots */}
      <div
        className="p-3 grid gap-2 flex-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {placed.map((figu, idx) => (
          <Slot
            key={idx}
            figu={figu}
            idx={idx}
            badges={badges}
            onPlace={() => onPlace(idx)}
            formatARS={formatARS}
          />
        ))}
      </div>

      {/* Completo! */}
      <AnimatePresence>
        {allFilled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 text-center border-t border-border/30"
          >
            <p className="text-sm font-medium text-foreground">¡Álbum completo! 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total: {formatARS(totalCost)}</p>
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
  const album_2022 = albumItem?.valor_2022 ?? 750
  const album_2026 = albumItem?.valor_2026 ?? 4500
  const salario_2022 = salario?.valor_2022 ?? 61953
  const salario_2026 = salario?.valor_2026 ?? 346800

  const pricePerFigu2022 = sobre_2022 / 5
  const pricePerFigu2026 = sobre_2026 / 5

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

  /* Estado álbumes */
  const [placed2022, setPlaced2022] = useState<Slot[]>(Array(TOTAL).fill(null))
  const [placed2026, setPlaced2026] = useState<Slot[]>(Array(TOTAL).fill(null))
  const [badges2022, setBadges2022] = useState<PriceBadge[]>([])
  const [badges2026, setBadges2026] = useState<PriceBadge[]>([])
  const [figuIdx, setFiguIdx] = useState(0)
  const badgeCounter = useRef(0)

  const totalCost2022 = placed2022.reduce((s, p) => s + (p?.price ?? 0), 0)
  const totalCost2026 = placed2026.reduce((s, p) => s + (p?.price ?? 0), 0)

  /* Cursor */
  const [inSection, setInSection] = useState(false)
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)
  const cursorX = useSpring(rawX, { stiffness: 420, damping: 30 })
  const cursorY = useSpring(rawY, { stiffness: 420, damping: 30 })

  const sectionRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Offset para que la esquina top-left de la figurita esté cerca del cursor
      rawX.set(e.clientX + 8)
      rawY.set(e.clientY - 24)
    },
    [rawX, rawY],
  )

  /* Pegar figurita */
  const placeSticker = useCallback(
    (year: "2022" | "2026", idx: number) => {
      const price = year === "2022" ? pricePerFigu2022 : pricePerFigu2026
      const src = FIGUS[figuIdx]
      const id = ++badgeCounter.current

      if (year === "2022") {
        setPlaced2022(prev => {
          if (prev[idx] !== null) return prev
          const next = [...prev]; next[idx] = { src, price }; return next
        })
        setBadges2022(prev => [...prev, { id, price, slotIdx: idx }])
        setTimeout(() => setBadges2022(prev => prev.filter(b => b.id !== id)), 1200)
      } else {
        setPlaced2026(prev => {
          if (prev[idx] !== null) return prev
          const next = [...prev]; next[idx] = { src, price }; return next
        })
        setBadges2026(prev => [...prev, { id, price, slotIdx: idx }])
        setTimeout(() => setBadges2026(prev => prev.filter(b => b.id !== id)), 1200)
      }

      setFiguIdx(i => (i + 1) % FIGUS.length)
    },
    [figuIdx, pricePerFigu2022, pricePerFigu2026],
  )

  if (loading) {
    return (
      <SectionWrapper number="02" title="El álbum del Mundial" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  const sobres2022 = Math.floor(salario_2022 / sobre_2022)
  const sobres2026 = Math.floor(salario_2026 / sobre_2026)

  return (
    <>
      {/* Cursor figurita — via portal para evitar stacking context */}
      <FiguraCursor
        visible={inSection}
        cursorX={cursorX}
        cursorY={cursorY}
        src={FIGUS[figuIdx]}
      />

      <div
        ref={sectionRef}
        id="album"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setInSection(true)}
        onMouseLeave={() => setInSection(false)}
        style={{ cursor: inSection ? "none" : "auto" }}
      >
        <SectionWrapper
          number="02"
          title="El álbum del Mundial"
          intro="Completar el álbum pasó de ser un hobby familiar a un lujo. Pegá figuritas y fijate cuánto gastás."
          bgColor="muted"
          sources={[sobreItem, albumItem, salario]}
        >
          {/* Instrucción */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-muted-foreground/60 mb-6 text-center tracking-wide"
          >
            Pasá el mouse por encima y hacé click en los cuadros vacíos para pegar figuritas →
          </motion.p>

          {/* Álbumes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Album
              yearLabel="Qatar 2022"
              headerColor="oklch(0.52 0.16 222)"
              placed={placed2022}
              badges={badges2022}
              totalCost={totalCost2022}
              pricePerFigu={pricePerFigu2022}
              onPlace={idx => placeSticker("2022", idx)}
              formatARS={formatARS}
            />
            <Album
              yearLabel="EEUU 2026"
              headerColor="oklch(0.40 0.12 240)"
              placed={placed2026}
              badges={badges2026}
              totalCost={totalCost2026}
              pricePerFigu={pricePerFigu2026}
              onPlace={idx => placeSticker("2026", idx)}
              formatARS={formatARS}
            />
          </div>

          {/* Stats debajo */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            {[
              { label: "Sobres por sueldo mínimo", val2022: sobres2022, val2026: sobres2026, suffix: " sobres" },
              { label: "Precio del sobre", val2022: sobre_2022, val2026: sobre_2026, fmt: true },
            ].map(({ label, val2022, val2026, suffix, fmt }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60">{label}</p>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-xl font-light text-primary">
                      {fmt ? formatARS(val2022) : val2022}{suffix}
                    </p>
                    <p className="text-xs text-muted-foreground">2022</p>
                  </div>
                  <div>
                    <p className="text-xl font-light text-accent">
                      {fmt ? formatARS(val2026) : val2026}{suffix}
                    </p>
                    <p className="text-xs text-muted-foreground">2026</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </>
  )
}
