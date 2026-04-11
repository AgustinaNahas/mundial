"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import { SectionWrapper } from "@/components/section-wrapper"
import { StatCard } from "@/components/stat-card"
import { useData } from "@/lib/data-context"

function ClockIcon({ time, className }: { time: string; className?: string }) {
  const hours = parseInt(time.split(":")[0])
  const minutes = parseInt(time.split(":")[1])
  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  const minuteAngle = minutes * 6
  
  return (
    <svg className={className} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x1 = 50 + 38 * Math.cos(angle)
        const y1 = 50 + 38 * Math.sin(angle)
        const x2 = 50 + 42 * Math.cos(angle)
        const y2 = 50 + 42 * Math.sin(angle)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />
        )
      })}
      {/* Hour hand */}
      <line
        x1="50"
        y1="50"
        x2={50 + 20 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
        y2={50 + 20 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1="50"
        y1="50"
        x2={50 + 30 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
        y2={50 + 30 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  )
}

export function TrabajoSection() {
  const { getIndicador, loading } = useData()
  
  const salario = getIndicador("SUELDO_MIN_PESOS")
  
  const salario_2022 = salario?.valor_2022 ?? 57900
  const salario_2026 = salario?.valor_2026 ?? 279718
  
  // Salario diario (22 dias laborables)
  const dia_2022 = Math.round(salario_2022 / 22)
  const dia_2026 = Math.round(salario_2026 / 22)
  
  if (loading) {
    return (
      <SectionWrapper number="08" title="El que falto al laburo" intro="Cargando datos..." bgColor="muted">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </SectionWrapper>
    )
  }
  
  return (
    <SectionWrapper
      number="08"
      title="El que falto al laburo"
      intro="Faltar en 2022 costaba menos. En 2026, con nuevas reglas, el costo puede ser mayor."
      bgColor="muted"
      sources={[salario]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-8 mb-8"
          >
            <div className="text-center">
              <ClockIcon time="10:30" className="w-24 h-24 text-primary mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Hora del partido</p>
            </div>
            <div className="text-center">
              <ClockIcon time="14:00" className="w-24 h-24 text-accent mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Hora laboral</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 bg-card rounded-lg border border-border"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Muchos partidos de Argentina se juegan en horario laboral
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Salario diario promedio 2022</span>
                <span className="font-medium text-primary">{formatCurrency(dia_2022, salario?.unidad)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Salario diario promedio 2026</span>
                <span className="font-medium text-accent">{formatCurrency(dia_2026, salario?.unidad)}</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <StatCard
            value={formatCurrency(dia_2022, salario?.unidad)}
            label="Costo de faltar un dia"
            subtext="En 2022"
            delay={0.4}
          />
          <StatCard
            value={formatCurrency(dia_2026, salario?.unidad)}
            label="Costo de faltar un dia"
            subtext="En 2026"
            delay={0.5}
          />
          <StatCard
            value="7 partidos"
            label="Minimo de Argentina en fase de grupos + octavos"
            subtext="Potenciales dias de ausencia"
            delay={0.6}
            variant="highlight"
          />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-12 p-6 bg-primary/5 rounded-lg"
      >
        <h4 className="text-sm font-medium text-foreground mb-3">Cambios normativos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium">2022</p>
              <p className="text-xs text-muted-foreground">Tolerancia tradicional a la "fiebre mundialista"</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium">2026</p>
              <p className="text-xs text-muted-foreground">Mayor rigidez en controles de asistencia</p>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}
