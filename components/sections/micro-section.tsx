"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.micro
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/utils"

const BASE_PATH = "/mundial"

// ─── Player data ──────────────────────────────────────────────

interface PlayerData {
  label: string
  nombre: string
}

const PLAYERS: PlayerData[] = [
  { label: "Dibu",         nombre: "Emiliano Martínez" },
  { label: "Armani",       nombre: "Franco Armani" },
  { label: "Rulli",        nombre: "Gerónimo Rulli" },
  { label: "Molina",       nombre: "Nahuel Molina" },
  { label: "Montiel",      nombre: "Gonzalo Montiel" },
  { label: "Cuti",         nombre: "Cristian Romero" },
  { label: "Pezzella",     nombre: "Germán Pezzella" },
  { label: "Otamendi",     nombre: "Nicolás Otamendi" },
  { label: "Acuña",        nombre: "Marcos Acuña" },
  { label: "Tagliafico",   nombre: "Nicolás Tagliafico" },
  { label: "Foyth",        nombre: "Juan Foyth" },
  { label: "De Paul",      nombre: "Rodrigo De Paul" },
  { label: "Paredes",      nombre: "Leandro Paredes" },
  { label: "Mac Allister", nombre: "Alexis Mac Allister" },
  { label: "Enzo",         nombre: "Enzo Fernández" },
  { label: "Guido",        nombre: "Guido Rodríguez" },
  { label: "Palacios",     nombre: "Exequiel Palacios" },
  { label: "Almada",       nombre: "Thiago Almada" },
  { label: "Messi",        nombre: "Lionel Messi" },
  { label: "Di María",     nombre: "Ángel Di María" },
  { label: "Lautaro",      nombre: "Lautaro Martínez" },
  { label: "J. Álvarez",   nombre: "Julián Álvarez" },
  { label: "Dybala",       nombre: "Paulo Dybala" },
  { label: "Correa",       nombre: "Joaquín Correa" },
  { label: "N. González",  nombre: "Nicolás González" },
  { label: "Papu",         nombre: "Alejandro Gómez" },
]

function splitNombreEnDosLineas(nombre: string): [string, string] {
  const parts = nombre.trim().split(/\s+/)
  if (parts.length <= 1) return [parts[0] ?? "", ""]
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]]
}

// ─── Bus layout constants ─────────────────────────────────────

const MARGIN = 20
const NUM_ROWS = 9
const SEAT_SIZE = 30
const SEAT_GAP = 6
const CIRCLE_D = 22
const REAR_PADDING = 34
const REAR_WINDOW = 11
const NAME_BLOCK_H = 30
const PRICE_GAP = 5

const MOBILE_BREAKPOINT = "(max-width: 1023px)"

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return narrow
}

const MOBILE_MAX_VH = 0.9

/** Escala el micro vertical para que no supere 90vh (asientos + nombres siguen alineados). */
function useMobileBusScale(svgHeight: number, enabled: boolean) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    if (!enabled) {
      setScale(1)
      return
    }
    const update = () => {
      setScale(Math.min(1, (window.innerHeight * MOBILE_MAX_VH) / svgHeight))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [enabled, svgHeight])
  return scale
}

// Horizontal top-view: front = left, back = right
const SVG_W = 820
const SVG_H = 250

const TOP_Y1 = MARGIN + SEAT_SIZE / 2
const TOP_Y2 = MARGIN + SEAT_SIZE + SEAT_GAP + SEAT_SIZE / 2
const BOTTOM_Y = SVG_H - MARGIN - SEAT_SIZE / 2
const TOP_SEAT2_Y = MARGIN + SEAT_SIZE + SEAT_GAP
const BOTTOM_SEAT_Y = SVG_H - MARGIN - SEAT_SIZE

const WHEEL_CX = MARGIN + 22
const WHEEL_CY = SVG_H - MARGIN - 20
const WHEEL_R = 16
const DRIVER_SEAT_W = 30
const DRIVER_SEAT_H = 32
const DRIVER_SEAT_X = WHEEL_CX + WHEEL_R + 10
const DRIVER_SEAT_Y = SVG_H - MARGIN - DRIVER_SEAT_H

