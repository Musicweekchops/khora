import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// GET /api/payments - Obtener pagos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")

    // Obtener el perfil del profesor vía Supabase
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Construir query de Supabase
    let query = supabase
      .from('Payment')
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email)
        ),
        plan:PricingPlan(id, name, price)
      `)
      .order('createdAt', { ascending: false })

    query = query.eq('student.teacherId', teacherProfile.id)

    if (studentId) {
      query = query.eq('studentId', studentId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: payments, error: paymentsError } = await query

    if (paymentsError) throw paymentsError

    return NextResponse.json(payments)

  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 })
  }
}

// POST /api/payments - Crear nuevo pago (manual)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      studentId,
      amount,
      description,
      method = "TRANSFER",
      status = "PAID",
      paidAt,
      dueDate,
      referenceNumber,
      notes,
      planId
    } = body

    if (!studentId || !amount || !description) {
      return NextResponse.json({ error: "Alumno, monto y descripción son requeridos" }, { status: 400 })
    }

    // Verificar que el alumno pertenece al profesor
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    const { data: student } = await supabase
      .from('StudentProfile')
      .select('id, lifetimeValue')
      .eq('id', studentId)
      .eq('teacherId', teacherProfile?.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    // Crear el pago
    const { data: payment, error: createError } = await supabase
      .from('Payment')
      .insert({
        studentId,
        amount: parseFloat(amount),
        description,
        method,
        status,
        paidAt: paidAt ? new Date(paidAt).toISOString() : status === "PAID" ? new Date().toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        referenceNumber,
        notes,
        planId,
        isAutomatic: false
      })
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email)
        )
      `)
      .single()

    if (createError) throw createError

    // Si el pago está pagado, actualizar el LTV del alumno (estilo Supabase: read-modify-write o RPC)
    if (status === "PAID") {
      await supabase
        .from('StudentProfile')
        .update({
          lifetimeValue: (student.lifetimeValue || 0) + parseFloat(amount)
        })
        .eq('id', studentId)
    }

    return NextResponse.json({
      message: "Pago registrado exitosamente",
      payment
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear pago:", error)
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 })
  }
}
