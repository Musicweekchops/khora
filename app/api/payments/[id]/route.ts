import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET /api/payments/[id] - Obtener un pago específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: paymentId } = await params

    const { data: payment, error } = await supabase
      .from('Payment')
      .select('*, student:StudentProfile(*, user:User(id, name, email, phone), teacher:TeacherProfile(id, userId))')
      .eq('id', paymentId)
      .single()

    if (error || !payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    if ((payment.student as any).teacher.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para ver este pago" }, { status: 403 })
    }

    return NextResponse.json(payment)

  } catch (error) {
    console.error("Error al obtener pago:", error)
    return NextResponse.json({ error: "Error al obtener pago" }, { status: 500 })
  }
}

// PUT /api/payments/[id] - Actualizar pago
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: paymentId } = await params
    const body = await request.json()

    // Verificar propiedad
    const { data: existingPayment } = await supabase
      .from('Payment')
      .select('*, student:StudentProfile(*, teacher:TeacherProfile(*))')
      .eq('id', paymentId)
      .single()

    if (!existingPayment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    if ((existingPayment.student as any).teacher.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const wasPaid = existingPayment.status === "PAID" || existingPayment.status === "COMPLETED"
    const isNowPaid = body.status === "PAID" || body.status === "COMPLETED"

    // Actualizar pago
    const { data: updatedPayment, error: uError } = await supabaseAdmin
      .from('Payment')
      .update({
        amount: body.amount ? parseFloat(body.amount) : undefined,
        description: body.description,
        method: body.method,
        status: body.status,
        date: body.date ? body.date : undefined
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (uError) throw uError

    // LTV adjustment
    if (!wasPaid && isNowPaid) {
      const { data: profile } = await supabaseAdmin.from('StudentProfile').select('lifetimeValue').eq('id', existingPayment.studentId).single()
      await supabaseAdmin.from('StudentProfile').update({ lifetimeValue: (profile?.lifetimeValue || 0) + existingPayment.amount }).eq('id', existingPayment.studentId)
    }

    return NextResponse.json({ message: "Pago actualizado", payment: updatedPayment })

  } catch (error) {
    console.error("Error al actualizar pago:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// DELETE /api/payments/[id] - Eliminar pago
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: paymentId } = await params

    const { data: existingPayment } = await supabase
      .from('Payment')
      .select('*, student:StudentProfile(*, teacher:TeacherProfile(*))')
      .eq('id', paymentId)
      .single()

    if (!existingPayment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    if ((existingPayment.student as any).teacher.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Adjust LTV if it was paid
    if (existingPayment.status === "PAID" || existingPayment.status === "COMPLETED") {
      const { data: profile } = await supabaseAdmin.from('StudentProfile').select('lifetimeValue').eq('id', existingPayment.studentId).single()
      await supabaseAdmin.from('StudentProfile').update({ lifetimeValue: Math.max(0, (profile?.lifetimeValue || 0) - existingPayment.amount) }).eq('id', existingPayment.studentId)
    }

    await supabaseAdmin.from('Payment').delete().eq('id', paymentId)

    return NextResponse.json({ message: "Pago eliminado exitosamente" })

  } catch (error) {
    console.error("Error al eliminar pago:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
