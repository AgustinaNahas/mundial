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
import { useData } from "@/lib/data-context"

// ─── Player & Snack data ──────────────────────────────────────

interface PlayerData {
  label: string
  nombre: string
  snack: string
  emoji: string
  qatarUSD: number
  usaUSD: number
}

const PLAYERS: PlayerData[] = [
  { label: "Dibu",         nombre: "Emiliano Martínez",  snack: "Hot dog",       emoji: "🌭", qatarUSD: 12, usaUSD: 8  },
  { label: "Armani",       nombre: "Franco Armani",       snack: "Pizza",         emoji: "🍕", qatarUSD: 15, usaUSD: 10 },
  { label: "Rulli",        nombre: "Gerónimo Rulli",      snack: "Shawarma",      emoji: "🥙", qatarUSD: 16, usaUSD: 11 },
  { label: "Molina",       nombre: "Nahuel Molina",       snack: "Hamburguesa",   emoji: "🍔", qatarUSD: 18, usaUSD: 13 },
  { label: "Montiel",      nombre: "Gonzalo Montiel",     snack: "Tacos",         emoji: "🌮", qatarUSD: 14, usaUSD: 9  },
  { label: "Cuti",         nombre: "Cristian Romero",     snack: "Papas fritas",  emoji: "🍟", qatarUSD: 10, usaUSD: 7  },
  { label: "Pezzella",     nombre: "Germán Pezzella",     snack: "Wrap",          emoji: "🌯", qatarUSD: 13, usaUSD: 9  },
  { label: "Otamendi",     nombre: "Nicolás Otamendi",    snack: "Pollo",         emoji: "🍗", qatarUSD: 16, usaUSD: 14 },
  { label: "Acuña",        nombre: "Marcos Acuña",        snack: "Sándwich",      emoji: "🥪", qatarUSD: 14, usaUSD: 8  },
  { label: "Tagliafico",   nombre: "Nicolás Tagliafico",  snack: "Falafel",       emoji: "🧆", qatarUSD: 10, usaUSD: 7  },
  { label: "Foyth",        nombre: "Juan Foyth",          snack: "Ensalada",      emoji: "🥗", qatarUSD: 11, usaUSD: 9  },
  { label: "De Paul",      nombre: "Rodrigo De Paul",     snack: "Helado",        emoji: "🍦", qatarUSD: 9,  usaUSD: 7  },
  { label: "Paredes",      nombre: "Leandro Paredes",     snack: "Gaseosa",       emoji: "🥤", qatarUSD: 6,  usaUSD: 5  },
  { label: "Mac Allister", nombre: "Alexis Mac Allister", snack: "Pochoclo",      emoji: "🍿", qatarUSD: 8,  usaUSD: 9  },
  { label: "Enzo",         nombre: "Enzo Fernández",      snack: "Donut",         emoji: "🍩", qatarUSD: 7,  usaUSD: 5  },
  { label: "Guido",        nombre: "Guido Rodríguez",     snack: "Burrito",       emoji: "🌯", qatarUSD: 15, usaUSD: 10 },
  { label: "Palacios",     nombre: "Exequiel Palacios",   snack: "Pretzel",       emoji: "🥨", qatarUSD: 8,  usaUSD: 6  },
  { label: "Almada",       nombre: "Thiago Almada",       snack: "Choclo",        emoji: "🌽", qatarUSD: 7,  usaUSD: 5  },
  { label: "Messi",        nombre: "Lionel Messi",        snack: "Empanada",      emoji: "🥟", qatarUSD: 20, usaUSD: 14 },
  { label: "Di María",     nombre: "Ángel Di María",      snack: "Pizza rellena", emoji: "🍕", qatarUSD: 17, usaUSD: 11 },
  { label: "Lautaro",      nombre: "Lautaro Martínez",    snack: "Choripán",      emoji: "🌭", qatarUSD: 18, usaUSD: 15 },
  { label: "J. Álvarez",   nombre: "Julián Álvarez",      snack: "Doble burger",  emoji: "🍔", qatarUSD: 22, usaUSD: 16 },
  { label: "Dybala",       nombre: "Paulo Dybala",        snack: "Pasta",         emoji: "🍝", qatarUSD: 19, usaUSD: 13 },
  { label: "Correa",       nombre: "Joaquín Correa",      snack: "Hot dog doble", emoji: "🌭", qatarUSD: 14, usaUSD: 9  },
  { label: "N. González",  nombre: "Nicolás González",    snack: "Maní tostado",  emoji: "🥜", qatarUSD: 5,  usaUSD: 4  },
  { label: "Papu",         nombre: "Alejandro Gómez",     snack: "Hummus + pita", emoji: "🫓", qatarUSD: 12, usaUSD: 8  },
]

// ─── Bus layout constants ─────────────────────────────────────

