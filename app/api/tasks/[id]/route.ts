import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// PUT /api/tasks/[id] - Actualizar tarea (marcar completada, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: taskId } = await params
    const body = await request.json()

    // Obtener la tarea existente vía Supabase
    const { data: existingTask, error: fetchError } = await supabase
      .from('Task')
      .select('*, student:StudentProfile(userId, teacher:TeacherProfile(userId))')
      .eq('id', taskId)
      .single()

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    // Verificar permisos
    const isTeacher = session.user.role === "TEACHER" && (existingTask.student as any)?.teacher?.userId === session.user.id
    const isStudent = session.user.role === "STUDENT" && (existingTask.student as any)?.userId === session.user.id

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: "No autorizado para editar esta tarea" }, { status: 403 })
    }

    // Actualizar la tarea
    const { data: updatedTask, error: updateError } = await supabase
      .from('Task')
      .update({
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
        completed: body.completed,
        completedAt: body.completed && !existingTask.completedAt ? new Date().toISOString() : existingTask.completedAt,
        feedback: body.feedback
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      message: "Tarea actualizada exitosamente",
      task: updatedTask
    })

  } catch (error) {
    console.error("Error al actualizar tarea:", error)
    return NextResponse.json({ error: "Error al actualizar tarea" }, { status: 500 })
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: taskId } = await params

    // Verificar pertenencia
    const { data: existingTask } = await supabase
      .from('Task')
      .select('student:StudentProfile(teacher:TeacherProfile(userId))')
      .eq('id', taskId)
      .single()

    if (!existingTask) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    if ((existingTask.student as any)?.teacher?.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para eliminar esta tarea" }, { status: 403 })
    }

    // Eliminar la tarea
    const { error: deleteError } = await supabase
      .from('Task')
      .delete()
      .eq('id', taskId)

    if (deleteError) throw deleteError

    return NextResponse.json({ message: "Tarea eliminada exitosamente" })

  } catch (error) {
    console.error("Error al eliminar tarea:", error)
    return NextResponse.json({ error: "Error al eliminar tarea" }, { status: 500 })
  }
}
