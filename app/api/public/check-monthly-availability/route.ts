import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { date, startTime, endTime } = await request.json()

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()

    // Generar las 4 fechas (mismo día de la semana, 4 semanas consecutivas)
    const weekDates = []
    for (let i = 0; i < 4; i++) {
      const weekDate = new Date(selectedDate)
      weekDate.setDate(selectedDate.getDate() + (i * 7))
      weekDates.push(weekDate)
    }

    // Obtener profesor
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
      include: { teacherProfile: true }
    })

    if (!teacher || !teacher.teacherProfile) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    const teacherId = teacher.teacherProfile.id

    // Verificar disponibilidad y conflictos para cada semana
    const weeklyStatus = await Promise.all(weekDates.map(async (weekDate, index) => {
      const startOfDay = new Date(weekDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(weekDate)
      endOfDay.setHours(23, 59, 59, 999)

      // 1. Verificar si hay disponibilidad configurada
      const availability = await prisma.availability.findFirst({
        where: {
          teacherId,
          dayOfWeek,
          isActive: true
        }
      })

      if (!availability) {
        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: 'No hay disponibilidad configurada para este día',
          isHoliday: false,
          alternatives: []
        }
      }

      // 2. Verificar si es feriado/bloqueado
      const exception = await prisma.availabilityException.findFirst({
        where: {
          teacherId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      if (exception) {
        // Obtener días alternativos para esta semana
        const alternatives = await getAlternativeDates(
          weekDate,
          startTime,
          endTime,
          teacherId,
          dayOfWeek
        )

        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: exception.reason || 'Feriado',
          isHoliday: true,
          alternatives
        }
      }

      // 3. Verificar si el slot está ocupado
      const existingClass = await prisma.class.findFirst({
        where: {
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            notIn: ['CANCELLED']
          }
        }
      })

      if (existingClass) {
        const classStart = new Date(existingClass.scheduledDate)
        const classHours = classStart.getHours()
        const classMinutes = classStart.getMinutes()
        const classStartTime = `${String(classHours).padStart(2, '0')}:${String(classMinutes).padStart(2, '0')}`
        const classEndTime = addMinutes(classStartTime, existingClass.duration)
        
        if (timesOverlap(startTime, endTime, classStartTime, classEndTime)) {
          const alternatives = await getAlternativeDates(
            weekDate,
            startTime,
            endTime,
            teacherId,
            dayOfWeek
          )

          return {
            weekNumber: index + 1,
            date: weekDate,
            available: false,
            reason: 'Este horario ya está ocupado',
            isHoliday: false,
            alternatives
          }
        }
      }

      // 4. Verificar bookings pendientes
      const existingBooking = await prisma.booking.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      })

      if (existingBooking && timesOverlap(startTime, endTime, existingBooking.startTime, existingBooking.endTime)) {
        const alternatives = await getAlternativeDates(
          weekDate,
          startTime,
          endTime,
          teacherId,
          dayOfWeek
        )

        return {
          weekNumber: index + 1,
          date: weekDate,
          available: false,
          reason: 'Este horario ya está reservado',
          isHoliday: false,
          alternatives
        }
      }

      // Todo disponible
      return {
        weekNumber: index + 1,
        date: weekDate,
        available: true,
        reason: null,
        isHoliday: false,
        alternatives: []
      }
    }))

    // Determinar disponibilidad general
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
  startOfWeek.setDate(originalDate.getDate() - originalDate.getDay() + 1) // Monday

  // Buscar en los 6 días de esa semana (excluyendo el original)
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(startOfWeek)
    checkDate.setDate(startOfWeek.getDate() + i)
    
    // Skip el día original
    if (checkDate.getDay() === excludeDayOfWeek) continue

    const startOfDay = new Date(checkDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Verificar disponibilidad
    const availability = await prisma.availability.findFirst({
      where: {
        teacherId,
        dayOfWeek: checkDate.getDay(),
        isActive: true
      }
    })

    if (!availability) continue

    // Verificar si no hay bloqueos
    const exception = await prisma.availabilityException.findFirst({
      where: {
        teacherId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (exception) continue

    // Verificar si el slot específico está libre
    const occupied = await prisma.class.findFirst({
      where: {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    if (occupied) {
      const classStart = new Date(occupied.scheduledDate)
      const classHours = classStart.getHours()
      const classMinutes = classStart.getMinutes()
      const classStartTime = `${String(classHours).padStart(2, '0')}:${String(classMinutes).padStart(2, '0')}`
      const classEndTime = addMinutes(classStartTime, occupied.duration)
      
      if (timesOverlap(originalStartTime, originalEndTime, classStartTime, classEndTime)) {
        continue
      }
    }

    // Agregar como alternativa
    alternatives.push({
      date: checkDate,
      dayOfWeek: getDayName(checkDate.getDay()),
      startTime: originalStartTime,
      endTime: originalEndTime
    })

    // Máximo 3 alternativas
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