const DRIVER_ZONE = 76
const PARTITION_X = DRIVER_SEAT_X + DRIVER_SEAT_W + DRIVER_ZONE
const ROW_START_X = PARTITION_X + 12
const BUS_END_X = SVG_W - MARGIN - REAR_PADDING - REAR_WINDOW
const ROW_W = (BUS_END_X - SEAT_SIZE / 2 - ROW_START_X) / (NUM_ROWS - 1)

const ENTRANCE_CX = PARTITION_X - ROW_W / 2
const ENTRANCE_CY = (TOP_Y2 + BOTTOM_Y) / 2

function getSeatPosH(index: number): { x: number; y: number; col: number } {
  const row = Math.floor(index / 3)
  const col = index % 3
  const x = ROW_START_X + row * ROW_W
  const y = col === 0 ? TOP_Y1 : col === 1 ? TOP_Y2 : BOTTOM_Y
  return { x, y, col }
}

// Vertical top-view (mobile): front = top, back = bottom
const SVG_W_V = 250
const SEAT_GAP_V = 28

const LEFT_X1 = MARGIN + SEAT_SIZE / 2
const LEFT_X2 = MARGIN + SEAT_SIZE + SEAT_GAP_V + SEAT_SIZE / 2
const LEFT_SEAT2_X = MARGIN + SEAT_SIZE + SEAT_GAP_V
const RIGHT_X = SVG_W_V - MARGIN - SEAT_SIZE / 2
const RIGHT_SEAT_X = SVG_W_V - MARGIN - SEAT_SIZE

const WHEEL_CX_V = MARGIN + 22
const WHEEL_CY_V = MARGIN + 22
const DRIVER_SEAT_Y_V = WHEEL_CY_V + WHEEL_R + 8
const DRIVER_SEAT_H_V = 32
const DRIVER_SEAT_W_V = 30
const DRIVER_SEAT_X_V = WHEEL_CX_V - DRIVER_SEAT_W_V / 2

const DRIVER_BOTTOM_V = DRIVER_SEAT_Y_V + DRIVER_SEAT_H_V
const PARTITION_Y = DRIVER_BOTTOM_V

// Referencia 820px: mitad de pasillo entre filas de pasajeros → micro más bajo
const REF_BUS_END_Y = 820 - MARGIN - REAR_PADDING - REAR_WINDOW
const ROW_CENTER_END_REF = REF_BUS_END_Y - SEAT_SIZE / 2
const ROW_H_FULL = (ROW_CENTER_END_REF - DRIVER_BOTTOM_V + SEAT_SIZE) / NUM_ROWS
const ROW_PITCH = SEAT_SIZE + (ROW_H_FULL - SEAT_SIZE) / 2
const ROW_START_Y = DRIVER_BOTTOM_V + ROW_H_FULL - SEAT_SIZE
const SVG_H_V = Math.ceil(
  ROW_START_Y + (NUM_ROWS - 1) * ROW_PITCH + SEAT_SIZE / 2 + MARGIN + REAR_PADDING + REAR_WINDOW,
)
const BUS_END_Y = SVG_H_V - MARGIN - REAR_PADDING - REAR_WINDOW

const ENTRANCE_CX_V = SVG_W_V / 2
const ENTRANCE_CY_V = DRIVER_BOTTOM_V + (ROW_H_FULL - SEAT_SIZE) / 2

function getSeatPosV(index: number): { x: number; y: number; col: number } {
  const row = Math.floor(index / 3)
  const col = index % 3
  const y = ROW_START_Y + row * ROW_PITCH
  const x = col === 0 ? LEFT_X1 : col === 1 ? LEFT_X2 : RIGHT_X
  return { x, y, col }
}

function nameBelowSeat(col: number, vertical: boolean) {
  if (vertical) return false
  return col === 1
}

