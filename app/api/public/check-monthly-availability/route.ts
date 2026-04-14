import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { date, startTime, endTime } = await request.json()

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()

    // Generar las 4 fechas
    const weekDates = []
    for (let i = 0; i < 4; i++) {
      const weekDate = new Date(selectedDate)
      weekDate.setDate(selectedDate.getDate() + (i * 7))
      weekDates.push(weekDate)
    }

    // Obtener profesor vía Supabase
    const { data: teacher } = await supabase
      .from('User')
      .select('id, teacherProfile:TeacherProfile(id)')
      .eq('role', 'TEACHER')
      .limit(1)
      .single()

    if (!teacher || !teacher.teacherProfile) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const teacherId = (teacher.teacherProfile as any).id

    // Verificar disponibilidad y conflictos para cada semana
    const weeklyStatus = await Promise.all(weekDates.map(async (weekDate, index) => {
      const dateStr = weekDate.toISOString().split('T')[0]

      // 1. Verificar disponibilidad configurada
      const { data: availability } = await supabase
        .from('Availability')
        .select('*')
        .match({ teacherId, dayOfWeek, isActive: true })
        .maybeSingle()

      if (!availability) {
        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: 'No hay disponibilidad configurada',
          isHoliday: false,
          alternatives: []
        }
      }

      // 2. Verificar feriado/bloqueo
      const { data: exception } = await supabase
        .from('AvailabilityException')
        .select('*')
        .match({ teacherId, date: dateStr })
        .maybeSingle()

      if (exception) {
        const alternatives = await getAlternativeDates(weekDate, startTime, endTime, teacherId, dayOfWeek)
        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: exception.reason || 'Feriado',
          isHoliday: true,
          alternatives
        }
      }

      // 3. Verificar slot ocupado (Clases)
      const { data: existingClass } = await supabase
        .from('Class')
        .select('*')
        .eq('date', dateStr)
        .not('status', 'eq', 'CANCELLED')
        .maybeSingle()

      if (existingClass && existingClass.startTime && existingClass.endTime) {
        if (timesOverlap(startTime, endTime, existingClass.startTime, existingClass.endTime)) {
          const alternatives = await getAlternativeDates(weekDate, startTime, endTime, teacherId, dayOfWeek)
          return {
            weekNumber: index + 1,
            date: weekDate,
            available: false,
            reason: 'Horario ocupado por otra clase',
            isHoliday: false,
            alternatives
          }
        }
      }

      // 4. Verificar bookings
      const { data: existingBooking } = await supabase
        .from('Booking')
        .select('*')
        .eq('date', dateStr)
        .in('status', ['PENDING', 'CONFIRMED'])
        .maybeSingle()

      if (existingBooking && timesOverlap(startTime, endTime, existingBooking.startTime, existingBooking.endTime)) {
        const alternatives = await getAlternativeDates(weekDate, startTime, endTime, teacherId, dayOfWeek)
        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: 'Horario reservado',
          isHoliday: false,
          alternatives
        }
      }

      return {
        weekNumber: index + 1,
        date: weekDate,
        available: true,
        reason: null,
        isHoliday: false,
        alternatives: []
      }
    }))

    const allAvailable = weeklyStatus.every(week => week.available)
    const conflictWeeks = weeklyStatus.filter(week => !week.available)

    return NextResponse.json({
      available: allAvailable,
      weeks: weeklyStatus,
      conflicts: conflictWeeks,
      summary: {
        total: 4,
        available: weeklyStatus.filter(w => w.available).length,
        conflicts: conflictWeeks.length
      }
    })

  } catch (error) {
    console.error('Error checking monthly availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getAlternativeDates(
  originalDate: Date,
  originalStartTime: string,
  originalEndTime: string,
  teacherId: string,
  excludeDayOfWeek: number
) {
  const alternatives = []
  const startOfWeek = new Date(originalDate)
  startOfWeek.setDate(originalDate.getDate() - originalDate.getDay() + 1) // Lunes

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(startOfWeek)
    checkDate.setDate(startOfWeek.getDate() + i)
    if (checkDate.getDay() === excludeDayOfWeek) continue

    const dateStr = checkDate.toISOString().split('T')[0]

    // 1. Disponibilidad
    const { data: availability } = await supabase
      .from('Availability')
      .select('id')
      .match({ teacherId, dayOfWeek: checkDate.getDay(), isActive: true })
      .maybeSingle()

    if (!availability) continue

    // 2. Excepción
    const { data: exception } = await supabase
      .from('AvailabilityException')
      .select('id')
      .match({ teacherId, date: dateStr })
      .maybeSingle()

    if (exception) continue

    // 3. Ocupado
    const { data: occupied } = await supabase
      .from('Class')
      .select('startTime, endTime, duration')
      .eq('date', dateStr)
      .not('status', 'eq', 'CANCELLED')
      .maybeSingle()

    if (occupied && occupied.startTime && occupied.endTime) {
      if (timesOverlap(originalStartTime, originalEndTime, occupied.startTime, occupied.endTime)) continue
    }

    alternatives.push({
      date: checkDate,
      dayOfWeek: getDayName(checkDate.getDay()),
      startTime: originalStartTime,
      endTime: originalEndTime
    })

    if (alternatives.length >= 3) break
  }

  return alternatives
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function addMinutes(time: string, minutes: number): string {
  const totalMinutes = timeToMinutes(time) + minutes
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)

  return s1 < e2 && s2 < e1
}

function getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayOfWeek]
}
