import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// GET /api/tasks - Obtener tareas (del profesor o filtradas por alumno)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const completed = searchParams.get("completed")

    let query = supabase
      .from('Task')
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name)
        ),
        class:Class(id, date)
      `)
      .order('createdAt', { ascending: false })

    if (session.user.role === "TEACHER") {
      // Profesor: obtener el perfil y filtrar por sus alumnos
      const { data: teacherProfile } = await supabase
        .from('TeacherProfile')
        .select('id')
        .eq('userId', session.user.id)
        .single()

      if (!teacherProfile) {
        return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
      }

      query = query.eq('student.teacherId', teacherProfile.id)

      if (studentId) {
        query = query.eq('studentId', studentId)
      }
    } else {
      // Alumno: solo ve sus propias tareas
      const { data: studentProfile } = await supabase
        .from('StudentProfile')
        .select('id')
        .eq('userId', session.user.id)
        .single()

      if (!studentProfile) {
        return NextResponse.json({ error: "Perfil de alumno no encontrado" }, { status: 404 })
      }

      query = query.eq('studentId', studentProfile.id)
    }

    if (completed !== null) {
      query = query.eq('completed', completed === "true")
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) throw tasksError

    return NextResponse.json(tasks)

  } catch (error) {
    console.error("Error al obtener tareas:", error)
    return NextResponse.json({ error: "Error al obtener tareas" }, { status: 500 })
  }
}

// POST /api/tasks - Crear nueva tarea
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      studentId,
      classId,
      title,
      description,
      dueDate
    } = body

    if (!studentId || !title) {
      return NextResponse.json({ error: "Alumno y título son requeridos" }, { status: 400 })
    }

    // Obtener perfil del profesor
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Verificar que el alumno pertenece al profesor
    const { data: student } = await supabase
      .from('StudentProfile')
      .select('id')
      .eq('id', studentId)
      .eq('teacherId', teacherProfile.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
    }

    const { data: task, error: createError } = await supabase
      .from('Task')
      .insert({
        studentId,
        classId: classId || null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      })
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name)
        )
      `)
      .single()

    if (createError) throw createError

    return NextResponse.json({
      message: "Tarea creada exitosamente",
      task
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear tarea:", error)
    return NextResponse.json({ error: "Error al crear tarea" }, { status: 500 })
  }
}
