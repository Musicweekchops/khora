import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// POST /api/classes/[id]/notes - Agregar nota a una clase
export async function POST(
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
    const { content, topics = [] } = body

    if (!content) {
      return NextResponse.json({ error: "El contenido de la nota es requerido" }, { status: 400 })
    }

    // Verificar que la clase existe y pertenece al profesor vía join
    const { data: classData, error: classError } = await supabase
      .from('Class')
      .select('*, student:StudentProfile(*, teacher:TeacherProfile(*))')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 })
    }

    const teacherUserId = (classData.student as any)?.teacher?.userId
    if (teacherUserId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para agregar notas a esta clase" }, { status: 403 })
    }

    // Crear la nota
    const { data: note, error: noteError } = await supabaseAdmin
      .from('ClassNote')
      .insert({
        classId,
        studentId: classData.studentId,
        content,
        topics: JSON.stringify(topics)
      })
      .select()
      .single()

    if (noteError) throw noteError

    return NextResponse.json({ message: "Nota agregada exitosamente", note }, { status: 201 })

  } catch (error) {
    console.error("Error al agregar nota:", error)
    return NextResponse.json({ error: "Error al agregar nota" }, { status: 500 })
  }
}
