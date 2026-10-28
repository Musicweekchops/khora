export interface ClassCounterItem {
  id: string
  student_id?: string | null
  date: string
  start_time: string
  end_time?: string | null
  duration?: number | null
  status?: string | null
  is_recovery?: boolean | null
  original_class_date?: string | null
  is_recovery_pending?: boolean | null
  is_special?: boolean | null
  special_note?: string | null
  [key: string]: any
}

export interface EnrichedClassItem<T extends ClassCounterItem = ClassCounterItem> {
  item: T
  classIndex: number
  totalClasses: number
  counterLabel: string
  isRecovery: boolean
  recoveryLabel?: string
  isSpecial?: boolean
  specialLabel?: string
  durationMinutes: number
  units: number
}

/**
 * Normaliza y formatea la fecha original a un formato legible en español (ej: "15/08/2026")
 */
export function formatSpanishShortDate(dateStr?: string | null): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

/**
 * Obtiene la duración en minutos de una clase calculándola de start_time y end_time,
 * o usando la columna duration como respaldo.
 */
export function getClassDurationMinutes(c: {
  start_time?: string | null
  end_time?: string | null
  duration?: number | null
}): number {
  if (c.start_time && c.end_time) {
    const [sh, sm] = c.start_time.split(":").map(Number)
    const [eh, em] = c.end_time.split(":").map(Number)
    if (!isNaN(sh) && !isNaN(eh)) {
      const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0))
      if (diff > 0) return diff
    }
  }
  if (c.duration && c.duration > 0) return c.duration
  return 60
}

/**
 * Determina cuántas unidades de clase representa una sesión:
 * - Sesión normal ~60 min: 1 unidad
 * - Sesión doble ~120 min regular: 2 unidades (cada hora cuenta como 1 clase)
 * - Sesión doble de recuperación: 1 unidad para el mes actual + salda la recuperación
 * - Sesión especial: 1 sesión especial (o según se anote)
 */
export function getClassUnits(c: ClassCounterItem): number {
  if (c.status === "CANCELLED") return 0
  
  // Si está marcada explícitamente como clase especial
  if (c.is_special) {
    return 1
  }

  const duration = getClassDurationMinutes(c)

  // Si dura alrededor de 2 horas (90 min o más)
  if (duration >= 90) {
    // Si es una clase doble que recupera otra clase (1h regular + 1h recuperación),
    // para el conteo de la cuota mensual del mes actual computa 1 unidad regular.
    if (c.is_recovery || Boolean(c.original_class_date)) {
      return 1
    }
    // Si es una clase doble normal, cada hora cuenta como una clase
    return Math.round(duration / 60) || 2
  }

  return 1
}

/**
 * Calcula los contadores de clases agrupando por alumno y por mes (YYYY-MM).
 * Asigna ordinales cronológicos y soporte fluido para clases dobles y especiales.
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

  // 2. Para cada grupo, ordenar cronológicamente y asignar índices por unidades
  groups.forEach((groupClasses) => {
    // Ordenar por fecha y start_time
    groupClasses.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || "").localeCompare(b.start_time || "")
    })

    // Calcular el total de unidades del grupo (clases de 2h suman 2 unidades a menos que sean especiales)
    const totalUnits = groupClasses.reduce((acc, c) => acc + getClassUnits(c), 0)
    const totalClasses = Math.max(totalUnits, defaultPackSize)

    let currentUnitCounter = 0

    groupClasses.forEach((c) => {
      const durationMinutes = getClassDurationMinutes(c)
      const units = getClassUnits(c)
      const isRecovery = Boolean(c.is_recovery || (c.original_class_date && c.original_class_date !== ""))
      const isSpecial = Boolean(c.is_special)

      let recoveryLabel: string | undefined = undefined
      if (isRecovery && c.original_class_date) {
        recoveryLabel = durationMinutes >= 90
          ? `Incluye recuperación del día ${formatSpanishShortDate(c.original_class_date)}`
          : `Recuperación del día ${formatSpanishShortDate(c.original_class_date)}`
      } else if (c.is_recovery_pending) {
        recoveryLabel = "Pendiente por recuperar"
      }

      let specialLabel: string | undefined = undefined
      if (isSpecial) {
        specialLabel = c.special_note || "Clase Especial"
      }

      let counterLabel = ""
      let classIndex = 0

      if (isSpecial) {
        // Formato para clase especial
        const hoursText = durationMinutes >= 90 ? ` (${Math.round(durationMinutes / 60)} hrs)` : ""
        counterLabel = c.special_note
          ? `⭐ Especial: ${c.special_note}`
          : `⭐ Clase Especial${hoursText}`
        classIndex = currentUnitCounter + 1
      } else if (units > 1) {
        // Clase doble o múltiple regular (ej. 2 horas = 2 clases: Clase 1-2/4)
        const startIdx = currentUnitCounter + 1
        const endIdx = currentUnitCounter + units
        counterLabel = `Clase ${startIdx}-${endIdx}/${totalClasses}`
        classIndex = endIdx
        currentUnitCounter = endIdx
      } else {
        // Clase simple regular de 1 unidad
        const idx = currentUnitCounter + 1
        counterLabel = `Clase ${idx}/${totalClasses}`
        classIndex = idx
        currentUnitCounter = idx
      }

      resultMap.set(c.id, {
        item: c,
        classIndex,
        totalClasses,
        counterLabel,
        isRecovery,
        recoveryLabel,
        isSpecial,
        specialLabel,
        durationMinutes,
        units,
      })
    })
  })

  // 3. Fallback para clases canceladas o no agrupadas
  for (const c of classes) {
    if (!resultMap.has(c.id)) {
      const durationMinutes = getClassDurationMinutes(c)
      const isRecovery = Boolean(c.is_recovery || (c.original_class_date && c.original_class_date !== ""))
      const isSpecial = Boolean(c.is_special)

      let recoveryLabel: string | undefined = undefined
      if (isRecovery && c.original_class_date) {
        recoveryLabel = `Recuperación del día ${formatSpanishShortDate(c.original_class_date)}`
      } else if (c.is_recovery_pending) {
        recoveryLabel = "Pendiente por recuperar"
      }

      const counterLabel = c.status === "CANCELLED"
        ? "Cancelada"
        : isSpecial
        ? "⭐ Clase Especial"
        : `Clase -/${defaultPackSize}`

      resultMap.set(c.id, {
        item: c,
        classIndex: 0,
        totalClasses: defaultPackSize,
        counterLabel,
        isRecovery,
        recoveryLabel,
        isSpecial,
        specialLabel: c.special_note || (isSpecial ? "Clase Especial" : undefined),
        durationMinutes,
        units: 0,
      })
    }
  }

  return resultMap
}