/** Fracción de scroll hasta completar los 26; el resto es margen con el Obelisco. */
const BOARDING_SCROLL_END = 0.8
const SCROLL_MIN_HEIGHT_DESKTOP = "500vh"
const SCROLL_MIN_HEIGHT_MOBILE = "380vh"
const BUS_TOP_PAD = 40
const BUS_TOP_PAD_MOBILE = 16

// ─── Bus SVG ──────────────────────────────────────────────────
// Top-down, horizontal: left = front, right = back — layout 2+1

function BusTopView({ showObelisco }: { showObelisco?: boolean }) {
  const GA = "#2d6f35"
  const GB = "#1e5228"
  const SEAT_F = "#132c17"
  const SEAT_BORDER = "#ffffff"
  const DARK = "#0c1f0e"
  const SHELL = "#1a4920"
  const WHEEL = "#0a0a0a"
  const floorOpacity = showObelisco ? 0.32 : 1
  const aisleOpacity = showObelisco ? 0.22 : 0.55
  const shellOpacity = showObelisco ? 0.72 : 1
  const stripeCount = Math.ceil((SVG_W - MARGIN * 2) / 32)
  const aisleY = TOP_SEAT2_Y + SEAT_SIZE + 4
  const aisleH = BOTTOM_SEAT_Y - aisleY - 4

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      className="drop-shadow-2xl max-w-full h-auto"
      aria-hidden
    >
      <defs>
        <clipPath id="bus-int-clip">
          <rect x={MARGIN} y={MARGIN} width={SVG_W - MARGIN * 2} height={SVG_H - MARGIN * 2} rx="14" />
        </clipPath>
      </defs>

      {/* Outer shell */}
      <rect
        x="1" y="1" width={SVG_W - 2} height={SVG_H - 2} rx="18"
        fill={DARK} fillOpacity={shellOpacity} stroke={SHELL} strokeWidth="2.5"
      />

      {/* Cancha-stripe interior floor */}
      <g clipPath="url(#bus-int-clip)">
        {Array.from({ length: stripeCount }).map((_, i) => (
          <rect
            key={i}
            x={MARGIN + i * 32}
            y={MARGIN}
            width={32}
            height={SVG_H - MARGIN * 2}
            fill={i % 2 === 0 ? GA : GB}
            fillOpacity={floorOpacity}
          />
        ))}
      </g>

      {/* Pasillo central */}
      <rect
        x={MARGIN}
        y={aisleY}
        width={SVG_W - MARGIN * 2}
        height={aisleH}
        fill="#152e18"
        opacity={aisleOpacity}
        clipPath="url(#bus-int-clip)"
      />

      {/* 9 filas × layout 2+1 — asientos cuadrados */}
      {Array.from({ length: NUM_ROWS }).map((_, row) => {
        const cx = ROW_START_X + row * ROW_W
        const sx = cx - SEAT_SIZE / 2
        return (
          <g key={row}>
            <rect x={sx} y={MARGIN} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
            <rect x={sx} y={TOP_SEAT2_Y} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
            <rect x={sx} y={BOTTOM_SEAT_Y} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
          </g>
        )
      })}

      {/* Partition: conductor / pasajeros */}
      <rect x={PARTITION_X} y={MARGIN} width="2.5" height={SVG_H - MARGIN * 2} fill="#0f2612" />

      {/* Volante (negro) — a la izquierda */}
      <circle cx={WHEEL_CX} cy={WHEEL_CY} r={WHEEL_R} fill="none" stroke={WHEEL} strokeWidth="2.5" />
      <circle cx={WHEEL_CX} cy={WHEEL_CY} r="4" fill={WHEEL} />
      <line x1={WHEEL_CX} y1={WHEEL_CY - WHEEL_R} x2={WHEEL_CX} y2={WHEEL_CY - 6} stroke={WHEEL} strokeWidth="2" />
      <line x1={WHEEL_CX - WHEEL_R} y1={WHEEL_CY} x2={WHEEL_CX - 6} y2={WHEEL_CY} stroke={WHEEL} strokeWidth="2" />
      <line x1={WHEEL_CX + 6} y1={WHEEL_CY} x2={WHEEL_CX + WHEEL_R} y2={WHEEL_CY} stroke={WHEEL} strokeWidth="2" />

      {/* Asiento conductor — a la derecha del volante */}
      <rect
        x={DRIVER_SEAT_X} y={DRIVER_SEAT_Y}
        width={DRIVER_SEAT_W} height={DRIVER_SEAT_H} rx="3"
        fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2"
      />

      {/* Front windshield (left) */}
      <rect x={MARGIN + 4} y={MARGIN + 8} width="9" height={SVG_H - MARGIN * 2 - 16} rx="3"
        fill="#0d2a55" opacity="0.6" clipPath="url(#bus-int-clip)" />
      {/* Rear window */}
      <rect x={SVG_W - MARGIN - REAR_PADDING - REAR_WINDOW} y={MARGIN + 8} width={REAR_WINDOW} height={SVG_H - MARGIN * 2 - 16} rx="4"
        fill="#0d2a55" opacity="0.65" clipPath="url(#bus-int-clip)" />
    </svg>
  )
}

