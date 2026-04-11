"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { SectionWrapper } from "@/components/section-wrapper"
import { ComparisonBar } from "@/components/comparison-bar"
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/utils"

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
    proj.fitSize([W, H], { type: "Sphere" } as any)
    const pg = geoPath(proj)

    const BA_COORD: [number, number] = [-58.4, -34.6]
    const DOHA_COORD: [number, number] = [51.5, 25.3]
    const MIAMI_COORD: [number, number] = [-80.2, 25.8]

    const BA = proj(BA_COORD) ?? [0, 0]
    const DOHA = proj(DOHA_COORD) ?? [0, 0]
    const MIAMI = proj(MIAMI_COORD) ?? [0, 0]

    const dPathDoha = pg({ type: "LineString", coordinates: [BA_COORD, DOHA_COORD] } as any) ?? ""
    const dPathMiami = pg({ type: "LineString", coordinates: [BA_COORD, MIAMI_COORD] } as any) ?? ""

    setMapData({
      countryPaths: [],
      BA: BA as [number, number],
      DOHA: DOHA as [number, number],
      MIAMI: MIAMI as [number, number],
      dPathDoha,
      dPathMiami,
    })

    const loadCountries = async () => {
      const paths = ["/mundial/countries.geojson", "countries.geojson", "/countries.geojson"]
      for (const p of paths) {
        try {
          const res = await fetch(p)
          if (res.ok) {
            const geo = await res.json()
            const paths = geo.features.map((f: any) => pg(f)).filter(Boolean)
            setMapData(prev => prev ? { ...prev, countryPaths: paths } : null)
            return
          }
        } catch (e) {
          console.warn(`Failed to fetch from ${p}:`, e)
        }
      }
    }

    loadCountries()
  }, [])

  const land = "oklch(0.28 0.03 260)"
  const ocean = "oklch(0.12 0.04 265)"
  const border = "oklch(0.35 0.03 260)"
  const colorDoha = "oklch(0.65 0.22 30)"
  const colorMiami = "oklch(0.7 0.18 200)"

  const { BA, DOHA, MIAMI, countryPaths, dPathDoha, dPathMiami } = mapData ?? {
    BA: [W / 2, H / 2], DOHA: [W / 2, H / 2], MIAMI: [W / 2, H / 2],
    countryPaths: [], dPathDoha: "", dPathMiami: "",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-[#050608]"
    >
      <div className="absolute top-6 left-8 z-10">
        <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium mb-1">Mapa de Rutas</h3>
        <p className="text-white text-lg font-light tracking-tight">Buenos Aires <span className="text-white/20 mx-1">→</span> Global</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ background: ocean }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="countries">
          {countryPaths.length > 0 ? (
            countryPaths.map((d, i) => (
              <path 
                key={i} 
                d={d} 
                fill={land} 
                stroke={border} 
                strokeWidth="0.5" 
                className="transition-colors duration-500 hover:fill-[oklch(0.35_0.04_260)]"
              />
            ))
          ) : (
            <text x={W / 2} y={H / 2} textAnchor="middle" fill="white" fontSize="12" fontFamily="inherit" opacity="0.3" className="animate-pulse">
              PROCESANDO GEOMETRÍA GLOBAL...
            </text>
          )}
        </g>

        {dPathDoha && (
          <motion.path
            d={dPathDoha}
            fill="none"
            stroke={colorDoha}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1, 8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
            style={{ filter: "url(#glow)" }}
          />
        )}
        {dPathMiami && (
          <motion.path
            d={dPathMiami}
            fill="none"
            stroke={colorMiami}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1, 8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            style={{ filter: "url(#glow)" }}
          />
        )}
        
        {/* Cities */}
        <g className="cities">
          <circle cx={BA[0]} cy={BA[1]} r="4" fill="white" />
          <circle cx={BA[0]} cy={BA[1]} r="12" fill="none" stroke="white" strokeWidth="1" opacity="0.15" />
          <text x={BA[0] + 16} y={BA[1] + 5} fill="white" fontSize="12" fontWeight="300" className="drop-shadow-lg">BUENOS AIRES</text>

          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
            <circle cx={DOHA[0]} cy={DOHA[1]} r="5" fill={colorDoha} style={{ filter: "url(#glow)" }} />
            <text x={DOHA[0] + 16} y={DOHA[1] - 8} fill={colorDoha} fontSize="14" fontWeight="600" className="drop-shadow-lg tracking-wider">DOHA</text>
          </motion.g>

          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            <circle cx={MIAMI[0]} cy={MIAMI[1]} r="5" fill={colorMiami} style={{ filter: "url(#glow)" }} />
            <text x={MIAMI[0] - 60} y={MIAMI[1] - 15} fill={colorMiami} fontSize="14" fontWeight="600" className="drop-shadow-lg tracking-wider">MIAMI</text>
          </motion.g>
        </g>

        {/* Legend Overlay */}
        <g transform={`translate(${W - 220}, ${H - 100})`}>
          <rect width="190" height="70" rx="20" fill="black" fillOpacity="0.6" className="backdrop-blur-md" />
          <g transform="translate(25, 28)">
            <circle r="4" fill={colorDoha} />
            <text x="16" y="5" fill="white" fontSize="11" fontWeight="400" opacity="0.7">QATAR 2022 · 13.3K KM</text>
          </g>
          <g transform="translate(25, 48)">
            <circle r="4" fill={colorMiami} />
            <text x="16" y="5" fill="white" fontSize="11" fontWeight="400" opacity="0.7">EEUU 2026 · 7.1K KM</text>
          </g>
        </g>
      </svg>
    </motion.div>
  )
}

