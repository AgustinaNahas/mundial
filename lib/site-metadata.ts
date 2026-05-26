/** Título completo para `<title>` y redes. */
export const SITE_TITLE =
  "¿Cuánto cuesta ser campeón del mundo? | Argentina Qatar 2022 vs EEUU 2026"

/** Descripción para meta, Open Graph y Twitter. */
export const SITE_DESCRIPTION =
  "Visualización de datos: el costo económico de vivir un Mundial como argentino, comparando Qatar 2022 y EEUU 2026."

/** Título corto para la tarjeta OG (sin sufijo de comparación). */
export const SITE_OG_HEADLINE = "¿Cuánto cuesta ser campeón del mundo?"

/**
 * Capturas del sitio para redes sociales.
 * - wide (~1.87:1): Open Graph, Twitter/X summary_large_image, WhatsApp
 * - tall (~1.36:1): plataformas que prefieren menos panorámico
 */
export const OG_IMAGES = {
  wide: { url: "/og-wide.png", width: 1447, height: 775 },
  tall: { url: "/og-tall.png", width: 1213, height: 894 },
} as const

export function getMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) {
    return new URL(explicit.endsWith("/") ? explicit : `${explicit}/`)
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}/`)
  }
  return new URL("http://localhost:3000/")
}
