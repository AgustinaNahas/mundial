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
// Horizontal top-view: front = left, back = right

const MARGIN = 20
const SVG_W = 820
const SVG_H = 250
const NUM_ROWS = 9
const ROW_W = 76
const SEAT_SIZE = 30
const SEAT_GAP = 6
const CIRCLE_D = 22

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

// Zona conductor + una fila de aire antes de pasajeros
const PARTITION_X = DRIVER_SEAT_X + DRIVER_SEAT_W + ROW_W
const ROW_START_X = PARTITION_X + 12

const ENTRANCE_CX = PARTITION_X - ROW_W / 2
const ENTRANCE_CY = (TOP_Y2 + BOTTOM_Y) / 2

function getSeatPos(index: number): { x: number; y: number; col: number } {
  const row = Math.floor(index / 3)
  const col = index % 3
  const x = ROW_START_X + row * ROW_W
  const y = col === 0 ? TOP_Y1 : col === 1 ? TOP_Y2 : BOTTOM_Y
  return { x, y, col }
}

/** Fracción de scroll hasta completar los 26; el resto es margen con el Obelisco. */
const BOARDING_SCROLL_END = 0.8
const SCROLL_MIN_HEIGHT = "500vh"

// ─── Bus SVG ──────────────────────────────────────────────────
// Top-down, horizontal: left = front, right = back — layout 2+1

function BusTopView({ showObelisco }: { showObelisco?: boolean }) {
  const GA = "#2d6f35"
  const GB = "#1e5228"
  const SEAT_F = "#132c17"
  const SEAT_S = "#2d6030"
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
              fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />
            <rect x={sx} y={TOP_SEAT2_Y} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />
            <rect x={sx} y={BOTTOM_SEAT_Y} width={SEAT_SIZE} height={SEAT_SIZE} rx="3"
              fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />
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
        fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8"
      />

      {/* Front windshield (left) */}
      <rect x={MARGIN + 4} y={MARGIN + 8} width="9" height={SVG_H - MARGIN * 2 - 16} rx="3"
        fill="#0d2a55" opacity="0.6" clipPath="url(#bus-int-clip)" />
      {/* Rear window */}
      <rect x={SVG_W - MARGIN - 12} y={MARGIN + 8} width="11" height={SVG_H - MARGIN * 2 - 16} rx="4"
        fill="#0d2a55" opacity="0.65" clipPath="url(#bus-int-clip)" />
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
}: {
  x: number
  y: number
  boleto2022: number
  boleto2026: number
  unit?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute z-20 pointer-events-none"
      style={{ left: x, top: y }}
    >
      <span className="absolute right-full top-1/2 -translate-y-1/2 mr-1.5 inline-block rounded-md border border-primary/50 bg-primary/25 px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-md tabular-nums whitespace-nowrap">
        {formatCurrency(boleto2022, unit)}
      </span>
      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 inline-block rounded-md border border-accent/50 bg-accent/25 px-1.5 py-0.5 text-[10px] font-semibold text-accent shadow-md tabular-nums whitespace-nowrap">
        {formatCurrency(boleto2026, unit)}
      </span>
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [boarded, setBoarded] = useState(0)
  const [snackIndex, setSnackIndex] = useState<number | null>(null)
  const prevBoarded = useRef(0)

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
      <SectionWrapper number={copy.number} title={copy.title} intro={LOADING_INTRO}>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  if (prefersReducedMotion) {
    return (
      <SectionWrapper
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
    <SectionWrapper
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[micro, salario]}
    >
      <motion.div ref={scrollRef} className="relative" style={{ minHeight: SCROLL_MIN_HEIGHT }}>
        <motion.div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-5 py-4 px-2 relative overflow-visible">

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
            className="relative z-10 text-xs text-muted-foreground font-medium tracking-wide text-center"
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
            className="relative z-10 flex-shrink-0 w-full max-w-[820px] overflow-visible rounded-xl pt-10"
            style={{ width: SVG_W, height: SVG_H + 40 }}
          >
            <div className="relative" style={{ height: SVG_H }}>
            <BusTopView showObelisco={allBoarded} />

            {PLAYERS.map((player, i) => {
              const isBoarded = i < boarded
              const { x: sx, y: sy, col } = getSeatPos(i)
              const [nombreLinea1, nombreLinea2] = splitNombreEnDosLineas(player.nombre)
              const linea1 = nombreLinea2 ? nombreLinea1 : player.label
              const linea2 = nombreLinea2 || player.nombre
              const nameBelow = col === 1

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
                    x: ENTRANCE_CX - CIRCLE_D / 2,
                    y: ENTRANCE_CY - CIRCLE_D / 2,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={
                    isBoarded
                      ? { x: sx - CIRCLE_D / 2, y: sy - CIRCLE_D / 2, opacity: 1, scale: 1 }
                      : { x: ENTRANCE_CX - CIRCLE_D / 2, y: ENTRANCE_CY - CIRCLE_D / 2, opacity: 0, scale: 0.4 }
                  }
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <div
                    className={`absolute left-1/2 z-30 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none leading-tight max-w-[4.25rem] ${
                      nameBelow ? "top-full mt-0.5" : "bottom-full mb-0.5"
                    }`}
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
                  >
                    <span className="text-[10px] font-bold text-white">{linea1}</span>
                    <span className="text-[9px] font-semibold text-white/90">{linea2}</span>
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
                />
              )}
            </AnimatePresence>
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
    </SectionWrapper>
  )
}
