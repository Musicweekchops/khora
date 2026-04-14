import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// GET /api/classes - Obtener todas las clases del profesor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const studentId = searchParams.get("studentId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Obtener el perfil del profesor vía Supabase
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Construir query de Supabase
    let query = supabase
      .from('Class')
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email, phone)
        ),
        notes:ClassNote(*),
        tasks:Task(*)
      `)
      .order('date', { ascending: false })

    // Filtrar por profesor a través del estudiante
    query = query.eq('student.teacherId', teacherProfile.id)

    // Filtros adicionales
    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.neq('status', 'DELETED')
    }

    if (studentId) {
      query = query.eq('studentId', studentId)
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    }

    const { data: classes, error: classesError } = await query

    if (classesError) throw classesError

    return NextResponse.json(classes)

  } catch (error) {
    console.error("Error al obtener clases:", error)
    return NextResponse.json({ error: "Error al obtener clases" }, { status: 500 })
  }
}

// POST /api/classes - Crear nueva clase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      studentId,
      scheduledDate,
      duration = 60,
      modalidad,
      isTrialClass = false,
      classNumber,
      totalInPlan
    } = body

    if (!studentId || !scheduledDate || !modalidad) {
      return NextResponse.json({ error: "Alumno, fecha y modalidad son requeridos" }, { status: 400 })
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

    const classDate = new Date(scheduledDate)
    const startTime = classDate.getHours().toString().padStart(2, '0') + ':' + classDate.getMinutes().toString().padStart(2, '0')
    const endTimeObj = new Date(classDate.getTime() + duration * 60000)
    const endTime = endTimeObj.getHours().toString().padStart(2, '0') + ':' + endTimeObj.getMinutes().toString().padStart(2, '0')

    const { data: newClass, error: createError } = await supabase
      .from('Class')
      .insert({
        studentId,
        date: classDate.toISOString(),
        startTime,
        endTime,
        duration,
        modalidad,
        isTrialClass,
        classNumber,
        totalInPlan,
        status: "SCHEDULED"
      })
      .select(`
        *,
        student:StudentProfile(
          *,
          user:User(id, name, email)
        )
      `)
      .single()

    if (createError) throw createError

    return NextResponse.json({
      message: "Clase creada exitosamente",
      class: newClass
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear clase:", error)
    return NextResponse.json({ error: "Error al crear clase" }, { status: 500 })
  }
}
