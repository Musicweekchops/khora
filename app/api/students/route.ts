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

    // Obtener el perfil del profesor vía Supabase
    const { data: teacherProfile, error: teacherError } = await supabaseAdmin
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (teacherError || !teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Obtener todos los alumnos del profesor con joins estilo Supabase
    const { data: students, error: studentsError } = await supabase
      .from('StudentProfile')
      .select(`
        *,
        user:User(id, email, name, phone),
        classes:Class(id, date, status),
        payments:Payment(id, status)
      `)
      .eq('teacherId', teacherProfile.id)
      .order('createdAt', { ascending: false })

    if (studentsError) throw studentsError

    // Formatear respuesta (mismo formato que antes para no romper el front)
    const formattedStudents = students.map((student: any) => {
      const lastClass = student.classes
        ?.filter((c: any) => c.status === "COMPLETED")
        ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      return {
        id: student.id,
        userId: student.user?.id,
        name: student.user?.name,
        email: student.user?.email,
        phone: student.user?.phone,
        status: student.status,
        leadSource: student.leadSource,
        modalidad: student.modalidad,
        preferredDay: student.preferredDay,
        preferredTime: student.preferredTime,
        totalClassesTaken: student.totalClassesTaken,
        lifetimeValue: student.lifetimeValue,
        lastClassDate: student.lastClassDate || lastClass?.date,
        hasPendingPayments: student.payments?.some((p: any) => p.status === "PENDING"),
        createdAt: student.createdAt
      }
    })

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
    const { 
      name, 
      email, 
      phone,
      password,
      status = "PROSPECT",
      leadSource,
      modalidad = "online",
      preferredDay,
      preferredTime,
      emergencyContact,
      emergencyPhone
    } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe vía Supabase
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Obtener el perfil del profesor
    const { data: teacherProfile } = await supabaseAdmin
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(
      password || email.split("@")[0] + "123", 
      10
    )

    // Simular transacción con sequential inserts y cleanup manual si falla
    // PASO 1: Crear Usuario
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('User')
      .insert({
        email,
        name,
        phone,
        password: hashedPassword,
        role: "STUDENT"
      })
      .select()
      .single()

    if (userError) throw userError

    // PASO 2: Crear Perfil de Estudiante
    const { data: student, error: profileError } = await supabaseAdmin
      .from('StudentProfile')
      .insert({
        userId: newUser.id,
        teacherId: teacherProfile.id,
        status,
        leadSource,
        modalidad,
        preferredDay,
        preferredTime,
        emergencyContact,
        emergencyPhone
      })
      .select(`
        *,
        user:User(id, email, name, phone)
      `)
      .single()

    if (profileError) {
      // Rollback manual (borrar usuario si falla el perfil)
      await supabaseAdmin.from('User').delete().eq('id', newUser.id)
      throw profileError
    }

    return NextResponse.json({ 
      message: "Alumno creado exitosamente",
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        status: student.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear alumno:", error)
    return NextResponse.json({ error: "Error al crear alumno" }, { status: 500 })
  }
}
