import {
  getMonthNameEs,
  getMonthYearLabelEs,
  getSantiagoTodayStr,
  RecoveryOriginType,
} from "./billingRules"

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
  recovery_origin_type?: RecoveryOriginType | string | null
  recovery_expires_at?: string | null
  recovery_reason?: string | null
  is_special?: boolean | null
  special_note?: string | null
  [key: string]: any
}

export interface EnrichedClassItem<T extends ClassCounterItem = ClassCounterItem> {
  item: T
  classIndex: number
  totalClasses: number
  monthName: string
  counterLabel: string
  isRecovery: boolean
  recoveryLabel?: string
  isSpecial?: boolean
  specialLabel?: string
  durationMinutes: number
  units: number
}

export interface PendingRecoveryItem<T extends ClassCounterItem = ClassCounterItem> {
  item: T
  originDate: string
  originMonthKey: string
  originMonthName: string
  originType: RecoveryOriginType
  reasonLabel: string
  expiresAt: string | null
  isExpired: boolean
}

export interface StudentMonthSessionsSummary<T extends ClassCounterItem = ClassCounterItem> {
  monthKey: string
  monthName: string
  monthYearLabel: string
  completedCount: number
  upcomingCount: number
  totalSessions: number
  sessions: EnrichedClassItem<T>[]
  pendingRecoveries: PendingRecoveryItem<T>[]
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
      const diff = eh * 60 + (em || 0) - (sh * 60 + (sm || 0))
      if (diff > 0) return diff
    }
  }
  if (c.duration && c.duration > 0) return c.duration
  return 60
}

/**
 * Determina si una clase cuenta como sesión activa del mes calendario.
 * - Las clases CANCELLED o pendientes por recuperar (is_recovery_pending) NO cuentan como sesión realizada/por venir.
 * - Las faltas sin aviso (NO_SHOW) SÍ se dan por realizadas y cuentan en el mes.
 */
export function isCountableMonthSession(c: ClassCounterItem): boolean {
  if (c.recovery_origin_type === "NO_SHOW") {
    return true
  }
  if (c.status === "CANCELLED" || c.status === "CANCELLED_BY_STUDENT") {
    return false
  }
  if (c.is_recovery_pending) {
    return false
  }
  return true
}

/**
 * Determina cuántas unidades representa una sesión (compatibilidad con reportes de horas).
 */
export function getClassUnits(c: ClassCounterItem): number {
  if (!isCountableMonthSession(c)) return 0
  if (c.is_special) return 1

  const duration = getClassDurationMinutes(c)
  const isRec = Boolean(c.is_recovery || (c.original_class_date && c.original_class_date !== ""))

  // Si es una sesión de 60m exclusiva de recuperación, no suma unidad regular al mes
  if (isRec && duration < 90) {
    return 0
  }

  if (duration >= 90) {
    if (isRec) return 1
    return Math.round(duration / 60) || 2
  }

  return 1
}

/**
 * Calcula las etiquetas de sesión agrupando por alumno y por mes calendario (YYYY-MM).
 * Principio: Cada sesión pertenece a su mes por su fecha ("Sesión X · [Mes]"), sin ningún tope "/4".
 */