const SVG_W = 190
const SVG_H = 440
const NUM_ROWS = 9
const ROW_START_Y = 32   // y-center of topmost row (back of bus)
const ROW_H = 36
// x-centers of 3 seat columns: left-window, left-aisle, right-window
const SEAT_X = [22, 52, 138]
const CIRCLE_D = 18

// Where players appear before being "seated" (inside SVG at door position)
const DOOR_CX = 161
const DOOR_CY = 381

function getSeatPos(index: number): { x: number; y: number } {
  const row = Math.floor(index / 3)
  const col = index % 3
  return { x: SEAT_X[col], y: ROW_START_Y + row * ROW_H }
}

// ─── Bus SVG ──────────────────────────────────────────────────
// Top-down view: top = back of bus, bottom = front (door, driver)
// Layout 2+1: two seats left, one seat right

function BusTopView() {
  // Cancha-inspired two-tone green palette
  const GA = "#2d6f35"      // lighter green stripe
  const GB = "#1e5228"      // darker green stripe
  const SEAT_F = "#132c17"  // seat fill
  const SEAT_S = "#2d6030"  // seat stroke
  const DARK = "#0c1f0e"    // body dark fill
  const SHELL = "#1a4920"   // outer stroke

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      className="drop-shadow-2xl"
      aria-hidden
    >
      <defs>
        <clipPath id="bus-int-clip">
          <rect x="5" y="5" width={SVG_W - 10} height={SVG_H - 10} rx="14" />
        </clipPath>
      </defs>

      {/* Outer shell */}
      <rect
        x="1" y="1" width={SVG_W - 2} height={SVG_H - 2} rx="18"
        fill={DARK} stroke={SHELL} strokeWidth="2.5"
      />

      {/* Cancha-stripe interior floor */}
      <g clipPath="url(#bus-int-clip)">
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i} x="5" y={5 + i * 32} width={SVG_W - 10} height={32}
            fill={i % 2 === 0 ? GA : GB}
          />
        ))}
      </g>

      {/* Aisle strip (slightly darker) */}
      <rect
        x="70" y="5" width="50" height="353"
        fill="#152e18" opacity="0.55"
        clipPath="url(#bus-int-clip)"
      />

      {/* 9 seat rows — 2-bench left (x 7..67) + 1-seat right (x 123..153) */}
      {Array.from({ length: NUM_ROWS }).map((_, row) => {
        const cy = ROW_START_Y + row * ROW_H
        const sh = 20
        const sy = cy - sh / 2
        return (
          <g key={row}>
            <rect x="7"   y={sy} width="60" height={sh} rx="4" fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />
            <line x1="37" y1={sy + 2} x2="37" y2={sy + sh - 2} stroke={SEAT_S} strokeWidth="0.8" />
            <rect x="123" y={sy} width="30" height={sh} rx="4" fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />
          </g>
        )
      })}

      {/* Partition: passenger / driver */}
      <rect x="5" y="358" width={SVG_W - 10} height="2.5" fill="#0f2612" />

      {/* Door: bottom-right of passenger area */}
      <rect x="137" y="360" width="47" height="46" rx="4"
        fill={DARK} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,3" />
      <rect x="141" y="364" width="39" height="37" rx="2"
        fill="#0a1a0c" stroke="#60a5fa" strokeWidth="0.8" />
      <circle cx="157" cy="384" r="2.5" fill="#60a5fa" />
      <text
        x="161" y="398" textAnchor="middle" fontSize="7"
        fill="#93c5fd" fontFamily="system-ui,sans-serif" fontWeight="700"
      >PUERTA</text>

      {/* Steering wheel */}
      <circle cx="75" cy="415" r="16" fill="none" stroke="#2a5030" strokeWidth="2.5" />
      <circle cx="75" cy="415" r="4"  fill="#2a5030" />
      <line x1="75" y1="399" x2="75" y2="411" stroke="#2a5030" strokeWidth="2" />
      <line x1="59" y1="415" x2="71" y2="415" stroke="#2a5030" strokeWidth="2" />
      <line x1="79" y1="415" x2="91" y2="415" stroke="#2a5030" strokeWidth="2" />

      {/* Driver seat */}
      <rect x="20" y="399" width="28" height="22" rx="4" fill={SEAT_F} stroke={SEAT_S} strokeWidth="0.8" />

      {/* Rear window (top = back of bus) */}
      <rect x="14" y="8"  width={SVG_W - 28} height="9"  rx="3" fill="#0d2a55" opacity="0.6" clipPath="url(#bus-int-clip)" />
      {/* Front windshield (bottom = front) */}
      <rect x="14" y={SVG_H - 20} width={SVG_W - 28} height="11" rx="4" fill="#0d2a55" opacity="0.65" clipPath="url(#bus-int-clip)" />
    </svg>
  )
}

// ─── Snack Bubble ─────────────────────────────────────────────

