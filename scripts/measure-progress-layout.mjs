/**
 * Mide alturas de anclas de progreso (mobile + desktop) con Playwright.
 * Uso: npm run dev  →  node scripts/measure-progress-layout.mjs
 */
import { chromium, devices } from "playwright"

const BASE = process.env.MEASURE_URL ?? "http://localhost:3000"

async function measurePage(browser, label, viewport) {
  const context = await browser.newContext({ ...viewport, locale: "es-AR" })
  const page = await context.newPage()

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120_000 })

  // Cargar secciones lazy scrolleando
  for (let y = 0; y < 50_000; y += 600) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(800)

  // Desbloquear carta / festejo
  const drawBtn = page.getByRole("button", { name: /sacar una carta/i }).first()
  if (await drawBtn.isVisible().catch(() => false)) {
    await drawBtn.click()
    await page.waitForTimeout(3500)
  }

  for (let y = 0; y < 50_000; y += 600) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(1500)

  const anchors = await page.evaluate(() => {
    const scrollY = window.scrollY
    return Array.from(document.querySelectorAll("[data-progress-anchor]")).map((el, i) => {
      const rect = el.getBoundingClientRect()
      const block = el.closest("section[id]")
      return {
        index: i,
        blockId: block?.id ?? "unknown",
        top: Math.round(scrollY + rect.top),
        height: Math.round(rect.height),
      }
    })
  })

  const prefix = await page.evaluate(() => {
    const first = document.querySelector("[data-progress-anchor]")
    if (!first) return 0
    const scrollY = window.scrollY
    return Math.round(scrollY + first.getBoundingClientRect().top)
  })

  const totalScroll = await page.evaluate(() => document.documentElement.scrollHeight)

  await context.close()
  return { label, viewport: viewport.viewport, anchors, prefix, totalScroll }
}

const browser = await chromium.launch({ headless: true })

const mobile = await measurePage(browser, "mobile", devices["iPhone 13"])
const desktop = await measurePage(browser, "desktop", {
  viewport: { width: 1280, height: 800 },
  userAgent: devices["Desktop Chrome"].userAgent,
})

await browser.close()

console.log(JSON.stringify({ mobile, desktop }, null, 2))
