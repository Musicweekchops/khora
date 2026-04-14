import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/payments - Obtener pagos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")

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

    // Construir filtros
    const where: any = {
      student: {
        teacherId: teacherProfile.id
      }
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    // Obtener pagos
    const payments = await prisma.payment.findMany({
      where,
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
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(payments)

  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    )
  }
}

// POST /api/payments - Crear nuevo pago (manual)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
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

    // Validaciones
    if (!studentId || !amount || !description) {
      return NextResponse.json(
        { error: "Alumno, monto y descripción son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el alumno pertenece al profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Perfil de profesor no encontrado" },
        { status: 404 }
      )
    }

    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        teacherId: teacherProfile.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      )
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        description,
        method,
        status,
        paidAt: paidAt ? new Date(paidAt) : status === "PAID" ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        referenceNumber,
        notes,
        planId,
        isAutomatic: false
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

    // Si el pago está pagado, actualizar el LTV del alumno
    if (status === "PAID") {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          lifetimeValue: {
            increment: parseFloat(amount)
          }
        }
      })
    }

    return NextResponse.json(
      {
        message: "Pago registrado exitosamente",
        payment
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error al crear pago:", error)
    return NextResponse.json(
      { error: "Error al crear pago" },
      { status: 500 }
    )
  }
}
