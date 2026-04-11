import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, unit?: string) {
  const isUSD = unit?.trim().toUpperCase() === "USD"
  return value.toLocaleString("es-AR", { 
    style: "currency", 
    currency: isUSD ? "USD" : "ARS", 
    maximumFractionDigits: 0 
  })
}
