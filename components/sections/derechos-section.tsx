"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, Radar } from "lucide-react"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import {
  buildRadarData,
  DERECHOS_INDICATORS,
  fetchDerechosData,
  getDerechosIndicator,
  type DerechosIndicatorKey,
  type DerechosRawRow,
  type DerechosYear,
  type RadarDataPoint,
} from "@/lib/derechos-data"
import { SECTIONS } from "@/lib/site-copy"
import { cn } from "@/lib/utils"

const copy = SECTIONS.derechos

const countries = [
  { name: "Argentina", key: "argentina" as const, color: "var(--primary)" },
  { name: "Qatar", key: "qatar" as const, color: "var(--accent)" },
  { name: "EEUU", key: "eeuu" as const, color: "var(--secondary)" },
  { name: "Canadá", key: "canada" as const, color: "var(--chart-3)" },
  { name: "México", key: "mexico" as const, color: "var(--chart-5)" },
]

type CountryKey = (typeof countries)[number]["key"]
type ChartView = "radar" | "bars"

function ViewToggle({
  view,
  onChange,
}: {
  view: ChartView
  onChange: (view: ChartView) => void
}) {
  return (
    <div
      className="inline-flex shrink-0 rounded-full border border-border bg-muted/50 p-1"
      role="group"
      aria-label="Tipo de gráfico"
    >
      <button
        type="button"
        aria-pressed={view === "radar"}
        aria-label="Vista radar"
        onClick={() => onChange("radar")}
        className={cn(
          "cursor-pointer rounded-full p-2 transition-colors",
          view === "radar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Radar className="size-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-pressed={view === "bars"}
        aria-label="Vista barras"
        onClick={() => onChange("bars")}
        className={cn(
          "cursor-pointer rounded-full p-2 transition-colors",
          view === "bars"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <BarChart3 className="size-4" strokeWidth={2} />
      </button>
    </div>
  )
}

function YearToggle({
  year,
  onChange,
}: {
  year: DerechosYear
  onChange: (y: DerechosYear) => void
}) {
  const options: { value: DerechosYear; label: string }[] = [
    { value: 2022, label: "Mundial 2022" },
    { value: 2024, label: "Data 2024" },
  ]

  return (
    <div
      className="inline-flex rounded-full border border-border bg-muted/50 p-1"
      role="group"
      aria-label="Año del mundial"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors",
            year === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function CountryPills({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: CountryKey | null
  onSelect: (key: CountryKey) => void
}) {
  const solo = selectedCountry !== null

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Seleccionar país"
    >
      {countries.map((country) => {
        const isSelected = selectedCountry === country.key
        const dimmed = solo && !isSelected

        return (
          <button
            key={country.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(country.key)}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isSelected
                ? "border-foreground/25 bg-muted shadow-sm opacity-100"
                : dimmed
                  ? "border-border/50 bg-transparent text-muted-foreground opacity-40"
                  : "border-border bg-muted/30 opacity-100 hover:border-foreground/20 hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full transition-opacity",
                dimmed && "opacity-50",
              )}
              style={{ backgroundColor: country.color }}
              aria-hidden
            />
            {country.name}
          </button>
        )
      })}
    </div>
  )
}

function IndicatorInfoPanel({ indicatorKey }: { indicatorKey: DerechosIndicatorKey }) {
  const info = getDerechosIndicator(indicatorKey)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-3 text-left shadow-sm"
      role="region"
      aria-label={`Información sobre ${info.label}`}
    >
      <p className="text-sm font-medium text-foreground">{info.title}</p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{info.description}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Fuente: <span className="text-foreground/85">{info.fuente}</span>
      </p>
    </motion.div>
  )
}

function RadarAxisLabels({
  openIndicator,
  onToggleIndicator,
  dimmed,
}: {
  openIndicator: DerechosIndicatorKey | null
  onToggleIndicator: (key: DerechosIndicatorKey) => void
  dimmed: boolean
}) {
  const size = 400
  const center = size / 2
  const maxRadius = size / 2 - 72
  const labelRadius = maxRadius + 44
  const angleStep = (2 * Math.PI) / DERECHOS_INDICATORS.length

  return (
    <div className="pointer-events-none absolute inset-0">
      {DERECHOS_INDICATORS.map((ind, i) => {
        const angle = i * angleStep - Math.PI / 2
        const xPct = ((center + labelRadius * Math.cos(angle)) / size) * 100
        const yPct = ((center + labelRadius * Math.sin(angle)) / size) * 100
        const isOpen = openIndicator === ind.key

        return (
          <button
            key={ind.key}
            type="button"
            aria-expanded={isOpen}
            aria-label={`${ind.label}. Tocá para más información.`}
            onClick={() => onToggleIndicator(ind.key)}
            className={cn(
              "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2",
              "max-w-[6.25rem] sm:max-w-[4.75rem] rounded-md px-1 py-1",
              "text-center text-xs leading-[1.2] font-medium sm:text-[10px] sm:leading-tight",
              "transition-colors duration-200 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isOpen
                ? "text-foreground"
                : dimmed
                  ? "text-muted-foreground/50"
                  : "text-muted-foreground hover:text-foreground",
            )}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            {ind.labelLines.map((line, lineIdx) => (
              <span key={lineIdx} className={lineIdx > 0 ? "block" : undefined}>
                {line}
              </span>
            ))}
          </button>
        )
      })}
    </div>
  )
}

function IndicatorBarsCard({
  point,
  selectedCountry,
  index,
}: {
  point: RadarDataPoint
  selectedCountry: CountryKey | null
  index: number
}) {
  const info = getDerechosIndicator(point.key)

  const visibleCountries = selectedCountry
    ? countries.filter((c) => c.key === selectedCountry)
    : countries

  const maxVal = Math.max(
    ...countries.map((c) => point[c.key]),
    1,
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="rounded-lg border border-border bg-card px-4 py-4 sm:px-5"
    >
      <div>
        <h4 className="text-sm font-medium text-foreground sm:text-base">{info.label}</h4>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
          {info.description}
        </p>
      </div>

      <ul className="mt-4 space-y-2.5" aria-label={`Valores: ${info.label}`}>
        {visibleCountries.map((country) => {
          const value = point[country.key]
          const widthPct = (value / maxVal) * 100

          return (
            <li key={country.key} className="flex items-center gap-2 sm:gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground sm:w-16">
                {country.name}
              </span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: country.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {value}
              </span>
            </li>
          )
        })}
      </ul>
    </motion.article>
  )
}

function BarsView({
  radarData,
  selectedCountry,
}: {
  radarData: RadarDataPoint[]
  selectedCountry: CountryKey | null
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      {radarData.map((point, index) => (
        <IndicatorBarsCard
          key={point.key}
          point={point}
          selectedCountry={selectedCountry}
          index={index}
        />
      ))}
    </div>
  )
}

function RadarChart({
  radarData,
  selectedCountry,
  openIndicator,
  onToggleIndicator,
}: {
  radarData: RadarDataPoint[]
  selectedCountry: CountryKey | null
  openIndicator: DerechosIndicatorKey | null
  onToggleIndicator: (key: DerechosIndicatorKey) => void
}) {
  const size = 400
  const center = size / 2
  const maxRadius = size / 2 - 72
  const levels = 5
  const angleStep = (2 * Math.PI) / radarData.length
  const solo = selectedCountry !== null
  const valuesCountry = selectedCountry
  const valuesCountryMeta = valuesCountry
    ? countries.find((c) => c.key === valuesCountry)
    : null

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2
    const radius = (value / 100) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      angle,
    }
  }

  const getPath = (countryKey: CountryKey) => {
    const points = radarData.map((d, i) => getPoint(d[countryKey], i))
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  }

  const showValues = valuesCountry !== null

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(100%,28rem)]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
      {Array.from({ length: levels }).map((_, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={((i + 1) / levels) * maxRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
        />
      ))}

      {radarData.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const endX = center + maxRadius * Math.cos(angle)
        const endY = center + maxRadius * Math.sin(angle)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endX}
            y2={endY}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
          />
        )
      })}

      {countries.map((country) => {
        const isHighlighted = valuesCountry === country.key
        const isVisible = !solo || isHighlighted

        let opacity = 0.08
        let fillOpacity = 0.02
        let strokeWidth = 1.5

        if (isVisible) {
          if (solo) {
            opacity = 1
            fillOpacity = 0.22
            strokeWidth = 2.5
          } else {
            opacity = 0.8
            fillOpacity = 0.1
            strokeWidth = 2
          }
        }

        return (
          <motion.path
            key={country.key}
            d={getPath(country.key)}
            fill={country.color}
            stroke={country.color}
            initial={false}
            animate={{
              d: getPath(country.key),
              opacity,
              fillOpacity,
              strokeWidth,
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        )
      })}

      {valuesCountry &&
        radarData.map((d, i) => {
          const value = d[valuesCountry]
          const { x, y, angle } = getPoint(value, i)
          const labelOffset = 10
          const lx = x + labelOffset * Math.cos(angle)
          const ly = y + labelOffset * Math.sin(angle)

          return (
            <g key={`${valuesCountry}-${d.category}`}>
              <circle
                cx={x}
                cy={y}
                r={4}
                fill={valuesCountryMeta?.color ?? "currentColor"}
                stroke="var(--background)"
                strokeWidth="1.5"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[12px] md:text-[14px] font-semibold fill-foreground"
              >
                {value}
              </text>
            </g>
          )
        })}

      </svg>

      <RadarAxisLabels
        openIndicator={openIndicator}
        onToggleIndicator={onToggleIndicator}
        dimmed={showValues}
      />
    </div>
  )
}

