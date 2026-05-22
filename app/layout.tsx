import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { DM_Sans, Barlow_Condensed } from "next/font/google"
import Script from "next/script"
import { fontHand } from "@/lib/fonts"
import { AppProviders } from "@/components/app-providers"
import "./globals.css"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-barlow" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /** Safari iOS: la UI del navegador superpone el contenido sin reservar hueco al ocultarse. */
  interactiveWidget: "overlays-content",
}

export const metadata: Metadata = {
  title: '¿Cuánto cuesta ser campeón del mundo? | Argentina Qatar 2022 vs EEUU 2026',
  description: 'Visualización de datos: El costo económico de vivir un Mundial como argentino, comparando Qatar 2022 y EEUU 2026',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="es" className={`${dmSans.variable} ${barlowCondensed.variable} ${fontHand.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {gaId ? (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { send_page_view: true });
                `,
              }}
            />
          </>
        ) : null}
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
