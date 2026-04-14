import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// GET /api/classes/[id] - Obtener una clase específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: classId } = await params

    // Obtener la clase con toda su información vía Supabase
    const { data: classData, error: classError } = await supabase
      .from('Class')
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email, phone),
          teacher:TeacherProfile(
            userId,
            user:User(*)
          )
        ),
        notes:ClassNote(*),
        tasks:Task(*)
      `)
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    // Verificar que la clase pertenece al profesor logueado
    if ((classData.student as any)?.teacher?.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para ver esta clase" }, { status: 403 })
    }

    // Ordenar notas y tareas manualment si es necesario (o vía query)
    classData.notes = classData.notes?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    classData.tasks = classData.tasks?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(classData)

  } catch (error) {
    console.error("Error al obtener clase:", error)
    return NextResponse.json({ error: "Error al obtener clase" }, { status: 500 })
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: classId } = await params
    const body = await request.json()

    // Verificar existencia y pertenencia
    const { data: existingClass } = await supabase
      .from('Class')
      .select('status, studentId, student:StudentProfile(teacherId, teacher:TeacherProfile(userId))')
      .eq('id', classId)
      .single()

    if (!existingClass) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    if ((existingClass.student as any)?.teacher?.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para editar esta clase" }, { status: 403 })
    }

    // Preparar datos de actualización
    const updateData: any = {
      status: body.status,
      date: body.scheduledDate || body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      duration: body.duration,
      modalidad: body.modalidad,
      attendanceMarked: body.attendanceMarked,
      cancelReason: body.cancelReason
    }

    // Lógica de fechas automáticas
    if (body.status === "CONFIRMED" && existingClass.status !== "CONFIRMED") {
      updateData.confirmedAt = new Date().toISOString()
      updateData.confirmedBy = "teacher"
    }
    if (body.status === "COMPLETED" && existingClass.status !== "COMPLETED") {
      updateData.completedAt = new Date().toISOString()
    }
    if (body.status === "CANCELLED" && existingClass.status !== "CANCELLED") {
      updateData.cancelledAt = new Date().toISOString()
    }
    if (body.status === "DELETED" && existingClass.status !== "DELETED") {
      updateData.deletedAt = new Date().toISOString()
    }

    const { data: updatedClass, error: updateError } = await supabase
      .from('Class')
      .update(updateData)
      .eq('id', classId)
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email)
        )
      `)
      .single()

    if (updateError) throw updateError

    // Si la clase se completó, actualizar métricas del alumno
    if (body.status === "COMPLETED" && existingClass.status !== "COMPLETED") {
      const { data: studentMetrics } = await supabase
        .from('StudentProfile')
        .select('totalClassesTaken')
        .eq('id', existingClass.studentId)
        .single()
      
      await supabase
        .from('StudentProfile')
        .update({
          totalClassesTaken: (studentMetrics?.totalClassesTaken || 0) + 1,
          lastClassDate: new Date().toISOString()
        })
        .eq('id', existingClass.studentId)
    }

    return NextResponse.json({
      message: "Clase actualizada exitosamente",
      class: updatedClass
    })

  } catch (error) {
    console.error("Error al actualizar clase:", error)
    return NextResponse.json({ error: "Error al actualizar clase" }, { status: 500 })
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: classId } = await params

    const { data: existingClass } = await supabase
      .from('Class')
      .select('student:StudentProfile(teacher:TeacherProfile(userId))')
      .eq('id', classId)
      .single()

    if (!existingClass) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    if ((existingClass.student as any)?.teacher?.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para cancelar esta clase" }, { status: 403 })
    }

    const { error: cancelError } = await supabase
      .from('Class')
      .update({
        status: "CANCELLED",
        cancelledAt: new Date().toISOString()
      })
      .eq('id', classId)

    if (cancelError) throw cancelError

    return NextResponse.json({ message: "Clase cancelada exitosamente" })

  } catch (error) {
    console.error("Error al cancelar clase:", error)
    return NextResponse.json({ error: "Error al cancelar clase" }, { status: 500 })
  }
}
