import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, phone, classTypeId } = await request.json()

    if (!email || !phone || !classTypeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Obtener tipo de clase vía Supabase
    const { data: classType } = await supabase
      .from('ClassType')
      .select('*')
      .eq('id', classTypeId)
      .single()

    if (!classType) {
      return NextResponse.json({ error: 'Class type not found' }, { status: 404 })
    }

    // Si NO es clase de prueba, permitir
    if (!classType.name.toLowerCase().includes('prueba')) {
      return NextResponse.json({ allowed: true, reason: null })
    }

    // VALIDAR CLASE DE PRUEBA
    // Buscamos bookings vía join (si es posible) o verificamos bookings existentes
    const { data: existingTrialBooking } = await supabase
      .from('Booking')
      .select('*, classType:ClassType(*)')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .not('status', 'eq', 'CANCELLED')
      .ilike('classType.name', '%prueba%')
      .maybeSingle()

    if (existingTrialBooking) {
      return NextResponse.json({
        allowed: false,
        reason: 'Ya has agendado una clase de prueba anteriormente.',
        existingBooking: {
          date: existingTrialBooking.date,
          email: existingTrialBooking.email,
          phone: existingTrialBooking.phone
        }
      })
    }

    // Verificar MonthlyLimits
    const currentMonth = new Date().toISOString().substring(0, 7)
    const { data: monthlyLimit } = await supabase
      .from('MonthlyLimits')
      .select('*')
      .match({ month: currentMonth })
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle()

    if (monthlyLimit && monthlyLimit.trialClassesTaken >= 1) {
      return NextResponse.json({
        allowed: false,
        reason: 'Ya has agendado una clase de prueba este mes.'
      })
    }

    return NextResponse.json({ allowed: true, reason: null })

  } catch (error) {
    console.error('Error validating trial class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
