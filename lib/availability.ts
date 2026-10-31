import { supabase } from "./supabase"

function normalizeTime(timeStr: string): string {
  if (!timeStr) return ""
  const parts = timeStr.split(":")
  if (parts.length < 2) return timeStr
  const h = parts[0].padStart(2, "0")
  const m = parts[1].padStart(2, "0")
  return `${h}:${m}`
}

/**
 * Calcula si dos rangos de tiempo se solapan.
 * Lógica: (inicio1 < fin2) AND (fin1 > inicio2)
 */
export function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = normalizeTime(start1)
  const e1 = normalizeTime(end1)
  const s2 = normalizeTime(start2)
  const e2 = normalizeTime(end2)
  return s1 < e2 && e1 > s2
}

/**
 * Convierte "HH:mm" o "HH:mm:ss" a minutos transcurridos desde las 00:00.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

/**
 * Convierte minutos desde las 00:00 a string "HH:mm:00".
 */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

export interface TimeInterval {
  start: number
  end: number
}

/**
 * Obtiene los bloques continuos de tiempo libre dentro de un rango de disponibilidad,
 * restando todos los intervalos ocupados (clases activas y reservas pendientes).
 */
export function getContinuousFreeWindows(
  rangeStartMin: number,
  rangeEndMin: number,
  occupiedMin: TimeInterval[]
): TimeInterval[] {
  // 1. Filtrar los ocupados que caigan dentro del rango y recortarlos a los bordes
  const clipped: TimeInterval[] = []
  for (const occ of occupiedMin) {
    const s = Math.max(rangeStartMin, occ.start)
    const e = Math.min(rangeEndMin, occ.end)
    if (s < e) {
      clipped.push({ start: s, end: e })
    }
  }

  // 2. Ordenar por tiempo de inicio
  clipped.sort((a, b) => a.start - b.start)

  // 3. Fusionar bloques ocupados continuos o solapados
  const merged: TimeInterval[] = []
  for (const item of clipped) {
    if (merged.length === 0) {
      merged.push({ ...item })
    } else {
      const last = merged[merged.length - 1]
      if (item.start <= last.end) {
        last.end = Math.max(last.end, item.end)
      } else {
        merged.push({ ...item })
      }
    }
  }

  // 4. Los intervalos libres son los espacios entre los bloques ocupados fusionados
  const freeWindows: TimeInterval[] = []
  let cursor = rangeStartMin
  for (const occ of merged) {
    if (cursor < occ.start) {
      freeWindows.push({ start: cursor, end: occ.start })
    }
    cursor = Math.max(cursor, occ.end)
  }
  if (cursor < rangeEndMin) {
    freeWindows.push({ start: cursor, end: rangeEndMin })
  }

  return freeWindows
}

/**
 * Evalúa si colocar un slot de clase genera un hueco huérfano inutilizable (fragmentación de agenda).
 * 
 * Regla matemática:
 * 1. Conservación de capacidad: el slot no debe reducir el número total de alumnos/clases
 *    que cabrían en la ventana continua libre (Math.floor(longitud / minDuration)).
 * 2. Cero huecos muertos: si la ventana da para 2 o más clases, no puede quedar ningún
 *    extremo con un espacio mayor a 0 pero menor a la duración mínima (ej. 30 min).
 * 3. Si la ventana es pequeña (menor a 2 clases), el slot debe ir anclado a uno de los bordes.
 */
export function isSlotLeavingOrphanGap(
  slotStartMin: number,
  slotEndMin: number,
  windowStartMin: number,
  windowEndMin: number,
  minDurationMinutes: number
): boolean {
  const windowLength = windowEndMin - windowStartMin
  const slotDuration = slotEndMin - slotStartMin

  if (windowLength < slotDuration) return true

  const maxClassesInitial = Math.floor(windowLength / minDurationMinutes)

  const gapBefore = slotStartMin - windowStartMin
  const gapAfter = windowEndMin - slotEndMin

  const maxClassesAfter = 1 + Math.floor(gapBefore / minDurationMinutes) + Math.floor(gapAfter / minDurationMinutes)

  // 1. Destrucción de capacidad: si al elegir este horario caben menos clases en total
  if (maxClassesAfter < maxClassesInitial) {
    return true
  }

  // 2. Si la ventana permite 2 o más clases, ningún extremo puede quedar con un hueco
  // inutilizable (menor a minDurationMinutes)
  if (windowLength >= minDurationMinutes * 2) {
    if (gapBefore > 0 && gapBefore < minDurationMinutes) return true
    if (gapAfter > 0 && gapAfter < minDurationMinutes) return true
  } else {
    // Si la ventana no da para 2 clases completas, debe al menos estar pegada a un extremo
    if (gapBefore > 0 && gapAfter > 0) return true
  }

  return false
}

