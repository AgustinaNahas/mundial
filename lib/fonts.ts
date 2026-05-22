import { Nothing_You_Could_Do } from "next/font/google"

/** Manuscrita del hero — usar `.className` en el nodo, no solo `font-hand`. */
export const fontHand = Nothing_You_Could_Do({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-hand-script",
})
