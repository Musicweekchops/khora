import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener teacherId
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true }
    })

    if (!teacher?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const teacherId = teacher.teacherProfile.id

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get('week') // Formato: 2026-W05
    
    // Calcular inicio y fin de semana
    const { startOfWeek, endOfWeek } = getWeekRange(weekParam)

    console.log('DEBUG Calendar API:')
    console.log('- Start of week:', startOfWeek)
    console.log('- End of week:', endOfWeek)

    // Obtener clases de la semana (públicas + estudiantes)
    const classes = await prisma.class.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        status: {
          notIn: ['CANCELLED', 'DELETED']
        }
      },
      include: {
        booking: {
          include: {
            classType: true
          }
        },
        student: {
          include: {
            user: true
          }
        },
        classType: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    console.log('- Classes found:', classes.length)
    if (classes.length > 0) {
      console.log('- First class:', {
        date: classes[0].date,
        startTime: classes[0].startTime,
        studentName: classes[0].student?.user?.name || classes[0].booking?.name
      })
    }

    // Formatear respuesta
    const formattedClasses = classes.map(cls => {
      const isPublicBooking = !cls.studentId && cls.booking
      
      return {
        id: cls.id,
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        duration: cls.duration,
        status: cls.status,
        
        // Información del alumno o booking
        studentName: cls.student?.user?.name || cls.booking?.name || 'Sin asignar',
        studentEmail: cls.student?.user?.email || cls.booking?.email,
        studentPhone: cls.student?.user?.phone || cls.booking?.phone,
        studentId: cls.studentId,
        
        // Información del booking
        bookingId: cls.booking?.id,
        isPublicBooking, // Booking público sin aprobar
        isMonthlyPlan: cls.booking?.isMonthlyPlan || false,
        
        // Tipo de clase
        classType: cls.classType?.name || cls.booking?.classType?.name || 'Clase',
        classTypeIcon: cls.classType?.icon || cls.booking?.classType?.icon || '🎵',
        
        // Estado de renovación
        needsRenewalReminder: cls.needsRenewalReminder,
        expiresAt: cls.expiresAt
      }
    })

    // Obtener configuración de disponibilidad
    const availability = await prisma.availability.findMany({
      where: {
        teacherId,
        isActive: true
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString(),
      classes: formattedClasses,
      availability: availability.map(av => ({
        dayOfWeek: av.dayOfWeek,
        startTime: av.startTime,
        endTime: av.endTime,
        slotDuration: av.slotDuration
      }))
    })

  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Función helper para calcular rango de semana
function getWeekRange(weekParam: string | null) {
  let date: Date
  
  if (weekParam) {
    // Formato: 2026-W05
    const [year, week] = weekParam.split('-W')
    date = getDateOfISOWeek(parseInt(week), parseInt(year))
  } else {
    // Semana actual
    date = new Date()
  }

  // Obtener inicio de semana (Lunes)
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Ajustar para que Lunes sea inicio
  
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Fin de semana (Sábado)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 5) // Lunes + 5 = Sábado
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

// Helper para obtener fecha de semana ISO
function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  
  return ISOweekStart
}