// Vertical top-view (mobile): front = top, back = bottom

function BusVerticalView({ showObelisco }: { showObelisco?: boolean }) {
  const GA = "#2d6f35"
  const GB = "#1e5228"
  const SEAT_F = "#132c17"
  const SEAT_BORDER = "#ffffff"
  const DARK = "#0c1f0e"
  const SHELL = "#1a4920"
  const WHEEL = "#0a0a0a"
  const floorOpacity = showObelisco ? 0.32 : 1
  const aisleOpacity = showObelisco ? 0.22 : 0.55
  const shellOpacity = showObelisco ? 0.72 : 1
  const stripeCount = Math.ceil((SVG_H_V - MARGIN * 2) / 32)
  const aisleX = LEFT_SEAT2_X + SEAT_SIZE + 4
  const aisleW = RIGHT_SEAT_X - aisleX - 4

  return (
    <svg
      viewBox={`0 0 ${SVG_W_V} ${SVG_H_V}`}
      width={SVG_W_V}
      height={SVG_H_V}
      className="drop-shadow-2xl max-w-full h-auto"
      aria-hidden
    >
      <defs>
        <clipPath id="bus-int-clip-v">
          <rect x={MARGIN} y={MARGIN} width={SVG_W_V - MARGIN * 2} height={SVG_H_V - MARGIN * 2} rx="14" />
        </clipPath>
      </defs>

      <rect
        x="1" y="1" width={SVG_W_V - 2} height={SVG_H_V - 2} rx="18"
        fill={DARK} fillOpacity={shellOpacity} stroke={SHELL} strokeWidth="2.5"
      />

      <g clipPath="url(#bus-int-clip-v)">
        {Array.from({ length: stripeCount }).map((_, i) => (
          <rect
            key={i}
            x={MARGIN}
            y={MARGIN + i * 32}
            width={SVG_W_V - MARGIN * 2}
            height={32}
            fill={i % 2 === 0 ? GA : GB}
            fillOpacity={floorOpacity}
          />
        ))}
      </g>

      <rect
        x={aisleX}
        y={MARGIN}
        width={aisleW}
        height={SVG_H_V - MARGIN * 2}
        fill="#152e18"
        opacity={aisleOpacity}
        clipPath="url(#bus-int-clip-v)"
      />

      {Array.from({ length: NUM_ROWS }).map((_, row) => {
        const cy = ROW_START_Y + row * ROW_PITCH
        const sy = cy - SEAT_SIZE / 2
        return (
          <g key={row}>
            <rect x={MARGIN} y={sy} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
            <rect x={LEFT_SEAT2_X} y={sy} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
            <rect x={RIGHT_SEAT_X} y={sy} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2" />
          </g>
        )
      })}

      <rect x={MARGIN} y={PARTITION_Y} width={SVG_W_V - MARGIN * 2} height="2.5" fill="#0f2612" />

      <circle cx={WHEEL_CX_V} cy={WHEEL_CY_V} r={WHEEL_R} fill="none" stroke={WHEEL} strokeWidth="2.5" />
      <circle cx={WHEEL_CX_V} cy={WHEEL_CY_V} r="4" fill={WHEEL} />
      <line x1={WHEEL_CX_V} y1={WHEEL_CY_V - WHEEL_R} x2={WHEEL_CX_V} y2={WHEEL_CY_V - 6} stroke={WHEEL} strokeWidth="2" />
      <line x1={WHEEL_CX_V - WHEEL_R} y1={WHEEL_CY_V} x2={WHEEL_CX_V - 6} y2={WHEEL_CY_V} stroke={WHEEL} strokeWidth="2" />
      <line x1={WHEEL_CX_V + 6} y1={WHEEL_CY_V} x2={WHEEL_CX_V + WHEEL_R} y2={WHEEL_CY_V} stroke={WHEEL} strokeWidth="2" />

      <rect
        x={DRIVER_SEAT_X_V} y={DRIVER_SEAT_Y_V}
        width={DRIVER_SEAT_W_V} height={DRIVER_SEAT_H_V} rx="3"
        fill={SEAT_F} stroke={SEAT_BORDER} strokeWidth="1.2"
      />

      <rect x={MARGIN + 8} y={MARGIN + 4} width={SVG_W_V - MARGIN * 2 - 16} height="9" rx="3"
        fill="#0d2a55" opacity="0.6" clipPath="url(#bus-int-clip-v)" />
      <rect x={MARGIN + 8} y={SVG_H_V - MARGIN - REAR_PADDING - REAR_WINDOW} width={SVG_W_V - MARGIN * 2 - 16} height={REAR_WINDOW} rx="4"
        fill="#0d2a55" opacity="0.65" clipPath="url(#bus-int-clip-v)" />
    </svg>
  )
}

