import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const requestedDate = new Date(dateParam)
    const dayOfWeek = requestedDate.getDay()

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

    // 1. Verificar disponibilidad configurada
    const { data: availability } = await supabase
      .from('Availability')
      .select('*')
      .match({ teacherId, dayOfWeek, isActive: true })
      .single()

    if (!availability) {
      return NextResponse.json({ available: false, slots: [], reason: 'No availability configured' })
    }

    // 2. Verificar bloqueos/excepciones
    const dateStr = requestedDate.toISOString().split('T')[0]
    const { data: exception } = await supabase
      .from('AvailabilityException')
      .select('*')
      .match({ teacherId, date: dateStr })
      .maybeSingle()

    if (exception) {
      return NextResponse.json({ available: false, slots: [], reason: exception.reason || 'Date blocked' })
    }

    // 3. Generar slots
    const slots = generateTimeSlots(availability.startTime, availability.endTime, availability.slotDuration)

    // 4. Obtener clases agendadas
    const { data: bookedClasses } = await supabase
      .from('Class')
      .select('startTime, endTime')
      .eq('date', dateStr)
      .not('status', 'eq', 'CANCELLED')

    // 5. Obtener bookings pendientes/confirmados
    const { data: existingBookings } = await supabase
      .from('Booking')
      .select('startTime, endTime')
      .eq('date', dateStr)
      .in('status', ['PENDING', 'CONFIRMED'])

    // 6. Filtrar slots ocupados
    const availableSlots = slots.filter(slot => {
      const isBookedByClass = (bookedClasses || []).some(bc => 
        bc.startTime && bc.endTime && timesOverlap(slot.startTime, slot.endTime, bc.startTime, bc.endTime)
      )
      const isBookedByBooking = (existingBookings || []).some(eb => 
        timesOverlap(slot.startTime, slot.endTime, eb.startTime, eb.endTime)
      )
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
