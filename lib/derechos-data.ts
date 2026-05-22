export const DERECHOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pub?gid=659346857&single=true&output=csv"

export type DerechosYear = 2022 | 2024
export type DerechosCountryKey = "argentina" | "qatar" | "eeuu" | "canada" | "mexico"

export const DERECHOS_INDICATORS = [
  {
    key: "rsf_pfi",
    label: "Libertad de prensa",
    labelLines: ["Libertad de prensa"],
    title: "Libertad de prensa",
    description:
      "Mide el nivel de libertad de prensa y periodismo: independencia de los medios, censura, presiones políticas y seguridad de los periodistas.",
    fuente: "Reporters Without Borders (RSF)",
  },
  {
    key: "vdem_gender",
    label: "Empoderamiento político femenino",
    labelLines: ["Empoderamiento", "político femenino"],
    title: "Empoderamiento político femenino",
    description:
      "Mide la participación y el poder político de las mujeres: representación, acceso a cargos públicos e igualdad en la participación política.",
    fuente: "Varieties of Democracy Institute (V-Dem)",
  },
  {
    key: "vdem_polyarchy",
    label: "Democracia electoral",
    labelLines: ["Democracia electoral"],
    title: "Democracia electoral",
    description:
      "Mide la democracia electoral: elecciones libres y justas, libertad de expresión y asociación, derecho al voto y competencia política.",
    fuente: "Varieties of Democracy Institute (V-Dem)",
  },
  {
    key: "vdem_egal",
    label: "Igualdad e inclusión",
    labelLines: ["Igualdad e", "inclusión"],
    title: "Igualdad e inclusión",
    description:
      "Mide qué tan distribuido está el acceso efectivo a derechos, recursos y oportunidades: igualdad ante la ley, educación, salud e inclusión social.",
    fuente: "Varieties of Democracy Institute (V-Dem)",
  },
  {
    key: "wbgi_cce",
    label: "Control de corrupción",
    labelLines: ["Control de", "corrupción"],
    title: "Control de corrupción",
    description:
      "Mide en qué medida el poder público se usa para beneficio privado: corrupción estatal, sobornos y captura del Estado.",
    fuente: "World Bank – Worldwide Governance Indicators",
  },
  {
    key: "wbgi_rle",
    label: "Estado de derecho",
    labelLines: ["Estado de derecho"],
    title: "Estado de derecho",
    description:
      "Mide la confianza en las instituciones y el cumplimiento de las leyes: independencia judicial, contratos, derechos y seguridad pública.",
    fuente: "World Bank – Worldwide Governance Indicators",
  },
] as const

export type DerechosIndicatorKey = (typeof DERECHOS_INDICATORS)[number]["key"]

export type DerechosIndicatorMeta = (typeof DERECHOS_INDICATORS)[number]

const INDICATOR_BY_KEY = Object.fromEntries(
  DERECHOS_INDICATORS.map((ind) => [ind.key, ind]),
) as Record<DerechosIndicatorKey, DerechosIndicatorMeta>

export function getDerechosIndicator(key: DerechosIndicatorKey): DerechosIndicatorMeta {
  return INDICATOR_BY_KEY[key]
}

const PAIS_TO_KEY: Record<string, DerechosCountryKey> = {
  ARG: "argentina",
  QAT: "qatar",
  USA: "eeuu",
  CAN: "canada",
  MEX: "mexico",
}

/** WGI rango aproximado [-2.5, 2.5] → 0–100 (100 = mejor). */
const WGI_MIN = -2.5
const WGI_MAX = 2.5

export interface DerechosRawRow {
  pais: string
  year: number
  rsf_pfi: number
  vdem_gender: number
  vdem_polyarchy: number
  wbgi_cce: number
  wbgi_rle: number
  vdem_egal: number
}

export interface RadarDataPoint {
  key: DerechosIndicatorKey
  category: string
  argentina: number
  qatar: number
  eeuu: number
  canada: number
  mexico: number
}

function parseDecimal(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, "").trim()
  if (!cleaned) return 0
  const n = parseFloat(cleaned.replace(",", "."))
  return Number.isNaN(n) ? 0 : n
}

function clamp0to100(n: number): number {
  return Math.min(100, Math.max(0, n))
}

function normalizeIndicator(key: DerechosIndicatorKey, raw: number): number {
  switch (key) {
    case "rsf_pfi":
      // RSF 0–100: valores más altos = más libertad de prensa.
      return clamp0to100(raw)
    case "vdem_gender":
    case "vdem_polyarchy":
    case "vdem_egal":
      // V-Dem 0–1: valores más altos = mejor.
      return clamp0to100(raw * 100)
    case "wbgi_cce":
    case "wbgi_rle":
      // WGI ~[-2.5, 2.5]: valores más altos = mejor.
      return clamp0to100(((raw - WGI_MIN) / (WGI_MAX - WGI_MIN)) * 100)
    default:
      return 0
  }
}

function parseCsvLine(line: string): string[] {
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
  return values
}

export function parseDerechosCsv(csv: string): DerechosRawRow[] {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []

  return lines.slice(1).map((line) => {
    const v = parseCsvLine(line)
    return {
      pais: v[0] || "",
      year: parseInt(v[1], 10) || 0,
      rsf_pfi: parseDecimal(v[2] || "0"),
      vdem_gender: parseDecimal(v[3] || "0"),
      vdem_polyarchy: parseDecimal(v[4] || "0"),
      wbgi_cce: parseDecimal(v[5] || "0"),
      wbgi_rle: parseDecimal(v[6] || "0"),
      vdem_egal: parseDecimal(v[7] || "0"),
    }
  })
}

export function buildRadarData(rows: DerechosRawRow[], year: DerechosYear): RadarDataPoint[] {
  const yearRows = rows.filter((r) => r.year === year)
  const byCountry: Partial<Record<DerechosCountryKey, DerechosRawRow>> = {}

  for (const row of yearRows) {
    const key = PAIS_TO_KEY[row.pais]
    if (key) byCountry[key] = row
  }

  return DERECHOS_INDICATORS.map(({ key, label }) => {
    const point: RadarDataPoint = {
      key,
      category: label,
      argentina: 0,
      qatar: 0,
      eeuu: 0,
      canada: 0,
      mexico: 0,
    }

    for (const countryKey of Object.keys(byCountry) as DerechosCountryKey[]) {
      const row = byCountry[countryKey]
      if (!row) continue
      point[countryKey] = Math.round(normalizeIndicator(key, row[key]))
    }

    return point
  })
}

export async function fetchDerechosData(): Promise<DerechosRawRow[]> {
  const res = await fetch(DERECHOS_CSV_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return parseDerechosCsv(text)
}
