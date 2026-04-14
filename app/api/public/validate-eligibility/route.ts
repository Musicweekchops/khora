import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, phone, classTypeId } = await request.json()

    if (!email || !phone || !classTypeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Obtener tipo de clase
    const classType = await prisma.classType.findUnique({
      where: { id: classTypeId }
    })

    if (!classType) {
      return NextResponse.json(
        { error: 'Class type not found' },
        { status: 404 }
      )
    }

    // Si NO es clase de prueba, permitir
    if (!classType.name.toLowerCase().includes('prueba')) {
      return NextResponse.json({
        allowed: true,
        reason: null
      })
    }

    // VALIDAR CLASE DE PRUEBA
    // Buscar si ya tomó clase de prueba con email O teléfono
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
        status: {
          notIn: ['CANCELLED']
        }
      },
      include: {
        classType: true
      }
    })

    if (existingTrialBooking) {
      return NextResponse.json({
        allowed: false,
        reason: 'Ya has agendado una clase de prueba anteriormente. Las clases de prueba están limitadas a una por persona.',
        existingBooking: {
          date: existingTrialBooking.date,
          email: existingTrialBooking.email,
          phone: existingTrialBooking.phone
        }
      })
    }

    // También verificar en MonthlyLimits
    const currentMonth = new Date().toISOString().substring(0, 7) // "2026-01"
    const monthlyLimit = await prisma.monthlyLimits.findFirst({
      where: {
        OR: [
          { email, phone, month: currentMonth },
          { email, month: currentMonth },
          { phone, month: currentMonth }
        ]
      }
    })

    if (monthlyLimit && monthlyLimit.trialClassesTaken >= 1) {
      return NextResponse.json({
        allowed: false,
        reason: 'Ya has agendado una clase de prueba este mes. Las clases de prueba están limitadas a una por persona.'
      })
    }

    // Permitir agendar
    return NextResponse.json({
      allowed: true,
      reason: null
    })

  } catch (error) {
    console.error('Error validating trial class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