export function calculateClassCounters<T extends ClassCounterItem>(
  classes: T[]
): Map<string, EnrichedClassItem<T>> {
  const resultMap = new Map<string, EnrichedClassItem<T>>()

  // 1. Agrupar clases activas del mes por student_id y por mes (YYYY-MM)
  const groups = new Map<string, T[]>()

  for (const c of classes) {
    if (!isCountableMonthSession(c)) continue

    const studentKey = c.student_id || "unassigned"
    const monthKey = c.date ? c.date.slice(0, 7) : "no-date"
    const groupKey = `${studentKey}_${monthKey}`

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(c)
  }

  // 2. Para cada mes calendario del alumno, ordenar por fecha/hora y asignar "Sesión X · [Mes]"
  groups.forEach((groupClasses) => {
    groupClasses.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || "").localeCompare(b.start_time || "")
    })

    // Contar cuántas sesiones regulares tiene este mes (sin tope fijo)
    const regularSessionsCount = groupClasses.filter((c) => {
      const duration = getClassDurationMinutes(c)
      const isDedicatedRecovery =
        Boolean(c.is_recovery || c.original_class_date) && duration < 90
      return !c.is_special && !isDedicatedRecovery
    }).length

    let currentSessionNumber = 0

    groupClasses.forEach((c) => {
      const durationMinutes = getClassDurationMinutes(c)
      const units = getClassUnits(c)
      const monthName = getMonthNameEs(c.date, true)
      const isRecovery = Boolean(
        c.is_recovery || (c.original_class_date && c.original_class_date !== "")
      )
      const isDedicatedRecovery = isRecovery && durationMinutes < 90
      const isSpecial = Boolean(c.is_special)

      let recoveryLabel: string | undefined = undefined
      if (isRecovery && c.original_class_date) {
        recoveryLabel =
          durationMinutes >= 90
            ? `Incluye recuperación del ${formatSpanishShortDate(c.original_class_date)}`
            : `Recuperación del ${formatSpanishShortDate(c.original_class_date)}`
      } else if (isRecovery) {
        recoveryLabel = "Sesión de recuperación"
      }

      let specialLabel: string | undefined = undefined
      if (isSpecial) {
        specialLabel = c.special_note || "Clase Especial"
      }

      let counterLabel = ""
      let classIndex = 0

      if (isSpecial) {
        const hoursText =
          durationMinutes >= 90 ? ` (${Math.round(durationMinutes / 60)} hrs)` : ""
        counterLabel = c.special_note
          ? `⭐ Especial: ${c.special_note}`
          : `⭐ Clase Especial${hoursText}`
        classIndex = currentSessionNumber
      } else if (isDedicatedRecovery) {
        counterLabel = c.original_class_date
          ? `🔄 Recuperación · ${formatSpanishShortDate(c.original_class_date)}`
          : `🔄 Recuperación · ${monthName}`
        classIndex = currentSessionNumber
      } else {
        currentSessionNumber += 1
        classIndex = currentSessionNumber
        counterLabel = monthName
          ? `Sesión ${classIndex} · ${monthName}`
          : `Sesión ${classIndex}`
      }

      resultMap.set(c.id, {
        item: c,
        classIndex,
        totalClasses: regularSessionsCount,
        monthName,
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

  // 3. Fallback para clases canceladas o pendientes de recuperación
  for (const c of classes) {
    if (!resultMap.has(c.id)) {
      const durationMinutes = getClassDurationMinutes(c)
      const monthName = getMonthNameEs(c.date, true)
      const isRecovery = Boolean(
        c.is_recovery || (c.original_class_date && c.original_class_date !== "")
      )
      const isSpecial = Boolean(c.is_special)

      let recoveryLabel: string | undefined = undefined
      if (c.is_recovery_pending) {
        if (c.recovery_origin_type === "TEACHER_OR_HOLIDAY") {
          recoveryLabel = "Pendiente por recuperar (sin vencimiento)"
        } else if (c.recovery_expires_at) {
          recoveryLabel = `Pendiente por recuperar (vence ${formatSpanishShortDate(c.recovery_expires_at)})`
        } else {
          recoveryLabel = "Pendiente por recuperar"
        }
      } else if (isRecovery && c.original_class_date) {
        recoveryLabel = `Recuperación del ${formatSpanishShortDate(c.original_class_date)}`
      }

      const counterLabel = c.is_recovery_pending
        ? `⏳ Por recuperar · ${monthName}`
        : c.status === "CANCELLED" || c.status === "CANCELLED_BY_STUDENT"
        ? "Cancelada"
        : isSpecial
        ? "⭐ Clase Especial"
        : monthName
        ? `Sesión · ${monthName}`
        : "Sesión"

      resultMap.set(c.id, {
        item: c,
        classIndex: 0,
        totalClasses: 0,
        monthName,
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

/**
 * Extrae las clases pendientes por recuperar vigentes de un alumno.
 */
export function getPendingRecoveriesForStudent<T extends ClassCounterItem>(
  classes: T[],
  todayStr: string = getSantiagoTodayStr()
): PendingRecoveryItem<T>[] {
  const pending = classes.filter(
    (c) => Boolean(c.is_recovery_pending) && c.recovery_origin_type !== "NO_SHOW"
  )

  return pending
    .map((c) => {
      const originDate = c.original_class_date || c.date || ""
      const originMonthKey = originDate.slice(0, 7)
      const originMonthName = getMonthNameEs(originDate, true) || "Mes anterior"
      const originType: RecoveryOriginType =
        c.recovery_origin_type === "STUDENT_JUSTIFIED"
          ? "STUDENT_JUSTIFIED"
          : "TEACHER_OR_HOLIDAY"

      const expiresAt =
        originType === "TEACHER_OR_HOLIDAY"
          ? null
          : c.recovery_expires_at || null

      const isExpired = Boolean(expiresAt && expiresAt < todayStr)

      const reasonLabel =
        c.recovery_reason ||
        (originType === "TEACHER_OR_HOLIDAY"
          ? "Suspensión profesor / feriado (no vence)"
          : expiresAt
          ? `Falta justificada (hasta el ${formatSpanishShortDate(expiresAt)})`
          : "Falta justificada (plazo 30 días)")

      return {
        item: c,
        originDate,
        originMonthKey,
        originMonthName,
        originType,
        reasonLabel,
        expiresAt,
        isExpired,
      }
    })
    .filter((r) => !r.isExpired)
    .sort((a, b) => a.originDate.localeCompare(b.originDate))
}

/**
 * Helper que, dado un alumno y un mes (YYYY-MM), devuelve las sesiones realizadas,
 * las sesiones por venir y las clases pendientes por recuperar (en caja aparte).
 */
export function getStudentMonthSessionsSummary<T extends ClassCounterItem>(params: {
  classes: T[]
  monthKey: string // YYYY-MM
  studentId?: string | null
  todayStr?: string // YYYY-MM-DD
}): StudentMonthSessionsSummary<T> {
  const {
    classes,
    monthKey,
    studentId,
    todayStr = getSantiagoTodayStr(),
  } = params

  const studentClasses = studentId
    ? classes.filter((c) => c.student_id === studentId)
    : classes

  const countersMap = calculateClassCounters(studentClasses)

  const monthRegularSessions = studentClasses
    .filter((c) => {
      if (!c.date || !c.date.startsWith(monthKey)) return false
      if (!isCountableMonthSession(c)) return false
      const duration = getClassDurationMinutes(c)
      const isDedicatedRecovery =
        Boolean(c.is_recovery || c.original_class_date) && duration < 90
      return !c.is_special && !isDedicatedRecovery
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || "").localeCompare(b.start_time || "")
    })

  let completedCount = 0
  let upcomingCount = 0

  const enrichedSessions: EnrichedClassItem<T>[] = []

  for (const c of monthRegularSessions) {
    const enriched = countersMap.get(c.id)
    if (enriched) {
      enrichedSessions.push(enriched)
    }

    const isDone =
      c.status === "COMPLETED" ||
      c.recovery_origin_type === "NO_SHOW" ||
      (c.date < todayStr && c.status !== "CANCELLED")

    if (isDone) {
      completedCount += 1
    } else {
      upcomingCount += 1
    }
  }

  const pendingRecoveries = getPendingRecoveriesForStudent(
    studentClasses,
    todayStr
  )

  return {
    monthKey,
    monthName: getMonthNameEs(monthKey, true),
    monthYearLabel: getMonthYearLabelEs(monthKey),
    completedCount,
    upcomingCount,
    totalSessions: completedCount + upcomingCount,
    sessions: enrichedSessions,
    pendingRecoveries,
  }
}
