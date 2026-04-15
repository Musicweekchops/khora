import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET /api/students/[id] - Obtener un alumno específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: studentId } = await params

    const { data: student, error } = await supabase
      .from('StudentProfile')
      .select(`
        *,
        user:User (id, email, name, phone, createdAt),
        teacher:TeacherProfile (*),
        classes:Class (*),
        payments:Payment (*),
        tasks:Task (*)
      `)
      .eq('id', studentId)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    if ((student.teacher as any).userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(student)

  } catch (error) {
    console.error("Error al obtener alumno:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: studentId } = await params
    const body = await request.json()

    // Verificar propiedad
    const { data: existingStudent } = await supabase
      .from('StudentProfile')
      .select('*, teacher:TeacherProfile(*)')
      .eq('id', studentId)
      .single()

    if (!existingStudent) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    if ((existingStudent.teacher as any).userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Actualizar usuario si es necesario
    if (body.name || body.email || body.phone) {
      await supabaseAdmin.from('User').update({
        name: body.name,
        email: body.email,
        phone: body.phone
      }).eq('id', existingStudent.userId)
    }

    // Actualizar perfil
    const { data: updatedProfile, error: uError } = await supabaseAdmin
      .from('StudentProfile')
      .update({
        status: body.status,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
        notes: body.notes
      })
      .eq('id', studentId)
      .select('*, user:User(id, email, name, phone)')
      .single()

    if (uError) throw uError

    return NextResponse.json({ message: "Alumno actualizado exitosamente", student: updatedProfile })

  } catch (error) {
    console.error("Error al actualizar alumno:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: studentId } = await params

    const { data: existingStudent } = await supabase
      .from('StudentProfile')
      .select('*, teacher:TeacherProfile(*)')
      .eq('id', studentId)
      .single()

    if (!existingStudent) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    if ((existingStudent.teacher as any).userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Soft delete: cambiar estado a INACTIVE
    await supabaseAdmin.from('StudentProfile').update({ status: "INACTIVE" }).eq('id', studentId)

    return NextResponse.json({ message: "Alumno desactivado exitosamente" })

  } catch (error) {
    console.error("Error al desactivar alumno:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
