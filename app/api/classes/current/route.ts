import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET /api/classes/current - Obtener clase actual o próxima del día
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el perfil del profesor vía Supabase
    const { data: teacherProfile } = await supabaseAdmin
      .from('TeacherProfile')
      .select('id')
      .eq('userId', session.user.id)
      .single()

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    // Obtener fecha actual
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]

    // Obtener todas las clases de hoy vía Supabase
    const { data: todayClasses, error: classesError } = await supabase
      .from('Class')
      .select(`
        *,
        student:StudentProfile (
          *,
          user:User (id, name, email, phone)
        ),
        notes:ClassNote (*),
        tasks:Task (*)
      `)
      .eq('date', dateStr)
      .not('status', 'eq', 'CANCELLED')
      .order('startTime', { ascending: true })

    if (classesError) throw classesError

    if (!todayClasses || todayClasses.length === 0) {
      return NextResponse.json({ currentClass: null, nextClass: null, isInProgress: false })
    }

    // Buscar clase en curso o próxima
    let currentClass = null
    let nextClass = null
    let isInProgress = false

    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    for (const cls of todayClasses) {
      if (!cls.startTime) continue
      
      const [hours, minutes] = cls.startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + (cls.duration || 60)

      // Verificar si la clase está en curso
      if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
        currentClass = cls
        isInProgress = true
        break
      }

      // Buscar la próxima
      if (nowMinutes < startMinutes && !nextClass) {
        nextClass = cls
      }
    }

    if (currentClass) {
      return NextResponse.json({ currentClass, nextClass: null, isInProgress: true })
    }

    return NextResponse.json({ currentClass: nextClass, nextClass: null, isInProgress: false })

  } catch (error) {
    console.error("Error al obtener clase actual:", error)
    return NextResponse.json({ error: "Error al obtener clase actual" }, { status: 500 })
  }
}
