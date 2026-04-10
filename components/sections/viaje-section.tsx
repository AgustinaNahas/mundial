"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"

const W = 960
const H = 500

interface MapData {
  countryPaths: string[]
  BA: [number, number]
  DOHA: [number, number]
  MIAMI: [number, number]
  dPathDoha: string
  dPathMiami: string
}

function WorldMap() {
  const [mapData, setMapData] = useState<MapData | null>(null)

  useEffect(() => {
    const proj = geoNaturalEarth1()
    // fitSize con {type:"Sphere"} — escala y centra el mapa al viewBox exacto
    proj.fitSize([W, H], { type: "Sphere" } as Parameters<typeof proj.fitSize>[1])

    const pg = geoPath(proj)

    const BA    = proj([-58.4, -34.6]) ?? [0, 0]
    const DOHA  = proj([ 51.5,  25.3]) ?? [0, 0]
    const MIAMI = proj([-80.2,  25.8]) ?? [0, 0]

    const dPathDoha  = pg({ type: "LineString", coordinates: [[-58.4, -34.6], [51.5,  25.3]] } as Parameters<typeof pg>[0]) ?? ""
    const dPathMiami = pg({ type: "LineString", coordinates: [[-58.4, -34.6], [-80.2, 25.8]] } as Parameters<typeof pg>[0]) ?? ""

    // Mostrar rutas y marcadores de inmediato, shapes de países cuando cargue
    setMapData({
      countryPaths: [],
      BA:    BA    as [number, number],
      DOHA:  DOHA  as [number, number],
      MIAMI: MIAMI as [number, number],
      dPathDoha,
      dPathMiami,
    })

    fetch("/countries.geojson")
      .then(r => r.json())
      .then((geo: { features: object[] }) => {
        const countryPaths = geo.features
          .map(f => pg(f as Parameters<typeof pg>[0]) ?? "")
          .filter(d => d.length > 0)
        setMapData(prev => prev ? { ...prev, countryPaths } : null)
      })
      .catch(console.error)
  }, [])

  const land   = "oklch(0.22 0.06 255)"
  const ocean  = "oklch(0.09 0.07 258)"
  const border = "oklch(0.16 0.07 257)"
  const colorDoha  = "oklch(0.65 0.18 222)"
  const colorMiami = "oklch(0.82 0.11 220)"

  const { BA, DOHA, MIAMI, countryPaths, dPathDoha, dPathMiami } = mapData ?? {
    BA: [W / 2, H / 2], DOHA: [W / 2, H / 2], MIAMI: [W / 2, H / 2],
    countryPaths: [], dPathDoha: "", dPathMiami: "",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative w-full rounded-xl overflow-hidden border border-border/30"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ background: ocean }}>

        {/* Países */}
        {countryPaths.map((d, i) => (
          <path key={i} d={d} fill={land} stroke={border} strokeWidth="0.5" />
        ))}

        {/* Skeleton de carga */}
        {countryPaths.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fill={border}
            fontSize="13" fontFamily="sans-serif">
            Cargando mapa…
          </text>
        )}

        {/* Ruta BsAs → Doha */}
        {dPathDoha && (
          <motion.path
            d={dPathDoha}
            fill="none"
            stroke={colorDoha}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="6 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
          />
        )}

        {/* Ruta BsAs → Miami */}
        {dPathMiami && (
          <motion.path
            d={dPathMiami}
            fill="none"
            stroke={colorMiami}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="6 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        )}

        {/* Buenos Aires */}
        <motion.circle cx={BA[0]} cy={BA[1]} r="5" fill="white"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
        <circle cx={BA[0]} cy={BA[1]} r="9" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        <text x={BA[0] + 10} y={BA[1] + 4} fill="white" fontSize="11" fontFamily="sans-serif" opacity="0.85">Buenos Aires</text>

        {/* Doha */}
        <motion.circle cx={DOHA[0]} cy={DOHA[1]} r="5" fill={colorDoha}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
        <circle cx={DOHA[0]} cy={DOHA[1]} r="9" fill="none" stroke={colorDoha} strokeWidth="1" opacity="0.3" />
        <text x={DOHA[0] + 10} y={DOHA[1] - 6} fill={colorDoha} fontSize="11" fontFamily="sans-serif" opacity="0.9">Doha</text>

        {/* Miami */}
        <motion.circle cx={MIAMI[0]} cy={MIAMI[1]} r="5" fill={colorMiami}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} />
        <circle cx={MIAMI[0]} cy={MIAMI[1]} r="9" fill="none" stroke={colorMiami} strokeWidth="1" opacity="0.3" />
        <text x={MIAMI[0] - 40} y={MIAMI[1] - 10} fill={colorMiami} fontSize="11" fontFamily="sans-serif" opacity="0.9">Miami</text>

        {/* Leyenda */}
        <rect x="18" y="14" width="176" height="50" rx="5" fill="oklch(0.14 0.08 256)" opacity="0.88" />
        <circle cx="32" cy="29" r="4" fill={colorDoha} />
        <text x="42" y="33" fill={colorDoha} fontSize="10" fontFamily="sans-serif">Qatar 2022 · 12.900 km</text>
        <circle cx="32" cy="50" r="4" fill={colorMiami} />
        <text x="42" y="54" fill={colorMiami} fontSize="10" fontFamily="sans-serif">EEUU 2026 · 7.800 km</text>
      </svg>
    </motion.div>
  )
}

