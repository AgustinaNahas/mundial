"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { InfoTooltip } from "@/components/info-tooltip"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { LOADING_INTRO, SECTIONS } from "@/lib/site-copy"

const copy = SECTIONS.jubilacion
const BASE_PATH = "/mundial"
const KILOS_POR_ASADO = 5
/** Desktop: +60% respecto a 220×134px. */
const ABUELA_IMAGE_WIDTH = 300
const ABUELA_IMAGE_HEIGHT = 500

const ABUELA_IMAGE_WRAPPER_CLASS =
  "relative shrink-0 w-fit overflow-visible h-30 -mb-4 -mt-12 md:absolute md:-top-12 md:right-0 md:mb-0 md:mt-0 md:h-[352px] md:w-[214px]"
const ABUELA_IMAGE_CLASS =
  "relative z-10 block h-full w-full object-contain -scale-x-100"

/** Punto único detrás de la señora (centro de la imagen). */
const ABUELA_BUBBLE_ORIGIN = { left: "50%", top: "52%" } as const

const BUBBLE_EMERGE_DURATION_MS = 500
/** Espera entre burbuja y burbuja (orden del array: abuela → la × 5). */
const BUBBLE_STAGGER_MS = BUBBLE_EMERGE_DURATION_MS - 150

type BubbleRest = { left: string; top: string }

/** Posición de reposo de cada burbuja (mobile / desktop). */
const ABUELA_BUBBLE_WORDS: ReadonlyArray<{
  text: string
  mobile: BubbleRest
  desktop: BubbleRest
}> = [
  { text: "abuela", mobile: { left: "24%", top: "-94px" }, desktop: { left: "24%", top: "-64px" } },
  { text: "la", mobile: { left: "8%", top: "-80px" }, desktop: { left: "8%", top: "-42px" } },
  { text: "la", mobile: { left: "30%", top: "-65px" }, desktop: { left: "30%", top: "-18px" } },
  { text: "la", mobile: { left: "48%", top: "-90px" }, desktop: { left: "48%", top: "-29px" } },
  { text: "la", mobile: { left: "64%", top: "-80px" }, desktop: { left: "64%", top: "-42px" } },
  { text: "la", mobile: { left: "78%", top: "-80px" }, desktop: { left: "78%", top: "-10px" } },
]

const BUBBLE_PILL_CLASS =
  "inline-block whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium leading-tight text-primary md:text-sm"

type BubbleLayout = (typeof ABUELA_BUBBLE_WORDS)[number]

