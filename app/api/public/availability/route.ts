import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const requestedDate = new Date(dateParam)
    const dayOfWeek = requestedDate.getDay()

    // Obtener profesor (asume que solo hay uno)
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

    // 1. Verificar si hay disponibilidad configurada para ese día
    const availability = await prisma.availability.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        isActive: true
      }
    })

    if (!availability) {
      return NextResponse.json({
        available: false,
        slots: [],
        reason: 'No availability configured for this day'
      })
    }

    // 2. Verificar si hay bloqueo para esa fecha específica
    const startOfDay = new Date(requestedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(requestedDate)
    endOfDay.setHours(23, 59, 59, 999)

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
      return NextResponse.json({
        available: false,
        slots: [],
        reason: exception.reason || 'Date blocked'
      })
    }

    // 3. Generar slots disponibles
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration
    )

    // 4. Obtener clases ya agendadas para ese día
    const bookedClasses = await prisma.class.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    // 5. Obtener bookings pendientes/confirmados
    const existingBookings = await prisma.booking.findMany({
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

    // 6. Filtrar slots ocupados
    const availableSlots = slots.filter(slot => {
      // Verificar contra clases
      const isBookedByClass = bookedClasses.some(bookedClass => {
        // Usar startTime y endTime del nuevo formato
        if (bookedClass.startTime && bookedClass.endTime) {
          return timesOverlap(slot.startTime, slot.endTime, bookedClass.startTime, bookedClass.endTime)
        }
        // Si no tiene startTime/endTime, ignorar (no debería pasar)
        return false
      })

      // Verificar contra bookings
      const isBookedByBooking = existingBookings.some(booking => {
        return timesOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)
      })

      return !isBookedByClass && !isBookedByBooking
    })

    return NextResponse.json({
      available: true,
      date: dateParam,
      dayOfWeek: getDayName(dayOfWeek),
      slots: availableSlots,
      totalSlots: slots.length,
      availableSlots: availableSlots.length
    })

  } catch (error) {
    console.error('Error getting availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateTimeSlots(startTime: string, endTime: string, duration: number) {
  const slots = []
  let current = startTime

  while (timeToMinutes(current) < timeToMinutes(endTime)) {
    const slotEnd = addMinutes(current, duration)
    
    // Solo agregar si el slot completo cabe en el horario
    if (timeToMinutes(slotEnd) <= timeToMinutes(endTime)) {
      slots.push({
        startTime: current,
        endTime: slotEnd,
        duration
      })
    }
    
    current = slotEnd
  }

  return slots
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
