"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"
import { useData } from "@/lib/data-context"
import {
  buildRadarData,
  fetchDerechosData,
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

const ALL_COUNTRY_KEYS = countries.map((c) => c.key)

function CountryPills({
  active,
  hovered,
  onToggle,
  onHover,
}: {
  active: Set<CountryKey>
  hovered: CountryKey | null
  onToggle: (key: CountryKey) => void
  onHover: (key: CountryKey | null) => void
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Mostrar u ocultar países en el gráfico"
      onMouseLeave={() => onHover(null)}
    >
      {countries.map((country) => {
        const isOn = active.has(country.key)
        const isHovered = hovered === country.key

        return (
          <button
            key={country.key}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(country.key)}
            onMouseEnter={() => onHover(country.key)}
            onFocus={() => onHover(country.key)}
            onBlur={() => onHover(null)}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isHovered && "ring-2 ring-foreground/15",
              isOn
                ? "border-foreground/25 bg-muted shadow-sm opacity-100"
                : "border-border/60 bg-transparent text-muted-foreground opacity-45 hover:opacity-60",
            )}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full transition-opacity",
                !isOn && "opacity-50",
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

function RadarChart({
  radarData,
  active,
  hovered,
}: {
  radarData: RadarDataPoint[]
  active: Set<CountryKey>
  hovered: CountryKey | null
}) {
  const size = 360
  const center = size / 2
  const maxRadius = size / 2 - 56
  const levels = 5
  const angleStep = (2 * Math.PI) / radarData.length
  const activeCount = active.size
  const valuesCountry: CountryKey | null =
    hovered ??
    (activeCount === 1 ? ([...active][0] as CountryKey) : null)
  const valuesCountryMeta = valuesCountry
    ? countries.find((c) => c.key === valuesCountry)
    : null
  const hasHover = hovered !== null

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

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-lg mx-auto">
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
        const isOn = active.has(country.key)
        const isHighlighted = valuesCountry === country.key
        const solo = !hasHover && activeCount === 1 && isOn

        let opacity = 0.08
        let fillOpacity = 0.02
        let strokeWidth = 1.5

        if (isOn) {
          if (hasHover) {
            opacity = isHighlighted ? 1 : 0.12
            fillOpacity = isHighlighted ? 0.22 : 0.02
            strokeWidth = isHighlighted ? 2.5 : 1.5
          } else {
            opacity = solo || activeCount <= 2 ? 1 : 0.8
            fillOpacity = solo ? 0.22 : 0.1
            strokeWidth = solo ? 2.5 : 2
          }
        } else if (hasHover && isHighlighted) {
          opacity = 0.5
          fillOpacity = 0.12
          strokeWidth = 2
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
                className="text-[9px] font-semibold fill-foreground"
              >
                {value}
              </text>
            </g>
          )
        })}

      {radarData.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = maxRadius + 32
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)
        return (
          <text
            key={d.category}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn(
              "text-[6px] md:text-[7px] transition-opacity duration-200",
              valuesCountry ? "fill-muted-foreground/60" : "fill-muted-foreground",
            )}
          >
            {d.category}
          </text>
        )
      })}
    </svg>
  )
}

export function DerechosSection() {
  const { getIndicador } = useData()
  const derechos = getIndicador("DERECHOS")

  const [year, setYear] = useState<DerechosYear>(2024)
  const [activeCountries, setActiveCountries] = useState<Set<CountryKey>>(
    () => new Set(ALL_COUNTRY_KEYS),
  )
  const [hoveredCountry, setHoveredCountry] = useState<CountryKey | null>(null)
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

  const toggleCountry = (key: CountryKey) => {
    setActiveCountries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <SectionWrapper
      number={copy.number}
      title={copy.title}
      intro={copy.intro}
      closing={copy.closing}
      sources={[derechos]}
      sourcesHideValues
    >
      <div className="flex flex-col items-center gap-8">
        <YearToggle year={year} onChange={setYear} />

        {loading && (
          <p className="text-sm text-muted-foreground">Cargando indicadores…</p>
        )}
        {error && (
          <p className="text-sm text-destructive">No se pudieron cargar los datos: {error}</p>
        )}
        {!loading && !error && rows.length > 0 && (
          <>
            <RadarChart
              radarData={radarData}
              active={activeCountries}
              hovered={hoveredCountry}
            />
            <CountryPills
              active={activeCountries}
              hovered={hoveredCountry}
              onToggle={toggleCountry}
              onHover={setHoveredCountry}
            />
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Tocá un país para ocultarlo. Pasá el mouse por una pill para ver sus valores en
              cada eje (0–100, donde 100 es mejor).
            </p>
          </>
        )}
      </div>
    </SectionWrapper>
  )
}
