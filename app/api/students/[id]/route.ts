import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/students/[id] - Obtener un alumno específico
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

    // Await params in Next.js 15
    const { id: studentId } = await params

    // Obtener el alumno con toda su información
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        classes: {
          orderBy: {
            date: "desc"
          },
          take: 10
        },
        payments: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        },
        tasks: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        },
        subscriptions: {
          where: {
            isActive: true
          },
          include: {
            plan: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el alumno pertenece al profesor logueado
    if (student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para ver este alumno" },
        { status: 403 }
      )
    }

    return NextResponse.json(student)

  } catch (error) {
    console.error("Error al obtener alumno:", error)
    return NextResponse.json(
      { error: "Error al obtener alumno" },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Actualizar alumno
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

    // Await params in Next.js 15
    const { id: studentId } = await params
    const body = await request.json()

    // Verificar que el alumno existe y pertenece al profesor
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        teacher: true,
        user: true
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      )
    }

    if (existingStudent.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para editar este alumno" },
        { status: 403 }
      )
    }

    // Actualizar usuario y perfil en transacción
    const updated = await prisma.$transaction(async (tx) => {
      // Actualizar datos del usuario
      if (body.name || body.email || body.phone) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            name: body.name,
            email: body.email,
            phone: body.phone
          }
        })
      }

      // Actualizar perfil de estudiante
      const updatedProfile = await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          status: body.status,
          leadSource: body.leadSource,
          modalidad: body.modalidad,
          preferredDay: body.preferredDay,
          preferredTime: body.preferredTime,
          emergencyContact: body.emergencyContact,
          emergencyPhone: body.emergencyPhone
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true
            }
          }
        }
      })

      return updatedProfile
    })

    return NextResponse.json({
      message: "Alumno actualizado exitosamente",
      student: updated
    })

  } catch (error) {
    console.error("Error al actualizar alumno:", error)
    return NextResponse.json(
      { error: "Error al actualizar alumno" },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Desactivar alumno (soft delete)
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

    // Await params in Next.js 15
    const { id: studentId } = await params

    // Verificar que el alumno existe y pertenece al profesor
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        teacher: true
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      )
    }

    if (existingStudent.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este alumno" },
        { status: 403 }
      )
    }

    // Soft delete: cambiar estado a INACTIVE
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        status: "INACTIVE"
      }
    })

    return NextResponse.json({
      message: "Alumno desactivado exitosamente"
    })

  } catch (error) {
    console.error("Error al desactivar alumno:", error)
    return NextResponse.json(
      { error: "Error al desactivar alumno" },
      { status: 500 }
    )
  }
}
