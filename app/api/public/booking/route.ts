import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      monthlyPricing = null // Datos del pricing calculado
    } = body

    // Validación básica
    if (!name || !email || !phone || !classTypeId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar que el tipo de clase existe y está activo
    const classType = await prisma.classType.findUnique({
      where: { id: classTypeId }
    })

    if (!classType || !classType.isActive) {
      return NextResponse.json(
        { error: 'Invalid class type' },
        { status: 400 }
      )
    }

    // PLAN MENSUAL - Crear todas las clases según pricing calculado
    if (isMonthlyPlan || classType.name.toLowerCase().includes('mensual')) {
      if (!monthlyPricing || !monthlyPricing.classes) {
        return NextResponse.json(
          { error: 'Monthly pricing data required for monthly plan' },
          { status: 400 }
        )
      }

      return await createDynamicMonthlyPlanBooking({
        name,
        email,
        phone,
        message,
        classTypeId,
        classType,
        startTime,
        endTime,
        monthlyPricing
      })
    }

    // CLASE UNITARIA O DE PRUEBA - Crear 1 booking
    const requestedDate = new Date(date)
    return await createSingleBooking({
      name,
      email,
      phone,
      message,
      classTypeId,
      classType,
      date: requestedDate,
      startTime,
      endTime
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// PLAN MENSUAL DINÁMICO
// ============================================

async function createDynamicMonthlyPlanBooking(params: {
  name: string
  email: string
  phone: string
  message: string | undefined
  classTypeId: string
  classType: any
  startTime: string
  endTime: string
  monthlyPricing: any
}) {
  const { name, email, phone, message, classTypeId, classType, startTime, endTime, monthlyPricing } = params

  // Calcular fecha de expiración (2 meses después de la última clase)
  const lastClassDate = new Date(monthlyPricing.classes[monthlyPricing.classes.length - 1].date)
  const expirationDate = new Date(lastClassDate)
  expirationDate.setMonth(expirationDate.getMonth() + 2)

  // Fecha de la primera clase para el booking padre
  const firstClassDate = new Date(monthlyPricing.classes[0].date)

  // Crear el booking padre (Plan Mensual)
  const parentBooking = await prisma.booking.create({
    data: {
      name,
      email,
      phone,
      message: message || '',
      classTypeId,
      date: firstClassDate, // Fecha de la primera clase
      startTime,
      endTime,
      status: 'CONFIRMED',
      isParent: true,
      isMonthlyPlan: true,
      totalPrice: monthlyPricing.pricing.totalPrice
    }
  })

  // Crear las clases individuales
  const classPromises = monthlyPricing.classes.map(async (classData: any, index: number) => {
    const classDate = new Date(classData.date)
    
    // Determinar si es penúltima clase (para recordatorio de renovación)
    const isPenultimate = index === monthlyPricing.classes.length - 2

    return prisma.class.create({
      data: {
        booking: {
          connect: { id: parentBooking.id }
        },
        date: classDate, // Solo usar date
        startTime,
        endTime,
        duration: classType.duration,
        status: 'SCHEDULED',
        attendanceStatus: null,
        isRecovery: false,
        needsRenewalReminder: isPenultimate,
        expiresAt: expirationDate
      }
    })
  })

  const createdClasses = await Promise.all(classPromises)

  // Actualizar MonthlyLimits para clase de prueba si aplica
  if (classType.name.toLowerCase().includes('prueba')) {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    await prisma.monthlyLimits.upsert({
      where: {
        email_phone_month: {
          email,
          phone,
          month: currentMonth
        }
      },
      update: {
        trialClassesTaken: { increment: 1 }
      },
      create: {
        email,
        phone,
        month: currentMonth,
        trialClassesTaken: 1,
        reschedulesUsed: 0,
        recoveriesUsed: 0
      }
    })
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: parentBooking.id,
      name,
      email,
      phone,
      isMonthlyPlan: true,
      totalPrice: monthlyPricing.pricing.totalPrice,
      pricingType: monthlyPricing.pricing.type,
      classType: {
        name: classType.name,
        price: monthlyPricing.pricing.totalPrice,
        currency: classType.currency,
        duration: classType.duration
      },
      classes: createdClasses.map((cls, idx) => ({
        id: cls.id,
        date: cls.date,
        startTime: cls.startTime,
        endTime: cls.endTime,
        month: monthlyPricing.classes[idx].month,
        monthName: monthlyPricing.classes[idx].monthName,
        weekNumber: idx + 1,
        needsRenewalReminder: cls.needsRenewalReminder
      }))
    }
  })
}

// ============================================
// CLASE INDIVIDUAL
// ============================================

async function createSingleBooking(params: {
  name: string
  email: string
  phone: string
  message: string | undefined
  classTypeId: string
  classType: any
  date: Date
  startTime: string
  endTime: string
}) {
  const { name, email, phone, message, classTypeId, classType, date, startTime, endTime } = params

  // Verificar disponibilidad
  const existingBooking = await prisma.booking.findFirst({
    where: {
      classTypeId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      classes: {
        some: {
          date,
          startTime,
          status: 'SCHEDULED'
        }
      }
    }
  })

  if (existingBooking) {
    return NextResponse.json(
      { error: 'This time slot is already booked' },
      { status: 400 }
    )
  }

  // Verificar límite de clase de prueba
  if (classType.name.toLowerCase().includes('prueba')) {
    const existingTrialBooking = await prisma.booking.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ],
        classType: {
          name: {
            contains: 'prueba',
            mode: 'insensitive'
          }
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }
    })

    if (existingTrialBooking) {
      return NextResponse.json(
        { error: 'You have already taken a trial class' },
        { status: 400 }
      )
    }
  }

  // Crear el booking
  const booking = await prisma.booking.create({
    data: {
      name,
      email,
      phone,
      message: message || '',
      classTypeId,
      date, // Campo obligatorio
      startTime,
      endTime,
      status: 'CONFIRMED',
      isParent: false,
      isMonthlyPlan: false,
      totalPrice: classType.price
    }
  })

  // Crear la clase
  const classRecord = await prisma.class.create({
    data: {
      booking: {
        connect: { id: booking.id }
      },
      date, // Solo usar date
      startTime,
      endTime,
      duration: classType.duration,
      status: 'SCHEDULED',
      attendanceStatus: null
    }
  })

  // Actualizar MonthlyLimits para clase de prueba
  if (classType.name.toLowerCase().includes('prueba')) {
    const currentMonth = date.toISOString().slice(0, 7)
    
    await prisma.monthlyLimits.upsert({
      where: {
        email_phone_month: {
          email,
          phone,
          month: currentMonth
        }
      },
      update: {
        trialClassesTaken: { increment: 1 }
      },
      create: {
        email,
        phone,
        month: currentMonth,
        trialClassesTaken: 1,
        reschedulesUsed: 0,
        recoveriesUsed: 0
      }
    })
  }

  return NextResponse.json({
    success: true,
    booking: {
      id: booking.id,
      name,
      email,
      phone,
      isMonthlyPlan: false,
      classType: {
        name: classType.name,
        price: classType.price,
        currency: classType.currency,
        duration: classType.duration
      },
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