export function DerechosSection() {
  const { getIndicador } = useData()
  const derechos = getIndicador("DERECHOS")
  const chartAreaRef = useRef<HTMLDivElement>(null)

  const [year, setYear] = useState<DerechosYear>(2024)
  const [chartView, setChartView] = useState<ChartView>("radar")
  const [selectedCountry, setSelectedCountry] = useState<CountryKey | null>(null)
  const [openIndicator, setOpenIndicator] = useState<DerechosIndicatorKey | null>(null)
  const [rows, setRows] = useState<DerechosRawRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchDerechosData()
      .then((data) => {
        if (!cancelled) {
          setRows(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar datos")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const radarData = buildRadarData(rows, year)

  const toggleIndicator = (key: DerechosIndicatorKey) => {
    setOpenIndicator((prev) => (prev === key ? null : key))
  }

  const clearCountrySelection = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  const selectCountry = (key: CountryKey) => {
    setSelectedCountry((prev) => (prev === key ? null : key))
  }

  useEffect(() => {
    if (selectedCountry === null) return

    const handlePointerDown = (event: PointerEvent) => {
      if (chartAreaRef.current?.contains(event.target as Node)) return
      clearCountrySelection()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [selectedCountry, clearCountrySelection])

  return (
    <SectionWrapper progressSection="derechos"
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[derechos]}
      sourcesHideValues
    >
      <div ref={chartAreaRef} className="flex flex-col items-center gap-8">
        <div
          className={cn(
            "sticky top-0 z-30 flex w-full max-w-2xl items-center justify-between gap-3 min-h-10",
            "py-2 -mx-1 px-1 sm:mx-0",
            "bg-background/85 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)]",
            "border-b border-border/40",
          )}
        >
          <YearToggle year={year} onChange={setYear} />
          <ViewToggle view={chartView} onChange={setChartView} />
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground">Cargando indicadores…</p>
        )}
        {error && (
          <p className="text-sm text-destructive">No se pudieron cargar los datos: {error}</p>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="flex w-full flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              {chartView === "radar" ? (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full flex-col items-center gap-8"
                >
                  <RadarChart
                    radarData={radarData}
                    selectedCountry={selectedCountry}
                    openIndicator={openIndicator}
                    onToggleIndicator={toggleIndicator}
                  />
                  <AnimatePresence mode="wait">
                    {openIndicator && (
                      <IndicatorInfoPanel key={openIndicator} indicatorKey={openIndicator} />
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="bars"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex justify-center"
                >
                  <BarsView radarData={radarData} selectedCountry={selectedCountry} />
                </motion.div>
              )}
            </AnimatePresence>
            <CountryPills selectedCountry={selectedCountry} onSelect={selectCountry} />
            <p className="text-xs text-muted-foreground text-center max-w-md">
              {chartView === "radar" ? (
                <>
                  Tocá un eje para ver qué mide cada indicador. Tocá un país para ver solo sus valores;
                  volvé a tocarlo o tocá afuera del gráfico para mostrar todos (0–100, donde 100 es mejor).
                </>
              ) : (
                <>
                  Cada indicador muestra el puntaje por sede. Usá las pills de abajo para filtrar un país
                  (0–100, donde 100 es mejor).
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