export function ViajeSection() {
  const { getIndicador, loading } = useData()

  const vuelo2022Item  = getIndicador("BSAS_DOHA")
  const vuelo2026Item  = getIndicador("BSAS_MIAMI")
  const paqueteItem    = getIndicador("PAQUETE_BASICO")
  const salarioItem    = getIndicador("SUELDO_MIN_PESOS")
  const dolarItem      = getIndicador("VALOR_DOLAR_PESO")

  const vuelo_2022   = vuelo2022Item?.valor_2022   ?? 0
  const vuelo_2026   = vuelo2026Item?.valor_2026   ?? 0
  const paquete_2022 = paqueteItem?.valor_2022     ?? 0
  const paquete_2026 = paqueteItem?.valor_2026     ?? 0

  const salario_2022 = salarioItem?.valor_2022     ?? 61953
  const salario_2026 = salarioItem?.valor_2026     ?? 346800
  const dolar_2022   = dolarItem?.valor_2022       ?? 266.43
  const dolar_2026   = dolarItem?.valor_2026       ?? 1430

  const salarioUSD2022 = salario_2022 / dolar_2022
  const salarioUSD2026 = salario_2026 / dolar_2026
  const salarios2022 = paquete_2022 > 0 ? Math.round(paquete_2022 / salarioUSD2022) : 0
  const salarios2026 = paquete_2026 > 0 ? Math.round(paquete_2026 / salarioUSD2026) : 0

  if (loading) {
    return (
      <SectionWrapper number="05" title="Viajar al Mundial" intro="Cargando datos...">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      number="05"
      title="Viajar al Mundial"
      intro={`El viaje al Mundial equivalía a ${salarios2022} salarios mínimos en 2022. En 2026 equivale a ${salarios2026}.`}
    >
      <WorldMap />

      <div className="space-y-8 mt-12">
        <ComparisonBar
          label="Vuelo ida y vuelta"
          value2022={vuelo_2022}
          value2026={vuelo_2026}
          unit="USD "
          delay={0}
        />
        <ComparisonBar
          label="Paquete básico (vuelo + hotel 7 noches + entrada)"
          value2022={paquete_2022}
          value2026={paquete_2026}
          unit="USD "
          delay={0.2}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12"
      >
        <h4 className="text-sm font-medium text-foreground mb-6">
          ¿Cuántos salarios mínimos para viajar?
        </h4>
        <div className="flex items-end gap-12">
          <div>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {Array.from({ length: Math.min(salarios2022, 30) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.03, duration: 0.2 }}
                  className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-medium"
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-2xl font-light text-primary">{salarios2022} salarios</p>
            <p className="text-sm text-muted-foreground">para Qatar 2022</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {Array.from({ length: Math.min(salarios2026, 50) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.03, duration: 0.2 }}
                  className="w-8 h-8 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-medium"
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-2xl font-light text-accent">{salarios2026} salarios</p>
            <p className="text-sm text-muted-foreground">para EEUU 2026</p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
