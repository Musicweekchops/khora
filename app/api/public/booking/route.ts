import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      message,
      classTypeId,
      date,
      startTime,
      endTime,
      isMonthlyPlan = false,
      monthlyPricing = null
    } = body

    if (!name || !email || !phone || !classTypeId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar que el tipo de clase existe y está activo vía Supabase
    const { data: classType } = await supabase
      .from('ClassType')
      .select('*')
      .eq('id', classTypeId)
      .single()

    if (!classType || !classType.isActive) {
      return NextResponse.json({ error: 'Invalid class type' }, { status: 400 })
    }

    // PLAN MENSUAL
    if (isMonthlyPlan || classType.name.toLowerCase().includes('mensual')) {
      if (!monthlyPricing || !monthlyPricing.classes) {
        return NextResponse.json({ error: 'Monthly pricing data required' }, { status: 400 })
      }

      return await createDynamicMonthlyPlanBooking({
        name, email, phone, message, classTypeId, classType, startTime, endTime, monthlyPricing
      })
    }

    // CLASE UNITARIA O DE PRUEBA
    const requestedDate = new Date(date)
    return await createSingleBooking({
      name, email, phone, message, classTypeId, classType, date: requestedDate, startTime, endTime
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createDynamicMonthlyPlanBooking(params: any) {
  const { name, email, phone, message, classTypeId, classType, startTime, endTime, monthlyPricing } = params

  const lastClassDate = new Date(monthlyPricing.classes[monthlyPricing.classes.length - 1].date)
  const expirationDate = new Date(lastClassDate)
  expirationDate.setMonth(expirationDate.getMonth() + 2)

  const firstClassDate = new Date(monthlyPricing.classes[0].date)

  // Crear booking padre
  const { data: parentBooking, error: bError } = await supabaseAdmin
    .from('Booking')
    .insert({
      name,
      email,
      phone,
      message: message || '',
      classTypeId,
      date: firstClassDate.toISOString(),
      startTime,
      endTime,
      status: 'CONFIRMED',
      isParent: true,
      isMonthlyPlan: true,
      totalPrice: monthlyPricing.pricing.totalPrice
    })
    .select()
    .single()

  if (bError) throw bError

  // Crear clases individuales
  const classRecords = monthlyPricing.classes.map((cd: any, index: number) => ({
    bookingId: parentBooking.id,
    date: cd.date,
    startTime,
    endTime,
    duration: classType.duration,
    status: 'SCHEDULED',
    needsRenewalReminder: index === monthlyPricing.classes.length - 2,
    expiresAt: expirationDate.toISOString()
  }))

  const { data: createdClasses, error: cError } = await supabaseAdmin
    .from('Class')
    .insert(classRecords)
    .select()

  if (cError) throw cError

  // Upsert MonthlyLimits si es prueba
  if (classType.name.toLowerCase().includes('prueba')) {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: limits } = await supabaseAdmin
      .from('MonthlyLimits')
      .select('id, trialClassesTaken')
      .match({ email, phone, month: currentMonth })
      .single()

    if (limits) {
      await supabaseAdmin
        .from('MonthlyLimits')
        .update({ trialClassesTaken: (limits.trialClassesTaken || 0) + 1 })
        .eq('id', limits.id)
    } else {
      await supabaseAdmin
        .from('MonthlyLimits')
        .insert({ email, phone, month: currentMonth, trialClassesTaken: 1 })
    }
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: parentBooking.id,
      name,
      email,
      phone,
      isMonthlyPlan: true,
      totalPrice: parentBooking.totalPrice,
      classes: createdClasses.map((cls: any, idx: number) => ({
        id: cls.id,
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        weekNumber: idx + 1
      }))
    }
  })
}

async function createSingleBooking(params: any) {
  const { name, email, phone, message, classTypeId, classType, date, startTime, endTime } = params

  // Verificar disponibilidad
  const { data: existingClass } = await supabase
    .from('Class')
    .select('id')
    .match({ date: date.toISOString().split('T')[0], startTime, status: 'SCHEDULED' })
    .maybeSingle()

  if (existingClass) {
    return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 })
  }

  // Verificar límite de prueba
  if (classType.name.toLowerCase().includes('prueba')) {
    const { data: existingTrial } = await supabase
      .from('Booking')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .ilike('classType.name', '%prueba%') // Nota: Esto requiere join o lógica en memoria si no hay join rápido
      .in('status', ['CONFIRMED', 'COMPLETED'])
      .maybeSingle()

    if (existingTrial) {
      return NextResponse.json({ error: 'Already taken a trial class' }, { status: 400 })
    }
  }

  const { data: booking, error: bError } = await supabaseAdmin
    .from('Booking')
    .insert({
      name, email, phone,
      message: message || '',
      classTypeId,
      date: date.toISOString(),
      startTime, endTime,
      status: 'CONFIRMED',
      totalPrice: classType.price
    })
    .select()
    .single()

  if (bError) throw bError

  const { data: classRecord, error: cError } = await supabaseAdmin
    .from('Class')
    .insert({
      bookingId: booking.id,
      date: date.toISOString().split('T')[0],
      startTime, endTime,
      duration: classType.duration,
      status: 'SCHEDULED'
    })
    .select()
    .single()

  if (cError) throw cError

  // MonthlyLimits logic (same as above)
  if (classType.name.toLowerCase().includes('prueba')) {
    const currentMonth = date.toISOString().slice(0, 7)
    const { data: limits } = await supabaseAdmin
      .from('MonthlyLimits')
      .select('id, trialClassesTaken')
      .match({ email, phone, month: currentMonth })
      .single()

    if (limits) {
      await supabaseAdmin
        .from('MonthlyLimits')
        .update({ trialClassesTaken: (limits.trialClassesTaken || 0) + 1 })
        .eq('id', limits.id)
    } else {
      await supabaseAdmin
        .from('MonthlyLimits')
        .insert({ email, phone, month: currentMonth, trialClassesTaken: 1 })
    }
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: booking.id,
      name, email, phone,
      totalPrice: booking.totalPrice,
      classes: [{
        id: classRecord.id,
        date: classRecord.date,
        startTime: classRecord.startTime,
        endTime: classRecord.endTime,
        weekNumber: 1
      }]
    }
  })
}
