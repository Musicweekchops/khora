import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/classes/[id] - Obtener una clase específica
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

    const { id: classId } = await params

    // Obtener la clase con toda su información
    const classData = await prisma.class.findUnique({
      where: { id: classId },
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
        notes: {
          orderBy: {
            createdAt: "desc"
          }
        },
        tasks: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que la clase pertenece al profesor logueado
    if (classData.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para ver esta clase" },
        { status: 403 }
      )
    }

    return NextResponse.json(classData)

  } catch (error) {
    console.error("Error al obtener clase:", error)
    return NextResponse.json(
      { error: "Error al obtener clase" },
      { status: 500 }
    )
  }
}

// PUT /api/classes/[id] - Actualizar clase (estado, notas, etc.)
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

    const { id: classId } = await params
    const body = await request.json()

    // Verificar que la clase existe y pertenece al profesor
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      )
    }

    if (existingClass.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para editar esta clase" },
        { status: 403 }
      )
    }

    // Actualizar la clase
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        status: body.status,
        date: body.scheduledDate ? new Date(body.scheduledDate) : body.date ? new Date(body.date) : undefined,
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration,
        modalidad: body.modalidad,
        confirmedAt: body.status === "CONFIRMED" && !existingClass.confirmedAt ? new Date() : existingClass.confirmedAt,
        confirmedBy: body.status === "CONFIRMED" && !existingClass.confirmedBy ? "teacher" : existingClass.confirmedBy,
        completedAt: body.status === "COMPLETED" && !existingClass.completedAt ? new Date() : existingClass.completedAt,
        attendanceMarked: body.attendanceMarked ?? existingClass.attendanceMarked,
        cancelledAt: body.status === "CANCELLED" && !existingClass.cancelledAt ? new Date() : existingClass.cancelledAt,
        cancelReason: body.cancelReason,
        deletedAt: body.status === "DELETED" && !existingClass.deletedAt ? new Date() : body.deletedAt ? new Date(body.deletedAt) : existingClass.deletedAt
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

    // Si la clase se completó, actualizar métricas del alumno
    if (body.status === "COMPLETED" && existingClass.status !== "COMPLETED") {
      await prisma.studentProfile.update({
        where: { id: existingClass.studentId },
        data: {
          totalClassesTaken: {
            increment: 1
          },
          lastClassDate: new Date()
        }
      })
    }

    return NextResponse.json({
      message: "Clase actualizada exitosamente",
      class: updatedClass
    })

  } catch (error) {
    console.error("Error al actualizar clase:", error)
    return NextResponse.json(
      { error: "Error al actualizar clase" },
      { status: 500 }
    )
  }
}

// DELETE /api/classes/[id] - Cancelar clase
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

    const { id: classId } = await params

    // Verificar que la clase existe y pertenece al profesor
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      )
    }

    if (existingClass.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para cancelar esta clase" },
        { status: 403 }
      )
    }

    // Cancelar la clase (soft delete - cambiar estado)
    await prisma.class.update({
      where: { id: classId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Clase cancelada exitosamente"
    })

  } catch (error) {
    console.error("Error al cancelar clase:", error)
    return NextResponse.json(
      { error: "Error al cancelar clase" },
      { status: 500 }
    )
  }
}
