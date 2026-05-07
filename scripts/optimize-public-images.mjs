/**
 * Redimensiona WebP en public/ según uso real en la UI (más ~2× para retina).
 * Ejecutar tras cambiar assets: `npm run optimize-images`
 */
import path from "node:path"
import fs from "node:fs/promises"
import sharp from "sharp"

const root = process.cwd()

/** @typedef {{ rel: string, width?: number, height?: number, quality?: number }} Job */

/** @type {Job[]} */
const jobs = [
  // Section: pelota / camiseta → contenedor ~160 CSS px (`w-40`)
  { rel: "pelota2022.webp", width: 384, height: 384 },
  { rel: "pelota2026.webp", width: 384, height: 384 },
  { rel: "camiseta2022.webp", width: 384, height: 384 },
  { rel: "camiseta2026.webp", width: 384, height: 384 },
  // Pictograma: celdas `size-10` (~40 px)
  { rel: "viajero.webp", width: 96, height: 96 },
]

/** Slots ~110 px ancho desktop; cursores 80 px; retina ~2× */
const albumDims = { width: 280, height: 364 }

async function processFile(rel, opts) {
  const fullPath = path.join(root, "public", rel)
  let input
  try {
    input = await fs.readFile(fullPath)
  } catch {
    console.warn(`saltando (no existe): ${rel}`)
    return
  }
  const meta = await sharp(input).metadata()
  const before = input.length

  let pipeline = sharp(input)
  if (opts.width ?? opts.height) {
    pipeline = pipeline.resize({
      width: opts.width,
      height: opts.height,
      fit: "inside",
      withoutEnlargement: true,
    })
  }

  const out = await pipeline
    .webp({ quality: opts.quality ?? 82, alphaQuality: 85, effort: 5 })
    .toBuffer()

  await fs.writeFile(fullPath, out)
  const after = out.length
  const pct = before ? Math.round((1 - after / before) * 100) : 0
  console.log(`${rel}: ${meta.width}×${meta.height} → ${before} → ${after} bytes (${pct}% menos)`)
}

async function albumDir() {
  const dir = path.join(root, "public/album")
  let names
  try {
    names = await fs.readdir(dir)
  } catch {
    return
  }
  const webps = names.filter((n) => n.endsWith(".webp"))
  for (const name of webps) {
    await processFile(`album/${name}`, { ...albumDims, quality: 84 })
  }
}

async function main() {
  for (const { rel, width, height, quality } of jobs) {
    await processFile(rel, { width, height, quality })
  }
  await albumDir()
  console.log("listo.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
