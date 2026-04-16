import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET /api/financial/dashboard - Obtener resumen financiero
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del profesor vía Supabase
    const { data: teacherProfile } = await supabaseAdmin
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Obtener todos los pagos del profesor vía Supabase
    const { data: allPayments, error: paymentsError } = await supabase
      .from('Payment')
      .select(`
        *,
        student:StudentProfile(
          id,
          name,
          user:User(id, name, email)
        )
      `)
      .eq('student.teacherId', teacherProfile.id)

    if (paymentsError) throw paymentsError

    // Obtener todos los alumnos activos
    const { data: activeStudents, error: studentsError } = await supabase
      .from('StudentProfile')
      .select(`
        *,
        user:User(id, name),
        payments:Payment(*)
      `)
      .eq('teacherId', teacherProfile.id)
      .in('status', ['ACTIVE', 'TRIAL'])

    if (studentsError) throw studentsError

    // -- Lógica de Negocio (Igual que antes pero con datos de Supabase) --
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyPayments = allPayments?.filter(p => {
      const paidDate = p.paidAt ? new Date(p.paidAt) : null
      return paidDate && paidDate >= startOfMonth && paidDate <= endOfMonth
    }) || []

    const monthlyIncome = monthlyPayments
      .filter(p => p.status === "PAID")
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    const pendingPayments = allPayments?.filter(p => p.status === "PENDING") || []
    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    const overduePayments = pendingPayments.filter(p => {
      if (!p.dueDate) return false
      return new Date(p.dueDate) < now
    })
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Alumnos con deuda
    const studentsWithDebt = activeStudents?.filter(s => 
      s.payments?.some((p: any) => p.status === "PENDING" && p.dueDate && new Date(p.dueDate) < now)
    ) || []

    const recentPayments = allPayments
      ?.filter(p => p.status === "PAID")
      .sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0
        const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10) || []

    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyIncome = allPayments
      ?.filter(p => p.status === "PAID" && p.paidAt && new Date(p.paidAt) >= startOfYear)
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const summary = {
      monthlyIncome,
      yearlyIncome,
      totalPending,
      totalOverdue,
      activeStudentsCount: activeStudents?.length || 0,
      studentsWithDebtCount: studentsWithDebt.length,
      studentsUpToDateCount: (activeStudents?.length || 0) - studentsWithDebt.length,
      pendingPaymentsCount: pendingPayments.length,
      overduePaymentsCount: overduePayments.length,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        description: p.description,
        method: p.method,
        paidAt: p.paidAt,
        studentName: (p.student as any)?.user?.name || "Desconocido",
        studentId: (p.student as any)?.id
      })),
      studentsWithDebt: studentsWithDebt.map(s => ({
        id: s.id,
        name: s.user.name,
        overduePayments: s.payments
          ?.filter((p: any) => p.status === "PENDING" && p.dueDate && new Date(p.dueDate) < now)
          .map((p: any) => ({
            id: p.id,
            amount: p.amount,
            description: p.description,
            dueDate: p.dueDate,
            daysOverdue: Math.floor((now.getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          }))
      })),
      monthlyTrend: Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59)
        
        const mPayments = allPayments?.filter(p => {
          const pDate = p.paidAt ? new Date(p.paidAt) : null
          return pDate && pDate >= monthDate && pDate <= monthEnd && p.status === "PAID"
        }) || []
        
        return {
          month: monthDate.toLocaleDateString("es-CL", { month: "short", year: "numeric" }),
          income: mPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
        }
      })
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error("Error al obtener dashboard financiero:", error)
    return NextResponse.json({ error: "Error al obtener dashboard financiero" }, { status: 500 })
  }
}
