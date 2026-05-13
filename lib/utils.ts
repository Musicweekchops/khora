import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export function toDateStr(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Converts a timestamp to "Hace X minutos / horas / días" or "En línea" */
export function formatLastSeen(lastSeenAt: string | null | undefined): { label: string; isOnline: boolean } {
  if (!lastSeenAt) return { label: 'Nunca conectado', isOnline: false }
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 5) return { label: 'En línea', isOnline: true }
  if (minutes < 60) return { label: `Hace ${minutes} min`, isOnline: false }
  if (hours < 24) return { label: `Hace ${hours}h`, isOnline: false }
  if (days === 1) return { label: 'Ayer', isOnline: false }
  if (days < 30) return { label: `Hace ${days} días`, isOnline: false }
  return { label: new Date(lastSeenAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }), isOnline: false }
}
