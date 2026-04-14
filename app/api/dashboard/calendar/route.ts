import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener teacherId vía Supabase
    const { data: teacher } = await supabase
      .from('User')
      .select('id, teacherProfile:TeacherProfile(id)')
      .eq('id', session.user.id)
      .single()

    if (!teacher?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const teacherId = (teacher.teacherProfile as any).id

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get('week') // Formato: 2026-W05
    
    // Calcular inicio y fin de semana
    const { startOfWeek, endOfWeek } = getWeekRange(weekParam)

    // Obtener clases de la semana vía Supabase
    const { data: classes, error: classesError } = await supabase
      .from('Class')
      .select(`
        *,
        booking:Booking(*, classType:ClassType(*)),
        student:StudentProfile(*, user:User(*)),
        classType:ClassType(*)
      `)
      .gte('date', startOfWeek.toISOString())
      .lte('date', endOfWeek.toISOString())
      .not('status', 'in', '("CANCELLED", "DELETED")')
      // Filtrar por profesor a través de student o booking
      // Nota: En Supabase JS, si no hay RLS, filtramos por relación
      .or(`studentId.is.null, student profile.teacherId.eq.${teacherId}`)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true })

    if (classesError) throw classesError

    // Formatear respuesta (mismo formato para retrocompatibilidad)
    const formattedClasses = classes.map((cls: any) => {
      const isPublicBooking = !cls.studentId && cls.booking
      
      return {
        id: cls.id,
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        duration: cls.duration,
        status: cls.status,
        
        studentName: cls.student?.user?.name || cls.booking?.name || 'Sin asignar',
        studentEmail: cls.student?.user?.email || cls.booking?.email,
        studentPhone: cls.student?.user?.phone || cls.booking?.phone,
        studentId: cls.studentId,
        
        bookingId: cls.booking?.id,
        isPublicBooking,
        isMonthlyPlan: cls.booking?.isMonthlyPlan || false,
        
        classType: cls.classType?.name || cls.booking?.classType?.name || 'Clase',
        classTypeIcon: cls.classType?.icon || cls.booking?.classType?.icon || '🎵',
        
        needsRenewalReminder: cls.needsRenewalReminder,
        expiresAt: cls.expiresAt
      }
    })

    // Obtener disponibilidad
    const { data: availability, error: avError } = await supabase
      .from('Availability')
      .select('*')
      .eq('teacherId', teacherId)
      .eq('isActive', true)
      .order('dayOfWeek', { ascending: true })

    if (avError) throw avError

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