function AbuelaBubble({
  bubble,
  index,
  inView,
}: {
  bubble: BubbleLayout
  index: number
  inView: boolean
}) {
  const isMobile = useIsMobile()
  const rest = isMobile ? bubble.mobile : bubble.desktop
  const [phase, setPhase] = useState<"idle" | "emerge" | "float">("idle")

  const startMs = index * BUBBLE_STAGGER_MS

  useEffect(() => {
    if (!inView) return
    const emergeT = window.setTimeout(() => setPhase("emerge"), startMs)
    const floatT = window.setTimeout(
      () => setPhase("float"),
      startMs + BUBBLE_EMERGE_DURATION_MS,
    )
    return () => {
      window.clearTimeout(emergeT)
      window.clearTimeout(floatT)
    }
  }, [inView, startMs])

  return (
    <motion.span
      className={`absolute ${BUBBLE_PILL_CLASS}`}
      variants={{
        idle: {
          left: ABUELA_BUBBLE_ORIGIN.left,
          top: ABUELA_BUBBLE_ORIGIN.top,
          // x: "-50%",
          y: 0,
          opacity: 0,
          scale: 0.35,
        },
        emerge: {
          left: rest.left,
          top: rest.top,
          x: 0,
          y: 0,
          opacity: [0, 0.6, 1],
          scale: 1,
          transition: {
            left: { duration: BUBBLE_EMERGE_DURATION_MS / 1000, ease: [0.33, 1, 0.38, 1] },
            top: { duration: BUBBLE_EMERGE_DURATION_MS / 1000, ease: [0.33, 1, 0.38, 1] },
            x: { duration: BUBBLE_EMERGE_DURATION_MS / 1000, ease: [0.33, 1, 0.38, 1] },
            y: { duration: BUBBLE_EMERGE_DURATION_MS / 1000, ease: [0.33, 1, 0.38, 1] },
            opacity: { duration: 0.75, times: [0, 0.4, 1], ease: "easeOut" },
            scale: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
          },
        },
        float: {
          left: rest.left,
          top: rest.top,
          x: [0, index % 2 === 0 ? 2 : -2, 0],
          y: [0, -4, 2, 0],
          opacity: 1,
          scale: 1,
          transition: {
            left: { duration: 0 },
            top: { duration: 0 },
            y: {
              duration: 2.6 + index * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: {
              duration: 2.6 + index * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        },
      }}
      initial="idle"
      animate={phase}
    >
      {bubble.text}
    </motion.span>
  )
}

function AbuelaFloatingWords() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, amount: 0.15, margin: "0px 0px -80px 0px" })

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 top-20 overflow-visible"
      aria-hidden
    >
      {ABUELA_BUBBLE_WORDS.map((bubble, i) => (
        <AbuelaBubble key={`${bubble.text}-${i}`} bubble={bubble} index={i} inView={inView} />
      ))}
    </div>
  )
}

const PICTO_HALO =
  "drop-shadow-[0_0_1px_#fff] drop-shadow-[0_0_2px_#fff]"

const PODER_ADQUISITIVO_TOOLTIP =
  "Promedio del cambio en cuántos álbumes, asados de parrilla (5 kg) y viajes en colectivo alcanza con la jubilación mínima entre 2022 y 2026."

function formatPctChange(pct: number) {
  const rounded = Math.round(pct)
  if (rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}

function MiniEmojiPicto({
  count2022,
  count2026,
  emoji,
}: {
  count2022: number
  count2026: number
  emoji: string
}) {

  let c2022 = count2022 > 1000 ? count2022/100 : ( count2022 > 100 ? count2022/100 : 
    (count2022 > 10 ? count2022/10 : count2022))
  let c2026 = count2022 > 1000 ? count2026/100 : ( count2022 > 100 ? count2026/100 : 
    (count2022 > 10 ? count2026/10 : count2026))

  const total = Math.min(Math.max(Math.round(c2022), 1), 20)
  const visible2026 = Math.min(Math.round(c2026), total)


  return (
    <div
      className="flex justify-center flex-wrap gap-2 mt-2"
      role="img"
      aria-label={`${c2022} en 2022, ${c2026} en 2026`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`text-base leading-none select-none transition-opacity md:text-lg ${PICTO_HALO} ${
            i >= visible2026 ? "opacity-25" : "opacity-100"
          }`}
        >
          {emoji}
        </span>
      ))}
    </div>
  )
}

function PurchaseCompare({
  label,
  count2022,
  count2026,
  emoji,
  format = (n: number) => String(n),
}: {
  label: string
  count2022: number
  count2026: number
  emoji: string
  format?: (n: number) => string
}) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-baseline justify-center gap-2 tabular-nums">
        <span className="text-xl font-light text-primary">{format(count2022)}</span>
        <span className="text-muted-foreground text-sm">→</span>
        <span className="text-xl font-light text-accent">{format(count2026)}</span>
      </div>
      <MiniEmojiPicto count2022={count2022} count2026={count2026} emoji={emoji} />
    </div>
  )
}

