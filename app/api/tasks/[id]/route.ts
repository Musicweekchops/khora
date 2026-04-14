import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PUT /api/tasks/[id] - Actualizar tarea (marcar completada, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: taskId } = await params
    const body = await request.json()

    // Obtener la tarea existente
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos
    const isTeacher = session.user.role === "TEACHER" && existingTask.student.teacher.userId === session.user.id
    const isStudent = session.user.role === "STUDENT" && existingTask.student.userId === session.user.id

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { error: "No autorizado para editar esta tarea" },
        { status: 403 }
      )
    }

    // Actualizar la tarea
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completed: body.completed,
        completedAt: body.completed && !existingTask.completedAt ? new Date() : existingTask.completedAt,
        feedback: body.feedback
      }
    })

    return NextResponse.json({
      message: "Tarea actualizada exitosamente",
      task: updatedTask
    })

  } catch (error) {
    console.error("Error al actualizar tarea:", error)
    return NextResponse.json(
      { error: "Error al actualizar tarea" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Eliminar tarea
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

    const { id: taskId } = await params

    // Verificar que la tarea existe y pertenece al profesor
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    if (existingTask.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta tarea" },
        { status: 403 }
      )
    }

    // Eliminar la tarea
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({
      message: "Tarea eliminada exitosamente"
    })

  } catch (error) {
    console.error("Error al eliminar tarea:", error)
    return NextResponse.json(
      { error: "Error al eliminar tarea" },
      { status: 500 }
    )
  }
}
