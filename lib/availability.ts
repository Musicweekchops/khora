import { supabase } from "./supabase"

/**
 * Calcula si dos rangos de tiempo se solapan.
 * Lógica: (inicio1 < fin2) AND (fin1 > inicio2)
 */
export function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && end1 > start2
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
