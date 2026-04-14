import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/payments/[id] - Obtener un pago específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: paymentId } = await params

    // Obtener el pago
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            teacher: {
              include: {
                user: true
              }
            }
          }
        },
        plan: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el pago pertenece al profesor logueado
    if (payment.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para ver este pago" },
        { status: 403 }
      )
    }

    return NextResponse.json(payment)

  } catch (error) {
    console.error("Error al obtener pago:", error)
    return NextResponse.json(
      { error: "Error al obtener pago" },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: paymentId } = await params
    const body = await request.json()

    // Verificar que el pago existe y pertenece al profesor
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      )
    }

    if (existingPayment.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para editar este pago" },
        { status: 403 }
      )
    }

    // Si cambia de PENDING a PAID, actualizar LTV
    const wasUnpaid = existingPayment.status !== "PAID"
    const nowPaid = body.status === "PAID"

    // Actualizar el pago
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount: body.amount ? parseFloat(body.amount) : undefined,
        description: body.description,
        method: body.method,
        status: body.status,
        paidAt: body.status === "PAID" && !existingPayment.paidAt ? new Date() : body.paidAt ? new Date(body.paidAt) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        referenceNumber: body.referenceNumber,
        notes: body.notes
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

    // Actualizar LTV si es necesario
    if (wasUnpaid && nowPaid) {
      await prisma.studentProfile.update({
        where: { id: existingPayment.studentId },
        data: {
          lifetimeValue: {
            increment: existingPayment.amount
          }
        }
      })
    }

    return NextResponse.json({
      message: "Pago actualizado exitosamente",
      payment: updatedPayment
    })

  } catch (error) {
    console.error("Error al actualizar pago:", error)
    return NextResponse.json(
      { error: "Error al actualizar pago" },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: paymentId } = await params

    // Verificar que el pago existe y pertenece al profesor
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      )
    }

    if (existingPayment.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este pago" },
        { status: 403 }
      )
    }

    // Si estaba pagado, restar del LTV
    if (existingPayment.status === "PAID") {
      await prisma.studentProfile.update({
        where: { id: existingPayment.studentId },
        data: {
          lifetimeValue: {
            decrement: existingPayment.amount
          }
        }
      })
    }

    // Eliminar el pago
    await prisma.payment.delete({
      where: { id: paymentId }
    })

    return NextResponse.json({
      message: "Pago eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error al eliminar pago:", error)
    return NextResponse.json(
      { error: "Error al eliminar pago" },
      { status: 500 }
    )
  }
}
