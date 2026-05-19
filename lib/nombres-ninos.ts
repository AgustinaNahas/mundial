/** Nacimientos totales por año (fila TOTAL del padrón de nombres). */
export const NACIMIENTOS_TOTAL = {
  2022: 837_541,
  2023: 772_445,
} as const

export interface NombreNinoRow {
  nombre: string
  count2022: number
  count2023: number
}

/** Fuente: padrón de nombres publicado en Google Sheets (ver sync script). */
export const NOMBRES_NINOS: NombreNinoRow[] = [
  { nombre: "ALEXIS", count2022: 1153, count2023: 1192 },
  { nombre: "ANGEL", count2022: 2231, count2023: 2127 },
  { nombre: "EMILIANO", count2022: 1952, count2023: 3254 },
  { nombre: "ENZO", count2022: 3330, count2023: 6579 },
  { nombre: "JULIAN", count2022: 3525, count2023: 7294 },
  { nombre: "LIONEL", count2022: 4863, count2023: 9505 },
  { nombre: "RODRIGO", count2022: 861, count2023: 748 },
]

export const NOMBRES_NINOS_FUENTE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pub?gid=268353573&single=true&output=csv"

/** Cada bebé del slider representa 1 niño cada 1.000 nacidos. */
export const BEBES_POR_MIL_MAX = 12

export function perMilNacimientos(count: number, year: keyof typeof NACIMIENTOS_TOTAL): number {
  return (count / NACIMIENTOS_TOTAL[year]) * 1000
}

export function formatPerMil(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}