// ─── Price pop (snackbar) ─────────────────────────────────────

function PricePop({
  x,
  y,
  boleto2022,
  boleto2026,
  unit,
  nameBelow,
}: {
  x: number
  y: number
  boleto2022: number
  boleto2026: number
  unit?: string
  nameBelow: boolean
}) {
  const offset = CIRCLE_D / 2 + NAME_BLOCK_H + PRICE_GAP
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-row items-center gap-1"
        style={
          nameBelow
            ? { top: offset }
            : { bottom: offset }
        }
      >
        <span className="inline-block rounded-md border border-primary/50 bg-primary/25 px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-md tabular-nums whitespace-nowrap">
          {formatCurrency(boleto2022, unit)}
        </span>
        <span className="inline-block rounded-md border border-accent/50 bg-accent/25 px-1.5 py-0.5 text-[10px] font-semibold text-accent shadow-md tabular-nums whitespace-nowrap">
          {formatCurrency(boleto2026, unit)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Obelisco Card ────────────────────────────────────────────

function ObeliscoCard({
  viajes2022,
  viajes2026,
  boleto2022,
  boleto2026,
}: {
  viajes2022: number
  viajes2026: number
  boleto2022: number
  boleto2026: number
}) {
  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { maximumFractionDigits: 2 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-card border border-border rounded-2xl px-6 py-5 shadow-xl max-w-sm w-full"
    >
      <p className="text-[11px] text-muted-foreground text-center mb-4 uppercase tracking-wide font-medium">
        Viajes al Obelisco por día con el sueldo mínimo
      </p>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-4xl font-light text-primary tabular-nums">{viajes2022}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">en 2022</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            boleto ${fmt(boleto2022)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-light text-accent tabular-nums">{viajes2026}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">en 2026</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            boleto ${fmt(boleto2026)}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center italic">
        * El micro del campeón no pagó boleto
      </p>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────

export function MicroSection() {
  const { getIndicador, loading } = useData()
  const prefersReducedMotion = useReducedMotion()
  const isNarrow = useIsNarrow()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [boarded, setBoarded] = useState(0)
  const [snackIndex, setSnackIndex] = useState<number | null>(null)
  const prevBoarded = useRef(0)

  const svgW = isNarrow ? SVG_W_V : SVG_W
  const svgH = isNarrow ? SVG_H_V : SVG_H
  const busTopPad = isNarrow ? BUS_TOP_PAD_MOBILE : BUS_TOP_PAD
  const busScale = useMobileBusScale(svgH + busTopPad, isNarrow)
  const getSeatPos = isNarrow ? getSeatPosV : getSeatPosH
  const entranceCx = isNarrow ? ENTRANCE_CX_V : ENTRANCE_CX
  const entranceCy = isNarrow ? ENTRANCE_CY_V : ENTRANCE_CY
  const scrollMinHeight = isNarrow ? SCROLL_MIN_HEIGHT_MOBILE : SCROLL_MIN_HEIGHT_DESKTOP
  const busOuterH = (svgH + busTopPad) * busScale
  const busOuterW = svgW * busScale

  const micro   = getIndicador("BOLETO_AMBA")
  const salario = getIndicador("SUELDO_MIN_PESOS")

  const boleto2022 = micro?.valor_2022   ?? 25.2
  const boleto2026 = micro?.valor_2026   ?? 681
  const sueldo2022 = salario?.valor_2022 ?? 61953
  const sueldo2026 = salario?.valor_2026 ?? 346800

  const viajes2022 = Math.floor(sueldo2022 / 30 / boleto2022)
  const viajes2026 = Math.floor(sueldo2026 / 30 / boleto2026)

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return
    const boardingV = Math.min(1, v / BOARDING_SCROLL_END)
    const next = Math.min(26, Math.floor(boardingV * 27.5))
    if (next > prevBoarded.current) {
      setSnackIndex(next - 1)
    } else if (next < prevBoarded.current) {
      setSnackIndex(null)
    }
    prevBoarded.current = next
    setBoarded(next)
  })

  useEffect(() => {
    if (snackIndex === null) return
    const t = setTimeout(() => setSnackIndex(null), 2200)
    return () => clearTimeout(t)
  }, [snackIndex])

  const allBoarded = boarded >= 26

  if (loading) {
    return (
      <SectionWrapper progressSection="micro" number={copy.number} title={copy.title} intro={LOADING_INTRO}>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  if (prefersReducedMotion) {
    return (
      <SectionWrapper progressSection="micro"
        number={copy.number}
        title={copy.title}
        intro={copy.intro}
        closing={copy.closing}
        sources={[micro, salario]}
      >
        <p className="text-sm text-muted-foreground text-center py-8 border border-border/40 rounded-xl bg-muted/30">
          26 jugadores, un solo colectivo.
        </p>
      </SectionWrapper>
    )
  }

  const snackPos =
    snackIndex !== null ? getSeatPos(snackIndex) : null

  return (
    <SectionWrapper progressSection="micro"
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[micro, salario]}
    >
      <motion.div
        ref={scrollRef}
        className="relative max-lg:overflow-x-clip"
        style={{ minHeight: scrollMinHeight }}
      >
        <motion.div className="sticky top-0 z-0 h-screen flex flex-col items-center justify-center gap-5 max-lg:gap-1 py-4 max-lg:py-1 px-2 relative max-lg:overflow-x-clip">

          <AnimatePresence>
            {allBoarded && (
              <motion.div
                key="obelisco-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 bottom-0 left-1/2 z-0 w-screen -translate-x-1/2 pointer-events-none"
                aria-hidden
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE_PATH}/obelisco.webp`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-background/35 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            className="relative z-10 shrink-0 text-xs text-muted-foreground font-medium tracking-wide text-center max-lg:my-0 max-lg:leading-snug"
            animate={{ opacity: boarded === 0 ? 0.5 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {boarded === 0
              ? "Scrolleá para subir al micro 🚌"
              : boarded < 26
              ? `${boarded} de 26 jugadores en el micro`
              : "¡Los 26 campeones están en el micro! 🏆"}
          </motion.p>

          <motion.div
            className={`relative z-10 flex-shrink-0 w-full rounded-xl mx-auto ${
              isNarrow ? "max-w-[min(250px,100%)] max-h-[90vh]" : "max-w-[820px] overflow-visible"
            }`}
            style={{ width: busOuterW, height: busOuterH }}
          >
            <div
              className="relative mx-auto"
              style={{
                width: svgW,
                height: svgH + busTopPad,
                transform: isNarrow ? `scale(${busScale})` : undefined,
                transformOrigin: "top center",
              }}
            >
            <div className="relative" style={{ height: svgH + busTopPad }}>
              <div
                className="absolute left-0 right-0 mx-auto"
                style={{ top: busTopPad, width: svgW, height: svgH }}
              >
            {isNarrow ? (
              <BusVerticalView showObelisco={allBoarded} />
            ) : (
              <BusTopView showObelisco={allBoarded} />
            )}

            {PLAYERS.map((player, i) => {
              const isBoarded = i < boarded
              const { x: sx, y: sy, col } = getSeatPos(i)
              const [nombreLinea1, nombreLinea2] = splitNombreEnDosLineas(player.nombre)
              const linea1 = nombreLinea2 ? nombreLinea1 : player.label
              const linea2 = nombreLinea2 || player.nombre
              const nameBelow = nameBelowSeat(col, isNarrow)

              return (
                <motion.div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: CIRCLE_D,
                    height: CIRCLE_D,
                  }}
                  initial={{
                    x: entranceCx - CIRCLE_D / 2,
                    y: entranceCy - CIRCLE_D / 2,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={
                    isBoarded
                      ? { x: sx - CIRCLE_D / 2, y: sy - CIRCLE_D / 2, opacity: 1, scale: 1 }
                      : { x: entranceCx - CIRCLE_D / 2, y: entranceCy - CIRCLE_D / 2, opacity: 0, scale: 0.4 }
                  }
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <div
                    className={`absolute left-1/2 z-30 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none leading-tight max-w-[4.25rem] ${
                      nameBelow ? "top-full mt-0.5" : "bottom-full mb-0.5"
                    } ${isNarrow ? "rounded px-1 py-0.5 bg-black/35" : ""}`}
                    style={
                      isNarrow
                        ? { textShadow: "0 0 2px #000, 0 1px 3px #000" }
                        : { textShadow: "0 1px 4px rgba(0,0,0,0.95)" }
                    }
                  >
                    <span
                      className={`font-bold text-white ${isNarrow ? "text-[13px]" : "text-[10px]"}`}
                    >
                      {linea1}
                    </span>
                    <span
                      className={`font-semibold text-white/90 ${isNarrow ? "text-[12px]" : "text-[9px]"}`}
                    >
                      {linea2}
                    </span>
                  </div>

                  <div
                    className="bg-primary border-2 border-white"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
                    }}
                  />
                </motion.div>
              )
            })}

            <AnimatePresence>
              {snackIndex !== null && !allBoarded && snackPos && (
                <PricePop
                  key={snackIndex}
                  x={snackPos.x}
                  y={snackPos.y}
                  boleto2022={boleto2022}
                  boleto2026={boleto2026}
                  unit={micro?.unidad}
                  nameBelow={nameBelowSeat(snackPos.col, isNarrow)}
                />
              )}
            </AnimatePresence>
              </div>
            </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {allBoarded && (
              <motion.div className="relative z-10">
              <ObeliscoCard
                key="obelisco"
                viajes2022={viajes2022}
                viajes2026={viajes2026}
                boleto2022={boleto2022}
                boleto2026={boleto2026}
              />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      {isNarrow && <div className="h-36 shrink-0" aria-hidden />}
    </SectionWrapper>
  )
}
