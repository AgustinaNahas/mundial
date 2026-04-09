import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { DM_Sans, Barlow_Condensed } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-barlow" })

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
  return (
    <html lang="es" className={`${dmSans.variable} ${barlowCondensed.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
