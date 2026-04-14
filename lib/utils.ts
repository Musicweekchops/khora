import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility para combinar classNames de Tailwind sin conflictos
 * Usa clsx para condicionales y twMerge para resolver conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea números como moneda chilena
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea fechas en formato chileno
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'short') {
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formatea tiempo en formato HH:MM
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return d.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Calcula tiempo relativo (hace 5 minutos, en 2 horas, etc.)
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 0) {
    const absMins = Math.abs(diffMins)
    if (absMins < 60) return `hace ${absMins} min`
    if (absMins < 1440) return `hace ${Math.floor(absMins / 60)}h`
    return `hace ${Math.floor(absMins / 1440)} días`
  }
  
  if (diffMins === 0) return 'ahora'
  if (diffMins < 60) return `en ${diffMins} min`
  if (diffMins < 1440) return `en ${Math.floor(diffMins / 60)}h`
  return `en ${Math.floor(diffMins / 1440)} días`
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Capitaliza primera letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
