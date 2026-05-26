import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { DM_Sans, Barlow_Condensed } from "next/font/google"
import Script from "next/script"
import { AppProviders } from "@/components/app-providers"
import { fontHand } from "@/lib/fonts"
import {
  getMetadataBase,
  OG_IMAGES,
  SITE_DESCRIPTION,
  SITE_OG_HEADLINE,
  SITE_TITLE,
} from "@/lib/site-metadata"
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
  metadataBase: getMetadataBase(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "es_AR",
    siteName: "¿Cuánto cuesta alentar al equipo campeón del mundo?",
    images: [
      { ...OG_IMAGES.wide, alt: SITE_OG_HEADLINE },
      { ...OG_IMAGES.tall, alt: SITE_OG_HEADLINE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGES.wide.url],
  },
  icons: {
    icon: [{ url: "./favicon.png", type: "image/png", sizes: "320x320" }],
    apple: "./favicon.png",
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
