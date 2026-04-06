"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pub?gid=0&single=true&output=csv"

// Estructura del CSV:
// INDICADOR | INDICADOR_DESCRIPCION | PERIODO | VALOR | FUENTES

export interface RawDataRow {
  indicador: string
  descripcion: string
  periodo: number
  valor: number
  fuente: string
}

export interface DataItem {
  indicador: string
  descripcion: string
  valor_2022: number
  valor_2026: number
  fuente_2022?: string
  fuente_2026?: string
}

interface DataContextType {
  data: DataItem[]
  rawData: RawDataRow[]
  loading: boolean
  error: string | null
  getIndicador: (indicador: string) => DataItem | undefined
  getIndicadores: (pattern: string) => DataItem[]
  getValue: (indicador: string, periodo: 2022 | 2026) => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Parse Argentine number format: $1.499.999,00 -> 1499999.00
function parseArgentineNumber(value: string): number {
  if (!value) return 0
  // Remove currency symbol and whitespace
  let cleaned = value.replace(/[$\s]/g, "").trim()
  // Argentine format uses . for thousands and , for decimals
  // Remove thousand separators (dots)
  cleaned = cleaned.replace(/\./g, "")
  // Replace decimal comma with dot
  cleaned = cleaned.replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseCSV(csv: string): RawDataRow[] {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []
  
  // Skip header row
  return lines.slice(1).map(line => {
    // Handle commas inside quotes and tabs
    const values: string[] = []
    let current = ""
    let inQuotes = false
    
    // Support both comma and tab as delimiters
    const delimiter = line.includes("\t") ? "\t" : ","
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    return {
      indicador: values[0] || "",
      descripcion: values[1] || "",
      periodo: parseInt(values[2]) || 0,
      valor: parseArgentineNumber(values[3] || "0"),
      fuente: values[4] || ""
    }
  }).filter(row => row.indicador && row.periodo)
}

function groupByIndicador(rawData: RawDataRow[]): DataItem[] {
  const grouped: Record<string, DataItem> = {}
  
  for (const row of rawData) {
    if (!grouped[row.indicador]) {
      grouped[row.indicador] = {
        indicador: row.indicador,
        descripcion: row.descripcion,
        valor_2022: 0,
        valor_2026: 0
      }
    }
    
    if (row.periodo === 2022) {
      grouped[row.indicador].valor_2022 = row.valor
      grouped[row.indicador].fuente_2022 = row.fuente
    } else if (row.periodo === 2026) {
      grouped[row.indicador].valor_2026 = row.valor
      grouped[row.indicador].fuente_2026 = row.fuente
    }
  }
  
  return Object.values(grouped)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<RawDataRow[]>([])
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(CSV_URL)
        if (!response.ok) throw new Error("Failed to fetch data")
        const text = await response.text()
        const parsed = parseCSV(text)
        setRawData(parsed)
        setData(groupByIndicador(parsed))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading data")
        // Fallback data if fetch fails
        const fallback = getFallbackData()
        setRawData(fallback.raw)
        setData(fallback.grouped)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getIndicador = (indicador: string) => {
    return data.find(d => 
      d.indicador.toLowerCase() === indicador.toLowerCase()
    )
  }

  const getIndicadores = (pattern: string) => {
    const regex = new RegExp(pattern, "i")
    return data.filter(d => regex.test(d.indicador))
  }

  const getValue = (indicador: string, periodo: 2022 | 2026): number => {
    const item = getIndicador(indicador)
    if (!item) return 0
    return periodo === 2022 ? item.valor_2022 : item.valor_2026
  }

  return (
    <DataContext.Provider value={{ data, rawData, loading, error, getIndicador, getIndicadores, getValue }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

// Fallback data - valores en dolares aproximados
function getFallbackData(): { raw: RawDataRow[], grouped: DataItem[] } {
  const raw: RawDataRow[] = [
    // PlayStation (en pesos argentinos)
    { indicador: "PLAY_STATION", descripcion: "PlayStation 5", periodo: 2022, valor: 299999, fuente: "" },
    { indicador: "PLAY_STATION", descripcion: "PlayStation 5", periodo: 2026, valor: 1499999, fuente: "" },
    
    // Salario minimo
    { indicador: "SALARIO_MINIMO", descripcion: "Salario minimo en pesos", periodo: 2022, valor: 57900, fuente: "" },
    { indicador: "SALARIO_MINIMO", descripcion: "Salario minimo en pesos", periodo: 2026, valor: 279718, fuente: "" },
    
    // Album
    { indicador: "ALBUM", descripcion: "Album Panini", periodo: 2022, valor: 750, fuente: "" },
    { indicador: "ALBUM", descripcion: "Album Panini", periodo: 2026, valor: 4500, fuente: "" },
    
    { indicador: "SOBRE_FIGURITAS", descripcion: "Sobre de figuritas", periodo: 2022, valor: 150, fuente: "" },
    { indicador: "SOBRE_FIGURITAS", descripcion: "Sobre de figuritas", periodo: 2026, valor: 800, fuente: "" },
    
    { indicador: "FIGURITAS_TOTAL", descripcion: "Total de figuritas", periodo: 2022, valor: 638, fuente: "" },
    { indicador: "FIGURITAS_TOTAL", descripcion: "Total de figuritas", periodo: 2026, valor: 670, fuente: "" },
    
    // Camiseta
    { indicador: "CAMISETA_OFICIAL", descripcion: "Camiseta oficial seleccion", periodo: 2022, valor: 22000, fuente: "" },
    { indicador: "CAMISETA_OFICIAL", descripcion: "Camiseta oficial seleccion", periodo: 2026, valor: 189999, fuente: "" },
    
    { indicador: "CAMISETA_TRUCHA", descripcion: "Camiseta trucha", periodo: 2022, valor: 2500, fuente: "" },
    { indicador: "CAMISETA_TRUCHA", descripcion: "Camiseta trucha", periodo: 2026, valor: 15000, fuente: "" },
    
    // Entradas
    { indicador: "ENTRADA_GRUPO", descripcion: "Entrada fase de grupos", periodo: 2022, valor: 220, fuente: "" },
    { indicador: "ENTRADA_GRUPO", descripcion: "Entrada fase de grupos", periodo: 2026, valor: 300, fuente: "" },
    
    { indicador: "ENTRADA_FINAL", descripcion: "Entrada final", periodo: 2022, valor: 1600, fuente: "" },
    { indicador: "ENTRADA_FINAL", descripcion: "Entrada final", periodo: 2026, valor: 2500, fuente: "" },
    
    // Viaje
    { indicador: "VUELO", descripcion: "Vuelo ida y vuelta", periodo: 2022, valor: 2800, fuente: "" },
    { indicador: "VUELO", descripcion: "Vuelo ida y vuelta", periodo: 2026, valor: 1800, fuente: "" },
    
    { indicador: "PAQUETE_BASICO", descripcion: "Paquete turistico basico", periodo: 2022, valor: 8500, fuente: "" },
    { indicador: "PAQUETE_BASICO", descripcion: "Paquete turistico basico", periodo: 2026, valor: 12000, fuente: "" },
    
    // Mate
    { indicador: "YERBA_KG", descripcion: "Yerba mate 1kg", periodo: 2022, valor: 650, fuente: "" },
    { indicador: "YERBA_KG", descripcion: "Yerba mate 1kg", periodo: 2026, valor: 4500, fuente: "" },
    
    // Asado
    { indicador: "ASADO_10P", descripcion: "Asado para 10 personas", periodo: 2022, valor: 12000, fuente: "" },
    { indicador: "ASADO_10P", descripcion: "Asado para 10 personas", periodo: 2026, valor: 85000, fuente: "" },
    
    // Fernet
    { indicador: "FERNET", descripcion: "Fernet Branca 750ml", periodo: 2022, valor: 1800, fuente: "" },
    { indicador: "FERNET", descripcion: "Fernet Branca 750ml", periodo: 2026, valor: 12500, fuente: "" },
    
    // Alquiler
    { indicador: "ALQUILER_MONOAMBIENTE", descripcion: "Alquiler monoambiente CABA", periodo: 2022, valor: 45000, fuente: "" },
    { indicador: "ALQUILER_MONOAMBIENTE", descripcion: "Alquiler monoambiente CABA", periodo: 2026, valor: 450000, fuente: "" },
    
    // Micro
    { indicador: "MICRO_BSAS_ROSARIO", descripcion: "Pasaje Buenos Aires - Rosario", periodo: 2022, valor: 3500, fuente: "" },
    { indicador: "MICRO_BSAS_ROSARIO", descripcion: "Pasaje Buenos Aires - Rosario", periodo: 2026, valor: 25000, fuente: "" },
    
    // Jubilacion
    { indicador: "JUBILACION_MINIMA", descripcion: "Jubilacion minima", periodo: 2022, valor: 37525, fuente: "" },
    { indicador: "JUBILACION_MINIMA", descripcion: "Jubilacion minima", periodo: 2026, valor: 234540, fuente: "" },
    
    // Dolar
    { indicador: "DOLAR_OFICIAL", descripcion: "Dolar oficial", periodo: 2022, valor: 177, fuente: "" },
    { indicador: "DOLAR_OFICIAL", descripcion: "Dolar oficial", periodo: 2026, valor: 1070, fuente: "" },
  ]
  
  return {
    raw,
    grouped: groupByIndicador(raw)
  }
}
