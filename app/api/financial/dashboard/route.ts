import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/financial/dashboard - Obtener resumen financiero
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener el perfil del profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Perfil de profesor no encontrado" },
        { status: 404 }
      )
    }

    // Obtener todos los pagos del profesor
    const allPayments = await prisma.payment.findMany({
      where: {
        student: {
          teacherId: teacherProfile.id
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Obtener todos los alumnos activos
    const activeStudents = await prisma.studentProfile.findMany({
      where: {
        teacherId: teacherProfile.id,
        status: {
          in: ["ACTIVE", "TRIAL"]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        payments: {
          where: {
            status: "PENDING",
            dueDate: {
              lt: new Date()
            }
          },
          orderBy: {
            dueDate: "asc"
          }
        }
      }
    })

    // Calcular métricas del mes actual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyPayments = allPayments.filter(p => {
      const paidDate = p.paidAt ? new Date(p.paidAt) : null
      return paidDate && paidDate >= startOfMonth && paidDate <= endOfMonth
    })

    const monthlyIncome = monthlyPayments
      .filter(p => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0)

    // Pagos pendientes
    const pendingPayments = allPayments.filter(p => p.status === "PENDING")
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    // Pagos vencidos (overdue)
    const overduePayments = pendingPayments.filter(p => {
      if (!p.dueDate) return false
      return new Date(p.dueDate) < now
    })
    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0)

    // Alumnos con deuda
    const studentsWithDebt = activeStudents.filter(s => s.payments.length > 0)

    // Últimos pagos recibidos
    const recentPayments = allPayments
      .filter(p => p.status === "PAID")
      .sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0
        const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)

    // Calcular ingreso anual
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyPayments = allPayments.filter(p => {
      const paidDate = p.paidAt ? new Date(p.paidAt) : null
      return paidDate && paidDate >= startOfYear
    })
    const yearlyIncome = yearlyPayments
      .filter(p => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0)

    // Resumen
    const summary = {
      monthlyIncome,
      yearlyIncome,
      totalPending,
      totalOverdue,
      activeStudentsCount: activeStudents.length,
      studentsWithDebtCount: studentsWithDebt.length,
      studentsUpToDateCount: activeStudents.length - studentsWithDebt.length,
      pendingPaymentsCount: pendingPayments.length,
      overduePaymentsCount: overduePayments.length,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        description: p.description,
        method: p.method,
        paidAt: p.paidAt,
        studentName: p.student.user.name,
        studentId: p.student.id
      })),
      studentsWithDebt: studentsWithDebt.map(s => ({
        id: s.id,
        name: s.user.name,
        overduePayments: s.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          description: p.description,
          dueDate: p.dueDate,
          daysOverdue: p.dueDate ? Math.floor((now.getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }))
      })),
      monthlyTrend: [
        // Últimos 6 meses
        ...Array.from({ length: 6 }, (_, i) => {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59)
          
          const monthPayments = allPayments.filter(p => {
            const paidDate = p.paidAt ? new Date(p.paidAt) : null
            return paidDate && paidDate >= monthDate && paidDate <= monthEnd && p.status === "PAID"
          })
          
          return {
            month: monthDate.toLocaleDateString("es-CL", { month: "short", year: "numeric" }),
            income: monthPayments.reduce((sum, p) => sum + p.amount, 0)
          }
        })
      ]
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error("Error al obtener dashboard financiero:", error)
    return NextResponse.json(
      { error: "Error al obtener dashboard financiero" },
      { status: 500 }
    )
  }
}
