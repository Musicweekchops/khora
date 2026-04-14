import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener teacherId vía Supabase
    const { data: teacher, error: teacherError } = await supabase
      .from('User')
      .select('id, teacherProfile:TeacherProfile(id)')
      .eq('id', session.user.id)
      .single()

    if (teacherError || !teacher?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const teacherId = (teacher.teacherProfile as any).id

    // Fechas para filtros
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    // 1. ALUMNOS ACTIVOS (con clases este mes)
    // En Supabase: contamos alumnos que tienen al menos una clase gte startOfMonth
    const { count: activeStudents } = await supabase
      .from('StudentProfile')
      .select('id', { count: 'exact', head: true })
      .eq('teacherId', teacherId)
      .filter('classes', 'cs', `{"date": {"gte": "${startOfMonth}"}}`)
      // Nota: Si el filtrado por relación es complejo en JS, usamos una query a Class y filtramos únicos
      
    // Re-calculando Alumnos Activos de forma más segura para Supabase JS
    const { data: activeClasses } = await supabase
      .from('Class')
      .select('studentId')
      .eq('status', 'SCHEDULED') // O estados no cancelados
      .gte('date', startOfMonth)
      .not('studentId', 'is', null)

    const uniqueStudents = new Set(activeClasses?.map(c => c.studentId))
    const activeCount = uniqueStudents.size

    // 2. CLASES HOY
    const { count: classesTodayCount } = await supabase
      .from('Class')
      .select('id', { count: 'exact', head: true })
      .gte('date', startOfToday)
      .lt('date', endOfToday)
      .neq('status', 'CANCELLED')

    // 3. BOOKINGS PÚBLICOS PENDIENTES
    const { count: pendingBookingsCount } = await supabase
      .from('Booking')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'CONFIRMED')
      // Aquí asumo que la lógica de "sin estudiante asignado" se mantiene

    // 4. INGRESOS DEL MES
    const { data: revenueData } = await supabase
      .from('Booking')
      .select('totalPrice')
      .eq('status', 'CONFIRMED')
      .gte('createdAt', startOfMonth) // O la fecha que corresponda

    const revenue = revenueData?.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0

    // 5. PAGOS PENDIENTES
    const { data: paymentData, count: pendingPayments } = await supabase
      .from('Payment')
      .select('amount', { count: 'exact' })
      .eq('status', 'PENDING')
    
    const pendingPaymentsAmount = paymentData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

    return NextResponse.json({
      activeStudents: activeCount,
      classesToday: classesTodayCount || 0,
      pendingBookings: pendingBookingsCount || 0,
      monthlyRevenue: revenue,
      pendingPayments: pendingPayments || 0,
      pendingPaymentsAmount,
      currentMonth: new Date(startOfMonth).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
