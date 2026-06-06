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
 * Obtiene todos los slots disponibles para un profesor en una fecha específica.
 */
export async function getAvailableSlots(date: string, teacherId: string, durationMinutes: number) {
  const dayOfWeek = new Date(date + "T12:00").getDay()

  // 1. Obtener disponibilidad base para ese día
  const { data: availability } = await supabase
    .from("Availability")
    .select("start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("day_of_week", dayOfWeek)

  if (!availability || availability.length === 0) return []

  // 2. Obtener clases ya programadas
  const { data: classes } = await supabase
    .from("Class")
    .select("start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .neq("status", "CANCELLED")

  // 3. Obtener reservas pendientes
  const { data: bookings } = await supabase
    .from("Booking")
    .select("start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .eq("status", "PENDING")

  const occupied = [...(classes || []), ...(bookings || [])]

  const availableSlots: string[] = []

  // 4. Generar slots para cada rango de disponibilidad
  for (const range of availability) {
    let current = range.start_time
    const end = range.end_time

    while (true) {
      const slotStart = current
      const slotEnd = addMinutes(slotStart, durationMinutes)

      // Si el slot se pasa del fin del rango, terminamos este rango
      if (slotEnd > end) break

      // Verificar si solapa con algo ocupado
      const isOccupied = occupied.some(occ => 
        timesOverlap(slotStart, slotEnd, occ.start_time, occ.end_time)
      )

      if (!isOccupied) {
        availableSlots.push(slotStart)
      }

      // Avanzar al siguiente slot (por ahora avanzamos de a 30 min para dar flexibilidad, 
      // o podríamos avanzar por la duración de la clase si quisiéramos slots continuos)
      current = addMinutes(slotStart, 30) 
      if (current >= end) break
    }
  }

  return availableSlots
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
 */
export async function checkTeacherConflict(
  teacherId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeClassId?: string
): Promise<boolean> {
  if (!teacherId || !date || !startTime || !endTime) return false

  // 1. Clases activas
  let classQuery = supabase
    .from("Class")
    .select("id, start_time, end_time")
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

  // 2. Reservas pendientes
  const { data: bookings, error: bookingErr } = await supabase
    .from("Booking")
    .select("id, start_time, end_time")
    .eq("teacher_id", teacherId)
    .eq("date", date)
    .eq("status", "PENDING")

  if (bookingErr) {
    console.error("[checkTeacherConflict] Error fetching bookings:", bookingErr)
    return false
  }

  const occupied = [...(classes || []), ...(bookings || [])]
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