function SnackBubble({ player }: { player: PlayerData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.92 }}
      transition={{ duration: 0.25 }}
      className="bg-card border border-border rounded-xl p-4 shadow-xl w-52"
    >
      <p className="text-[10px] text-muted-foreground mb-1">{player.nombre} pidió…</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl leading-none">{player.emoji}</span>
        <p className="text-sm font-semibold text-foreground leading-tight">{player.snack}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">🇶🇦 Qatar 2022</p>
          <p className="text-sm font-bold tabular-nums">USD&nbsp;${player.qatarUSD}</p>
        </div>
        <div className="bg-muted rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-foreground mb-0.5">🇺🇸 EEUU 2026</p>
          <p className="text-sm font-bold tabular-nums">USD&nbsp;${player.usaUSD}</p>
        </div>
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

  // Daily min-wage ÷ bus fare = trips/day
  const viajes2022 = Math.floor(sueldo2022 / 30 / boleto2022)
  const viajes2026 = Math.floor(sueldo2026 / 30 / boleto2026)

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return
    // Map 0-1 scroll progress to 0-26 players boarded
    // Players fill seats from 3% scroll to ~95%, leaving room at end for obelisco
    const next = Math.min(26, Math.floor(v * 27.5))
    if (next > prevBoarded.current) {
      setSnackIndex(next - 1)
    } else if (next < prevBoarded.current) {
      setSnackIndex(null)
    }
    prevBoarded.current = next
    setBoarded(next)
  })

  // Auto-clear snack bubble after 2.5 s
  useEffect(() => {
    if (snackIndex === null) return
    const t = setTimeout(() => setSnackIndex(null), 2500)
    return () => clearTimeout(t)
  }, [snackIndex])

  const allBoarded = boarded >= 26

  if (loading) {
    return (
      <SectionWrapper number="11" title="El micro del festejo" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  if (prefersReducedMotion) {
    return (
      <SectionWrapper
        number="11"
        title="El micro del festejo"
        intro="Si los campeones del mundo hubieran viajado en colectivo…"
        sources={[micro, salario]}
      >
        <p className="text-sm text-muted-foreground text-center py-8 border border-border/40 rounded-xl bg-muted/30">
          26 jugadores, 26 snacks, un solo colectivo.
        </p>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number="11"
      title="El micro del festejo"
      intro="Si los campeones del mundo hubieran viajado en colectivo… ¿qué snack hubieran pedido?"
      sources={[micro, salario]}
    >
      {/* Tall scroll container — drives the boarding animation */}
      <div ref={scrollRef} className="relative" style={{ minHeight: "380vh" }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-5 py-4">

          {/* Progress counter */}
          <motion.p
            className="text-xs text-muted-foreground font-medium tracking-wide text-center"
            animate={{ opacity: boarded === 0 ? 0.5 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {boarded === 0
              ? "Scrolleá para subir al micro 🚌"
              : boarded < 26
              ? `${boarded} de 26 jugadores en el micro`
              : "¡Los 26 campeones están en el micro! 🏆"}
          </motion.p>

          {/* Bus + snack bubble */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">

            {/* Bus top-view with player circles on top */}
            <div
              className="relative flex-shrink-0"
              style={{ width: SVG_W, height: SVG_H }}
            >
              <BusTopView />

              {PLAYERS.map((player, i) => {
                const isBoarded = i < boarded
                const { x: sx, y: sy } = getSeatPos(i)

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
                      x: DOOR_CX - CIRCLE_D / 2,
                      y: DOOR_CY - CIRCLE_D / 2,
                      opacity: 0,
                      scale: 0.4,
                    }}
                    animate={
                      isBoarded
                        ? { x: sx - CIRCLE_D / 2, y: sy - CIRCLE_D / 2, opacity: 1, scale: 1 }
                        : { x: DOOR_CX - CIRCLE_D / 2, y: DOOR_CY - CIRCLE_D / 2, opacity: 0, scale: 0.4 }
                    }
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  >
                    {/* Name label */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "5.5px",
                        color: "white",
                        whiteSpace: "nowrap",
                        textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                        fontWeight: 700,
                        marginBottom: "1px",
                        lineHeight: 1,
                        pointerEvents: "none",
                      }}
                    >
                      {player.label}
                    </div>

                    {/* Celeste circle */}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "#75AADB",
                        border: "2px solid white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
                      }}
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* Snack bubble slot */}
            <div className="w-52 flex items-center justify-center" style={{ minHeight: 128 }}>
              <AnimatePresence mode="wait">
                {snackIndex !== null && !allBoarded && (
                  <SnackBubble key={snackIndex} player={PLAYERS[snackIndex]} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Obelisco stat — appears when all 26 are seated */}
          <AnimatePresence>
            {allBoarded && (
              <ObeliscoCard
                key="obelisco"
                viajes2022={viajes2022}
                viajes2026={viajes2026}
                boleto2022={boleto2022}
                boleto2026={boleto2026}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  )
}
