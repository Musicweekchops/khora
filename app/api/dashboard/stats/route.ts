import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    // Fechas para filtros
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday)
    endOfToday.setDate(endOfToday.getDate() + 1)

    // 1. ALUMNOS ACTIVOS (con clases este mes)
    const activeStudents = await prisma.studentProfile.count({
      where: {
        teacherId,
        classes: {
          some: {
            date: {
              gte: startOfMonth
            },
            status: {
              notIn: ['CANCELLED']
            }
          }
        }
      }
    })

    // 2. CLASES HOY
    const classesToday = await prisma.class.count({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday
        },
        status: {
          notIn: ['CANCELLED']
        },
        student: {
          teacherId
        }
      }
    })

    // 3. BOOKINGS PÚBLICOS PENDIENTES (sin estudiante asignado)
    const pendingBookings = await prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        classes: {
          some: {
            studentId: null
          }
        }
      }
    })

    // 4. INGRESOS DEL MES (bookings confirmados)
    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        status: 'CONFIRMED',
        date: {
          gte: startOfMonth
        }
      },
      _sum: {
        totalPrice: true
      }
    })

    const revenue = monthlyRevenue._sum.totalPrice || 0

    // 5. PAGOS PENDIENTES (si tienes tabla de pagos)
    let pendingPayments = 0
    let pendingPaymentsAmount = 0
    
    try {
      const payments = await prisma.payment.aggregate({
        where: {
          status: 'PENDING',
          student: {
            teacherId
          }
        },
        _sum: {
          amount: true
        },
        _count: true
      })
      
      pendingPayments = payments._count
      pendingPaymentsAmount = payments._sum.amount || 0
    } catch (error) {
      // Tabla Payment puede no existir aún
      console.log('Payment table not found, skipping')
    }

    return NextResponse.json({
      activeStudents,
      classesToday,
      pendingBookings,
      monthlyRevenue: revenue,
      pendingPayments,
      pendingPaymentsAmount,
      currentMonth: startOfMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