export function JubilacionSection() {
  const { getIndicador, loading } = useData()

  const jubilacion = getIndicador("JUBILACION_MIN_DOLARES")
  const asado = getIndicador("ASADO_FINAL")
  const album = getIndicador("PRECIO_ALBUM_FIGURITAS")
  const boleto = getIndicador("BOLETO_AMBA")

  const jubilacion_2022 = jubilacion?.valor_2022 ?? 50124
  const jubilacion_2026 = jubilacion?.valor_2026 ?? 359254
  const unit = jubilacion?.unidad ?? "ARS"

  const asado_2022 = asado?.valor_2022 ?? 1220
  const asado_2026 = asado?.valor_2026 ?? 16019

  const album_2022 = album?.valor_2022 ?? 750
  const album_2026 = album?.valor_2026 ?? 12000

  const boleto_2022 = boleto?.valor_2022 ?? 25.2
  const boleto_2026 = boleto?.valor_2026 ?? 681

  const costoAsado2022 = asado_2022 * KILOS_POR_ASADO
  const costoAsado2026 = asado_2026 * KILOS_POR_ASADO

  const albumes2022 = jubilacion_2022 / album_2022
  const albumes2026 = jubilacion_2026 / album_2026

  const asados2022 = Math.floor(jubilacion_2022 / costoAsado2022)
  const asados2026 = Math.floor(jubilacion_2026 / costoAsado2026)

  const viajes2022 = Math.floor(jubilacion_2022 / boleto_2022)
  const viajes2026 = Math.floor(jubilacion_2026 / boleto_2026)

  const poderAdquisitivoPct =
    ((albumes2026 / albumes2022 + asados2026 / asados2022 + viajes2026 / viajes2022) / 3 - 1) *
    100

  const titleImage = {
    src: `${BASE_PATH}/abuela.png`,
    alt: "Abuela festejando",
    width: ABUELA_IMAGE_WIDTH,
    height: ABUELA_IMAGE_HEIGHT,
    wrapperClassName: ABUELA_IMAGE_WRAPPER_CLASS,
    className: ABUELA_IMAGE_CLASS,
    decoration: <AbuelaFloatingWords />,
  }

  if (loading) {
    return (
      <SectionWrapper
        number={copy.number}
        title={copy.title}
        intro={LOADING_INTRO}
        bgColor="muted"
        titleImage={titleImage}
      >
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      bgColor="muted"
      sources={[jubilacion, asado, album, boleto]}
      titleImage={titleImage}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center">
          Jubilación mínima en pesos
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:items-center sm:gap-5">
          <div className="text-center sm:text-right">
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-light text-primary tabular-nums"
            >
              {formatCurrency(jubilacion_2022, unit)}
            </motion.p>
            <p className="text-[11px] text-muted-foreground mt-0.5">2022</p>
          </div>

          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className="flex items-center gap-1">
              <p
                className={`text-2xl md:text-3xl font-medium tabular-nums ${
                  poderAdquisitivoPct < 0 ? "text-destructive" : "text-accent"
                }`}
              >
                {formatPctChange(poderAdquisitivoPct)}
              </p>
              <InfoTooltip label="Cómo se calcula el cambio en poder adquisitivo">
                {PODER_ADQUISITIVO_TOOLTIP}
              </InfoTooltip>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              poder adquisitivo
            </p>
          </div>

          <div className="text-center sm:text-left">
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl font-light text-accent tabular-nums"
            >
              {formatCurrency(jubilacion_2026, unit)}
            </motion.p>
            <p className="text-[11px] text-muted-foreground mt-0.5">2026</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h4 className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wide">
          ¿Qué alcanza con el haber?
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PurchaseCompare
            label="Álbumes"
            count2022={albumes2022}
            count2026={albumes2026}
            emoji="📒"
            format={(n) => n.toFixed(1)}
          />
          <PurchaseCompare
            label="Asados"
            count2022={asados2022}
            count2026={asados2026}
            emoji="🥩"
          />
          <PurchaseCompare
            label="Viajes en colectivo"
            count2022={viajes2022}
            count2026={viajes2026}
            emoji="🚌"
            format={(n) => n.toLocaleString("es-AR")}
          />
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
