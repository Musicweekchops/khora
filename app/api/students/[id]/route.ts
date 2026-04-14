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

    // Obtener el alumno con toda su información vía Supabase
    const { data: student, error: studentError } = await supabase
      .from('StudentProfile')
      .select(`
        *,
        user:User(id, email, name, phone, createdAt),
        teacher:TeacherProfile(
          *,
          user:User(*)
        ),
        classes:Class(*),
        payments:Payment(*),
        tasks:Task(*),
        subscriptions:Subscription(
          *,
          plan:PricingPlan(*)
        )
      `)
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    // Verificar que el alumno pertenece al profesor logueado
    if (student.teacher?.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para ver este alumno" }, { status: 403 })
    }

    // Aplicar los límites (take: 10) que tenía Prisma manualmente o vía query params si fuera necesario
    // Por simplicidad, truncamos aquí lo que devolvió Supabase si es mucho
    student.classes = student.classes?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    student.payments = student.payments?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
    student.tasks = student.tasks?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

    return NextResponse.json(student)

  } catch (error) {
    console.error("Error al obtener alumno:", error)
    return NextResponse.json({ error: "Error al obtener alumno" }, { status: 500 })
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

    // Verificar que el alumno existe y pertenece al profesor
    const { data: existingStudent } = await supabase
      .from('StudentProfile')
      .select('userId, teacher:TeacherProfile(userId)')
      .eq('id', studentId)
      .single()

    if (!existingStudent) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    if ((existingStudent.teacher as any).userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para editar este alumno" }, { status: 403 })
    }

    // Actualizar usuario y perfil secuencialmente (simulando transacción)
    if (body.name || body.email || body.phone) {
      const { error: userUpdateError } = await supabaseAdmin
        .from('User')
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone
        })
        .eq('id', existingStudent.userId)
      
      if (userUpdateError) throw userUpdateError
    }

    const { data: updatedProfile, error: profileUpdateError } = await supabaseAdmin
      .from('StudentProfile')
      .update({
        status: body.status,
        leadSource: body.leadSource,
        modalidad: body.modalidad,
        preferredDay: body.preferredDay,
        preferredTime: body.preferredTime,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone
      })
      .eq('id', studentId)
      .select(`
        *,
        user:User(id, email, name, phone)
      `)
      .single()

    if (profileUpdateError) throw profileUpdateError

    return NextResponse.json({
      message: "Alumno actualizado exitosamente",
      student: updatedProfile
    })

  } catch (error) {
    console.error("Error al actualizar alumno:", error)
    return NextResponse.json({ error: "Error al actualizar alumno" }, { status: 500 })
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

    // Verificar pertenencia
    const { data: existingStudent } = await supabase
      .from('StudentProfile')
      .select('teacher:TeacherProfile(userId)')
      .eq('id', studentId)
      .single()

    if (!existingStudent) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    if ((existingStudent.teacher as any).userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado para eliminar este alumno" }, { status: 403 })
    }

    // Soft delete vía Supabase
    const { error: deleteError } = await supabase
      .from('StudentProfile')
      .update({ status: "INACTIVE" })
      .eq('id', studentId)

    if (deleteError) throw deleteError

    return NextResponse.json({ message: "Alumno desactivado exitosamente" })

  } catch (error) {
    console.error("Error al desactivar alumno:", error)
    return NextResponse.json({ error: "Error al desactivar alumno" }, { status: 500 })
  }
}