export function ViajeSection() {
  const { getIndicador, loading } = useData()

  const vuelo2022Item = getIndicador("BSAS_DOHA")
  const vuelo2026Item = getIndicador("BSAS_MIAMI")
  const salarioItem = getIndicador("SUELDO_MIN_PESOS")

  const vuelo_2022 = vuelo2022Item?.valor_2022 ?? 374124
  const vuelo_2026 = vuelo2026Item?.valor_2026 ?? 2860000

  const salario_2022 = salarioItem?.valor_2022 ?? 61953
  const salario_2026 = salarioItem?.valor_2026 ?? 346800

  const salarios2022 = Math.round((vuelo_2022 / salario_2022) * 10) / 10
  const salarios2026 = Math.round((vuelo_2026 / salario_2026) * 10) / 10

  if (loading) return null

  return (
    <SectionWrapper 
      number="05" 
      title="El Viaje al Mundial" 
      intro={`Costear los vuelos ida y vuelta en 2022 requería ${salarios2022} salarios mínimos. Para 2026, la cifra asciende a ${salarios2026}.`}
    >
      <WorldMap />
      
      <div className="mt-12 mb-16">
        <ComparisonBar 
          label="Precio del vuelo (ARS)" 
          value2022={vuelo_2022} 
          value2026={vuelo_2026} 
          unit="ARS" 
          delay={0} 
        />
      </div>

      <div className="mt-12 bg-secondary/10 rounded-2xl p-8 border border-border/10">
        <h4 className="text-lg font-medium text-foreground mb-8 text-center flex items-center justify-center gap-2">
          ¿Cuántos salarios mínimos para volar?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">Qatar 2022</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.ceil(salarios2022) }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center text-primary font-bold text-xs"
                >
                  {i + 1 <= salarios2022 ? i + 1 : "½"}
                </motion.div>
              ))}
            </div>
            <p className="text-3xl font-bold text-primary text-center pt-2">{salarios2022} <span className="text-sm font-normal text-muted-foreground">sueldos</span></p>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/10 pt-8 md:pt-0 md:pl-8">
            <p className="text-sm text-muted-foreground text-center mb-4">EEUU 2026</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.ceil(salarios2026) }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center text-accent font-bold text-xs"
                >
                  {i + 1 <= salarios2026 ? i + 1 : "½"}
                </motion.div>
              ))}
            </div>
            <p className="text-3xl font-bold text-accent text-center pt-2">{salarios2026} <span className="text-sm font-normal text-muted-foreground">sueldos</span></p>
          </div>
        </div>
      </div>
    </SectionWrapper>

  )
}
