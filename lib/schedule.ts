import { supabase } from "@/lib/supabase"
import { filterConflictFreeDates } from "@/lib/availability"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export { DAY_NAMES }

/**
 * Calcula todas las fechas de un día de la semana dentro de un rango.
 * Ej: todos los jueves (4) de mayo 2026
 */
export function getDatesForDayInRange(dayOfWeek: number, start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(start)
  current.setHours(12, 0, 0, 0)

  // Avanzar al primer día que coincida
  while (current.getDay() !== dayOfWeek) {
    current.setDate(current.getDate() + 1)
  }

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }

  return dates
}

/**
 * Genera las clases del mes para un schedule específico.
 * Si ya existen clases para esas fechas, no las duplica.
 */
export async function generateClassesForSchedule(
  scheduleId: string,
  teacherId: string,
  studentId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  modalidad: string,
  monthDate: Date, // cualquier fecha del mes target
) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const rangeStart = new Date(year, month, 1)
  const rangeEnd = new Date(year, month + 1, 0) // último día del mes

  const dates = getDatesForDayInRange(dayOfWeek, rangeStart, rangeEnd)

  if (dates.length === 0) return { created: 0, skipped: 0 }

  // Buscar start_date de este schedule
  const { data: sched } = await supabase
    .from("Schedule")
    .select("start_date")
    .eq("id", scheduleId)
    .maybeSingle()

  const startDateStr = sched?.start_date || toDateStr(new Date())

  // Buscar clases existentes para este schedule en el rango
  const startStr = toDateStr(rangeStart)
  const endStr = toDateStr(rangeEnd)

  const { data: existing } = await supabase
    .from("Class")
    .select("date")
    .eq("schedule_id", scheduleId)
    .gte("date", startStr)
    .lte("date", endStr)

  const existingDates = new Set((existing ?? []).map(c => c.date))

  // Filtrar las que ya existen y son posteriores o iguales a la fecha de inicio
  const toCreate = dates.filter(d => {
    const dStr = toDateStr(d)
    return !existingDates.has(dStr) && dStr >= startDateStr
  })

  if (toCreate.length === 0) return { created: 0, skipped: dates.length }

  // Filtrar traslapes/conflictos para el profesor (excluyendo este mismo schedule)
  const conflictFreeDates = await filterConflictFreeDates(
    teacherId,
    toCreate,
    startTime,
    endTime,
    scheduleId
  )

  if (conflictFreeDates.length === 0) return { created: 0, skipped: dates.length }

  const rows = conflictFreeDates.map(dStr => ({
    teacher_id: teacherId,
    student_id: studentId,
    schedule_id: scheduleId,
    date: dStr,
    start_time: startTime,
    end_time: endTime,
    modalidad,
    status: "SCHEDULED",
    is_recurring: true,
  }))

  const { error } = await supabase.from("Class").insert(rows)

  if (error) {
    console.error("[Schedule] Error generating classes:", error)
    throw new Error(error.message)
  }

  return { created: conflictFreeDates.length, skipped: dates.length - conflictFreeDates.length }
}

/**
 * Elimina las clases futuras SCHEDULED de un schedule
 * (no toca las COMPLETED ni CANCELLED)
 */
export async function deleteFutureClasses(scheduleId: string) {
  const today = toDateStr(new Date())

  const { error, count } = await supabase
    .from("Class")
    .delete()
    .eq("schedule_id", scheduleId)
    .eq("status", "SCHEDULED")
    .gte("date", today)

  if (error) console.error("[Schedule] Error deleting future classes:", error)
  return count ?? 0
}

/**
 * Reprograma en bloque todas las clases futuras asociadas a un schedule
 */
export async function rescheduleFutureClasses(
  scheduleId: string,
  teacherId: string,
  studentId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  modalidad: string,
) {
  const today = new Date()
  const todayStr = toDateStr(today)

  // Buscar start_date de este schedule
  const { data: sched } = await supabase
    .from("Schedule")
    .select("start_date")
    .eq("id", scheduleId)
    .maybeSingle()

  const startDateStr = sched?.start_date || todayStr
  const effectiveStartDateStr = startDateStr > todayStr ? startDateStr : todayStr

  // 1. Eliminar clases futuras programadas (SCHEDULED) de este horario a partir de la fecha de inicio efectiva
  const { error: deleteError, count: deletedCount } = await supabase
    .from("Class")
    .delete()
    .eq("schedule_id", scheduleId)
    .eq("status", "SCHEDULED")
    .gte("date", effectiveStartDateStr)

  if (deleteError) {
    console.error("[Schedule] Error deleting future classes for rescheduling:", deleteError)
    throw new Error(deleteError.message)
  }

  // 2. Generar nuevas clases para el resto del mes actual (si aplica para la fecha de inicio)
  let createdCount = 0
  let skippedCount = 0

  const effectiveStart = new Date(effectiveStartDateStr + "T12:00")
  const endOfMonth = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth() + 1, 0)
  const datesCurrent = getDatesForDayInRange(dayOfWeek, effectiveStart, endOfMonth)

  if (datesCurrent.length > 0) {
    const conflictFreeCurrent = await filterConflictFreeDates(
      teacherId,
      datesCurrent,
      startTime,
      endTime,
      scheduleId
    )

    if (conflictFreeCurrent.length > 0) {
      const rows = conflictFreeCurrent.map(dStr => ({
        teacher_id: teacherId,
        student_id: studentId,
        schedule_id: scheduleId,
        date: dStr,
        start_time: startTime,
        end_time: endTime,
        modalidad,
        status: "SCHEDULED",
        is_recurring: true,
      }))

      const { error: insertErr } = await supabase.from("Class").insert(rows)
      if (insertErr) {
        console.error("[Schedule] Error inserting current month rescheduled classes:", insertErr)
        throw new Error(insertErr.message)
      }
      createdCount += conflictFreeCurrent.length
    }
    skippedCount += (datesCurrent.length - conflictFreeCurrent.length)
  }

  // 3. Generar nuevas clases para el próximo mes completo
  const nextMonthDate = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth() + 1, 15)
  const rNext = await generateClassesForSchedule(
    scheduleId, teacherId, studentId,
    dayOfWeek, startTime, endTime, modalidad, nextMonthDate
  )
  createdCount += rNext.created
  skippedCount += rNext.skipped

  return { deleted: deletedCount ?? 0, created: createdCount, skipped: skippedCount }
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

