"use client"

import { motion } from "framer-motion"
import { SectionWrapper } from "@/components/section-wrapper"

interface RadarDataPoint {
  category: string
  argentina: number
  qatar: number
  eeuu: number
  canada: number
  mexico: number
}

const radarData: RadarDataPoint[] = [
  { category: "Libertad de prensa", argentina: 68, qatar: 45, eeuu: 72, canada: 85, mexico: 52 },
  { category: "Derechos LGBTQ+", argentina: 82, qatar: 15, eeuu: 70, canada: 90, mexico: 65 },
  { category: "Igualdad de género", argentina: 75, qatar: 52, eeuu: 76, canada: 88, mexico: 62 },
  { category: "Libertad económica", argentina: 45, qatar: 72, eeuu: 78, canada: 80, mexico: 65 },
  { category: "Índice democrático", argentina: 70, qatar: 30, eeuu: 75, canada: 92, mexico: 58 },
]

const countries = [
  { name: "Argentina", key: "argentina" as const, color: "var(--primary)" },
  { name: "Qatar", key: "qatar" as const, color: "var(--muted-foreground)" },
  { name: "EEUU", key: "eeuu" as const, color: "var(--accent)" },
  { name: "Canadá", key: "canada" as const, color: "var(--chart-3)" },
  { name: "México", key: "mexico" as const, color: "var(--chart-5)" },
]

function RadarChart() {
  const size = 300
  const center = size / 2
  const maxRadius = size / 2 - 40
  const levels = 5
  
  const angleStep = (2 * Math.PI) / radarData.length
  
  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2
    const radius = (value / 100) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }
  
  const getPath = (countryKey: keyof Omit<RadarDataPoint, 'category'>) => {
    const points = radarData.map((d, i) => getPoint(d[countryKey], i))
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  }
  
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {/* Background circles */}
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
      
      {/* Axis lines */}
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
      
      {/* Data polygons */}
      {countries.map((country) => (
        <motion.path
          key={country.key}
          d={getPath(country.key)}
          fill={country.color}
          fillOpacity={0.1}
          stroke={country.color}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      ))}
      
      {/* Labels */}
      {radarData.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = maxRadius + 25
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] fill-muted-foreground"
          >
            {d.category}
          </text>
        )
      })}
    </svg>
  )
}

export function DerechosSection() {
  return (
    <SectionWrapper
      number="13"
      title="Derechos: Qatar vs EEUU vs Canadá vs México"
      intro="No todos los Mundiales se juegan en la cancha."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <RadarChart />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <h4 className="text-sm font-medium text-foreground mb-6">
            Índices comparativos (0-100)
          </h4>
          
          {countries.map((country, i) => (
            <motion.div
              key={country.key}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: country.color }}
              />
              <span className="text-sm font-medium w-20">{country.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${radarData.reduce((acc, d) => acc + d[country.key], 0) / radarData.length}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: country.color }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round(radarData.reduce((acc, d) => acc + d[country.key], 0) / radarData.length)}%
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        {radarData.map((d, i) => (
          <div key={i} className="p-4 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">{d.category}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Argentina</span>
                <span className="font-medium" style={{ color: "var(--primary)" }}>{d.argentina}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Qatar</span>
                <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>{d.qatar}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>EEUU</span>
                <span className="font-medium" style={{ color: "var(--accent)" }}>{d.eeuu}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
