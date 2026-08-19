export interface ClassCounterItem {
  id: string
  student_id?: string | null
  date: string
  start_time: string
  status?: string | null
  is_recovery?: boolean | null
  original_class_date?: string | null
  is_recovery_pending?: boolean | null
  [key: string]: any
}

export interface EnrichedClassItem<T extends ClassCounterItem = ClassCounterItem> {
  item: T
  classIndex: number
  totalClasses: number
  counterLabel: string
  isRecovery: boolean
  recoveryLabel?: string
}

/**
 * Normaliza y formatea la fecha original a un formato legible en español (ej: "15/08/2026")
 */
export function formatSpanishShortDate(dateStr: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

/**
 * Calcula los contadores Clase X/Z agrupando por alumno y por mes (YYYY-MM).
 * Asigna ordinales cronológicos a las clases no canceladas.
 */
export function calculateClassCounters<T extends ClassCounterItem>(
  classes: T[],
  defaultPackSize = 4
): Map<string, EnrichedClassItem<T>> {
  const resultMap = new Map<string, EnrichedClassItem<T>>()

  // 1. Agrupar clases válidas (no CANCELLED) por student_id y por mes (YYYY-MM)
  const groups = new Map<string, T[]>()

  for (const c of classes) {
    if (c.status === "CANCELLED") continue

    const studentKey = c.student_id || "unassigned"
    const monthKey = c.date ? c.date.slice(0, 7) : "no-date"
    const groupKey = `${studentKey}_${monthKey}`

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(c)
  }

  // 2. Para cada grupo, ordenar cronológicamente y asignar índices
  groups.forEach((groupClasses) => {
    // Ordenar por fecha y start_time
    groupClasses.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || "").localeCompare(b.start_time || "")
    })

    const totalClasses = Math.max(groupClasses.length, defaultPackSize)

    groupClasses.forEach((c, index) => {
      const classIndex = index + 1
      const isRecovery = Boolean(c.is_recovery || (c.original_class_date && c.original_class_date !== ""))
      
      let recoveryLabel: string | undefined = undefined
      if (isRecovery && c.original_class_date) {
        recoveryLabel = `Recuperación del día ${formatSpanishShortDate(c.original_class_date)}`
      } else if (c.is_recovery_pending) {
        recoveryLabel = "Pendiente por recuperar"
      }

      resultMap.set(c.id, {
        item: c,
        classIndex,
        totalClasses,
        counterLabel: `Clase ${classIndex}/${totalClasses}`,
        isRecovery,
        recoveryLabel,
      })
    })
  })

  // 3. Fallback para clases canceladas o no listadas en grupos
  for (const c of classes) {
    if (!resultMap.has(c.id)) {
      const isRecovery = Boolean(c.is_recovery || (c.original_class_date && c.original_class_date !== ""))
      let recoveryLabel: string | undefined = undefined
      if (isRecovery && c.original_class_date) {
        recoveryLabel = `Recuperación del día ${formatSpanishShortDate(c.original_class_date)}`
      } else if (c.is_recovery_pending) {
        recoveryLabel = "Pendiente por recuperar"
      }

      resultMap.set(c.id, {
        item: c,
        classIndex: 0,
        totalClasses: defaultPackSize,
        counterLabel: c.status === "CANCELLED" ? "Cancelada" : `Clase -/${defaultPackSize}`,
        isRecovery,
        recoveryLabel,
      })
    }
  }

  return resultMap
}
