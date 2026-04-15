import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

// GET /api/students - Obtener todos los alumnos del profesor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del profesor
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Obtener todos los alumnos del profesor vía Supabase
    const { data: students, error } = await supabase
      .from('StudentProfile')
      .select(`
        *,
        user:User (id, email, name, phone),
        classes:Class (id, date, status),
        payments:Payment (id, status)
      `)
      .eq('teacherId', teacherProfile.id)
      .order('createdAt', { ascending: false })

    if (error) throw error

    // Formatear respuesta
    const formattedStudents = (students || []).map(student => ({
      id: student.id,
      userId: (student.user as any).id,
      name: (student.user as any).name,
      email: (student.user as any).email,
      phone: (student.user as any).phone,
      status: student.status,
      // Usar campos consistentes con el nuevo SQL
      totalClassesTaken: student.totalClasses || 0,
      lifetimeValue: student.lifetimeValue || 0,
      lastClassDate: student.lastClassDate,
      hasPendingPayments: (student.payments as any[]).some(p => p.status === 'PENDING'),
      createdAt: student.createdAt
    }))

    return NextResponse.json(formattedStudents)

  } catch (error) {
    console.error("Error al obtener alumnos:", error)
    return NextResponse.json({ error: "Error al obtener alumnos" }, { status: 500 })
  }
}

// POST /api/students - Crear nuevo alumno
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password, status = "ACTIVE" } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Obtener el perfil del profesor
    const { data: teacherProfile } = await supabase
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password || email.split("@")[0] + "123", 10)

    // Crear usuario y perfil de estudiante (secuencialmente con supabaseAdmin)
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .insert({ email, name, phone, password: hashedPassword, role: "STUDENT" })
      .select()
      .single()

    if (userError) throw userError

    const { data: studentProfile, error: profileError } = await supabaseAdmin
      .from('StudentProfile')
      .insert({
        userId: user.id,
        teacherId: teacherProfile.id,
        status,
        phone // Duplicar teléfono en perfil si se requiere
      })
      .select('*, user:User(id, email, name, phone)')
      .single()

    if (profileError) throw profileError

    return NextResponse.json({ 
      message: "Alumno creado exitosamente",
      student: {
        id: studentProfile.id,
        name: (studentProfile.user as any).name,
        email: (studentProfile.user as any).email,
        phone: (studentProfile.user as any).phone,
        status: studentProfile.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear alumno:", error)
    return NextResponse.json({ error: "Error al crear alumno" }, { status: 500 })
  }
}
