/**
 * Descarga el CSV de Google Sheets y escribe public/data.json (opcional).
 * La app consume el CSV en vivo; este script sirve solo como respaldo estático.
 *
 * Uso: node scripts/sync-data.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "../public/data.json")

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzYyEETGt1UHh8grdJj-q4dO63InOpLTQ-La74Jx-AT9QTdS3qlxNECjcpD7DW_d_2M3JA_mN1Jz_S/pub?gid=0&single=true&output=csv"

function parseArgentineNumber(value) {
  if (!value) return 0
  let cleaned = value.replace(/[$\s]/g, "").trim()
  cleaned = cleaned.replace(/\./g, "")
  cleaned = cleaned.replace(",", ".")
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? 0 : num
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []

  return lines.slice(1).map((line) => {
    const values = []
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
      periodo: parseInt(values[2], 10) || 0,
      valor: parseArgentineNumber(values[3] || "0"),
      unidad: values[4] || "",
      fuente: values[6] || "",
      fuente_corta: values[7] || "",
      fecha_fuente: values[8] || "",
    }
  }).filter((row) => row.indicador && row.periodo)
}

async function main() {
  console.log("Fetching", CSV_URL)
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  const raw = parseCSV(text)
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify({ raw, updatedAt: new Date().toISOString() }, null, 2))
  console.log(`Wrote ${raw.length} rows → ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
