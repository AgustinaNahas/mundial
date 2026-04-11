"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pub?gid=0&single=true&output=csv"

export interface FuenteInfo {
  url: string
  corta: string
  fecha: string
}

export interface RawDataRow {
  indicador: string
  descripcion: string
  periodo: number
  valor: number
  unidad: string
  fuente: string
  fuente_corta: string
  fecha_fuente: string
}

export interface DataItem {
  indicador: string
  descripcion: string
  unidad: string
  valor_2022: number
  valor_2026: number
  fuente_2022?: FuenteInfo
  fuente_2026?: FuenteInfo
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
  let cleaned = value.replace(/[$\s]/g, "").trim()
  cleaned = cleaned.replace(/\./g, "")
  cleaned = cleaned.replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseCSV(csv: string): RawDataRow[] {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []
  
  return lines.slice(1).map(line => {
    const values: string[] = []
    let current = ""
    let inQuotes = false
    
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
      unidad: values[4] || "",
      fuente: values[6] || "",
      fuente_corta: values[7] || "",
      fecha_fuente: values[8] || ""
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
        unidad: row.unidad,
        valor_2022: 0,
        valor_2026: 0
      }
    }
    
    const fuente = row.fuente ? { url: row.fuente, corta: row.fuente_corta || "Fuente", fecha: row.fecha_fuente || "" } : undefined

    if (row.periodo === 2022) {
      grouped[row.indicador].valor_2022 = row.valor
      if (fuente) grouped[row.indicador].fuente_2022 = fuente
    } else if (row.periodo === 2026) {
      grouped[row.indicador].valor_2026 = row.valor
      if (fuente) grouped[row.indicador].fuente_2026 = fuente
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
    const key = indicador.trim().toLowerCase()
    return data.find(d => d.indicador.toLowerCase() === key)
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

// Fallback data
function getFallbackData(): { raw: RawDataRow[], grouped: DataItem[] } {
  const raw: RawDataRow[] = [
    { indicador: "PLAY_STATION", descripcion: "PlayStation 5", periodo: 2022, valor: 299999, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "PLAY_STATION", descripcion: "PlayStation 5", periodo: 2026, valor: 1499999, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "FIFA", descripcion: "Juego FIFA", periodo: 2022, valor: 5500, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "FIFA", descripcion: "Juego FIFA", periodo: 2026, valor: 68490, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "CAMISETA_ADIDAS", descripcion: "Camiseta oficial", periodo: 2022, valor: 16999, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "CAMISETA_ADIDAS", descripcion: "Camiseta oficial", periodo: 2026, valor: 129999, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "PRECIO_SOBRE_FIGURITAS", descripcion: "Precio sobre figuritas", periodo: 2022, valor: 150, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "PRECIO_SOBRE_FIGURITAS", descripcion: "Precio sobre figuritas", periodo: 2026, valor: 2500, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "PRECIO_ALBUM_FIGURITAS", descripcion: "Precio album figuritas", periodo: 2022, valor: 750, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "PRECIO_ALBUM_FIGURITAS", descripcion: "Precio album figuritas", periodo: 2026, valor: 0, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "CANT_FIGURITAS", descripcion: "Cantidad de figuritas", periodo: 2022, valor: 670, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "CANT_FIGURITAS", descripcion: "Cantidad de figuritas", periodo: 2026, valor: 1000, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ENTRADA_PRIMERA", descripcion: "Entrada partido de primera", periodo: 2022, valor: 1360, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ENTRADA_PRIMERA", descripcion: "Entrada partido de primera", periodo: 2026, valor: 30000, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "BSAS_DOHA", descripcion: "Vuelo Buenos Aires - Doha", periodo: 2022, valor: 374124, unidad: "USD", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "BSAS_MIAMI", descripcion: "Vuelo Buenos Aires - Miami", periodo: 2026, valor: 2860000, unidad: "USD", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "KILO_YERBA", descripcion: "Kilo de yerba", periodo: 2022, valor: 870, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "KILO_YERBA", descripcion: "Kilo de yerba", periodo: 2026, valor: 4655, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ASADO_FINAL", descripcion: "Asado final", periodo: 2022, valor: 1220, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ASADO_FINAL", descripcion: "Asado final", periodo: 2026, valor: 16019, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "FERNET_COCA", descripcion: "Fernet con coca", periodo: 2022, valor: 1000, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "FERNET_COCA", descripcion: "Fernet con coca", periodo: 2026, valor: 14200, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ALQUILER_FESTEJO", descripcion: "Alquiler", periodo: 2022, valor: 60000, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "ALQUILER_FESTEJO", descripcion: "Alquiler", periodo: 2026, valor: 429953, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "BOLETO_AMBA", descripcion: "Boleto AMBA", periodo: 2022, valor: 25.2, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "BOLETO_AMBA", descripcion: "Boleto AMBA", periodo: 2026, valor: 681, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "SUELDO_MIN_PESOS", descripcion: "Sueldo minimo", periodo: 2022, valor: 61953, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "SUELDO_MIN_PESOS", descripcion: "Sueldo minimo", periodo: 2026, valor: 346800, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "JUBILACION_MIN_DOLARES", descripcion: "Jubilacion minima", periodo: 2022, valor: 50124, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "JUBILACION_MIN_DOLARES", descripcion: "Jubilacion minima", periodo: 2026, valor: 359254, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "VALOR_DOLAR_PESO", descripcion: "Valor dolar peso", periodo: 2022, valor: 266.43, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
    { indicador: "VALOR_DOLAR_PESO", descripcion: "Valor dolar peso", periodo: 2026, valor: 1430, unidad: "ARS", fuente: "", fuente_corta: "", fecha_fuente: "" },
  ]
  
  return {
    raw,
    grouped: groupByIndicador(raw)
  }
}