export interface GetAvailableSlotsOptions {
  excludeClassId?: string
  excludeBookingId?: string
  minDurationMinutes?: number
  allowOrphanGaps?: boolean
}

/**
 * Obtiene todos los slots disponibles para un profesor en una fecha específica,
 * filtrando automáticamente aquellos que generen huecos huérfanos que impidan sumar otro alumno.
 */
export async function getAvailableSlots(
  date: string,
  teacherId: string,
  durationMinutes: number,
  options?: GetAvailableSlotsOptions
): Promise<string[]> {
  const dayOfWeek = new Date(date + "T12:00").getDay()

  // 1. Obtener disponibilidad base para ese día
  const { data: availability } = await supabase
    .from("Availability")
    .select("start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("day_of_week", dayOfWeek)

  if (!availability || availability.length === 0) return []

  // 2. Obtener clases ya programadas
  let classQuery = supabase
    .from("Class")
    .select("id, start_time, end_time, booking_id")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .neq("status", "CANCELLED")

  if (options?.excludeClassId) {
    classQuery = classQuery.neq("id", options.excludeClassId)
  }

  const { data: classes } = await classQuery

  // 3. Obtener reservas pendientes
  let bookingQuery = supabase
    .from("Booking")
    .select("id, start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .eq("status", "PENDING")

  if (options?.excludeBookingId) {
    bookingQuery = bookingQuery.neq("id", options.excludeBookingId)
  }

  const { data: bookings } = await bookingQuery

  const filteredClasses = options?.excludeBookingId
    ? (classes || []).filter((c: any) => c.booking_id !== options.excludeBookingId)
    : (classes || [])

  const occupied = [...filteredClasses, ...(bookings || [])]

  // 4. Determinar la duración mínima de clase del profesor para evitar huecos inservibles
  let minDuration = options?.minDurationMinutes
  if (!minDuration) {
    try {
      const { data: classTypes } = await supabase
        .from("ClassType")
        .select("duration")
        .eq("teacher_id", teacherId)

      if (classTypes && classTypes.length > 0) {
        const validDurations = classTypes
          .map((c: any) => Number(c.duration))
          .filter((d: number) => !isNaN(d) && d > 0)

        if (validDurations.length > 0) {
          minDuration = Math.min(...validDurations)
        }
      }
    } catch (e) {
      // Ignorar error de red/tabla y usar fallback
    }
  }

  if (!minDuration || minDuration <= 0) {
    minDuration = Math.min(durationMinutes, 60)
  }

  const occupiedMin: TimeInterval[] = occupied.map((occ: any) => ({
    start: timeToMinutes(occ.start_time),
    end: timeToMinutes(occ.end_time)
  }))

  const availableSlots: string[] = []

  // 5. Generar slots examinando las ventanas continuas libres de cada rango
  for (const range of availability) {
    const rangeStartMin = timeToMinutes(range.start_time)
    const rangeEndMin = timeToMinutes(range.end_time)

    const freeWindows = getContinuousFreeWindows(rangeStartMin, rangeEndMin, occupiedMin)

    for (const win of freeWindows) {
      if (win.end - win.start < durationMinutes) continue

      // Generar candidatos avanzando en pasos de 30 min (o la duración si es menor)
      const step = Math.min(30, durationMinutes)
      const candidates = new Set<number>()

      let cursor = win.start
      while (cursor + durationMinutes <= win.end) {
        candidates.add(cursor)
        cursor += step
      }

      // Probar también el anclaje exacto al final del bloque libre
      const endAnchor = win.end - durationMinutes
      if (endAnchor >= win.start) {
        candidates.add(endAnchor)
      }

      const sortedCandidates = Array.from(candidates).sort((a, b) => a - b)

      for (const startMin of sortedCandidates) {
        const endMin = startMin + durationMinutes

        // Si no se permite hueco huérfano (comportamiento por defecto)
        if (!options?.allowOrphanGaps) {
          const leavesGap = isSlotLeavingOrphanGap(startMin, endMin, win.start, win.end, minDuration)
          if (leavesGap) continue
        }

        availableSlots.push(minutesToTime(startMin))
      }
    }
  }

  // Eliminar duplicados y ordenar cronológicamente
  return Array.from(new Set(availableSlots)).sort()
}

/**
 * Valida si un horario seleccionado por el alumno es válido para agendar:
 * 1. Cae dentro de la disponibilidad del profesor.
 * 2. No solapa con clases existentes ni reservas pendientes.
 * 3. No deja huecos huérfanos que impidan sumar otro alumno.
 */
export async function validateBookingSlot(
  date: string,
  teacherId: string,
  startTime: string,
  durationMinutes: number,
  options?: GetAvailableSlotsOptions
): Promise<{ valid: boolean; reason?: string }> {
  const slots = await getAvailableSlots(date, teacherId, durationMinutes, options)
  const normTime = normalizeTime(startTime)

  const isAvailable = slots.some(s => normalizeTime(s) === normTime)
  if (!isAvailable) {
    return {
      valid: false,
      reason: "El horario seleccionado no está disponible o dejaría un espacio muerto en la agenda del profesor. Por favor selecciona otro horario."
    }
  }

  return { valid: true }
}

/**
 * Helper para sumar minutos a un string de tiempo "HH:mm:ss" o "HH:mm"
 */
export function addMinutes(startTime: string, minutes: number): string {
  const [h, m] = startTime.split(":").map(Number)
  const date = new Date()
  date.setHours(h, m, 0, 0)
  date.setMinutes(date.getMinutes() + minutes)
  
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`
}

/**
 * Consulta si un profesor tiene conflicto de horario (clases activas o reservas pendientes).
 * Al confirmar un booking, pasar excludeBookingId para excluir ese booking del check
 * y también excluir cualquier clase huérfana que ya tenga ese booking_id.
 */
export async function checkTeacherConflict(
  teacherId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeClassId?: string,
  excludeBookingId?: string
): Promise<boolean> {
  if (!teacherId || !date || !startTime || !endTime) return false

  // 1. Clases activas (excluir la clase indicada por ID, y también
  //    cualquier clase que ya tenga el mismo booking_id que estamos confirmando)
  let classQuery = supabase
    .from("Class")
    .select("id, start_time, end_time, booking_id")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .neq("status", "CANCELLED")

  if (excludeClassId) {
    classQuery = classQuery.neq("id", excludeClassId)
  }

  const { data: classes, error: classErr } = await classQuery
  if (classErr) {
    console.error("[checkTeacherConflict] Error fetching classes:", classErr)
    return false
  }

  // Filtrar clases que corresponden al mismo booking (intentos previos)
  const filteredClasses = excludeBookingId
    ? (classes || []).filter((c: any) => c.booking_id !== excludeBookingId)
    : (classes || [])

  // 2. Reservas pendientes (excluir el booking que estamos confirmando)
  let bookingQuery = supabase
    .from("Booking")
    .select("id, start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .eq("status", "PENDING")

  if (excludeBookingId) {
    bookingQuery = bookingQuery.neq("id", excludeBookingId)
  }

  const { data: bookings, error: bookingErr } = await bookingQuery

  if (bookingErr) {
    console.error("[checkTeacherConflict] Error fetching bookings:", bookingErr)
    return false
  }

  const occupied = [...filteredClasses, ...(bookings || [])]
  return occupied.some(occ => timesOverlap(startTime, endTime, occ.start_time, occ.end_time))
}

/**
 * Filtra una lista de fechas y retorna solo aquellas en las que el profesor NO tiene conflicto de horario.
 */
export async function filterConflictFreeDates(
  teacherId: string,
  dates: (Date | string)[],
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<string[]> {
  if (dates.length === 0) return []

  const dateStrings = dates.map(d => {
    if (d instanceof Date) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }
    return d
  })

  // 1. Clases activas en estas fechas
  let classQuery = supabase
    .from("Class")
    .select("id, date, start_time, end_time, schedule_id")
    .eq("teacher_id", teacherId)
    .in("date", dateStrings)
    .neq("status", "CANCELLED")

  if (excludeScheduleId) {
    classQuery = classQuery.neq("schedule_id", excludeScheduleId)
  }

  const { data: classes, error: classErr } = await classQuery
  if (classErr) {
    console.error("[filterConflictFreeDates] Error fetching classes:", classErr)
    return dateStrings
  }

  // 2. Reservas pendientes en estas fechas
  const { data: bookings, error: bookingErr } = await supabase
    .from("Booking")
    .select("id, date, start_time, end_time")
    .eq("teacher_id", teacherId)
    .in("date", dateStrings)
    .eq("status", "PENDING")

  if (bookingErr) {
    console.error("[filterConflictFreeDates] Error fetching bookings:", bookingErr)
    return dateStrings
  }

  const occupied = [...(classes || []), ...(bookings || [])]

  // Agrupar por fecha
  const occupiedByDate: Record<string, typeof occupied> = {}
  for (const occ of occupied) {
    if (!occupiedByDate[occ.date]) {
      occupiedByDate[occ.date] = []
    }
    occupiedByDate[occ.date].push(occ)
  }

  return dateStrings.filter(dStr => {
    const occs = occupiedByDate[dStr] || []
    const hasConflict = occs.some(occ => timesOverlap(startTime, endTime, occ.start_time, occ.end_time))
    return !hasConflict
  })
}
