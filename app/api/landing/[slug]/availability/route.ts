import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAvailableSlots } from "@/lib/availability"

// Cliente público (solo anon key — sin sesión de usuario)
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // 1. Resolver slug → teacher_id (soporta slug o UUID fallback)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    let teacherQuery = supabasePublic.from("TeacherProfile").select("id")

    if (isUuid) {
      teacherQuery = teacherQuery.or(`slug.eq.${slug},id.eq.${slug}`)
    } else {
      teacherQuery = teacherQuery.eq("slug", slug)
    }

    const { data: teacher, error: teacherErr } = await teacherQuery.maybeSingle()

    if (teacherErr || !teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 })
    }

    const teacherId = teacher.id

    // 2. Calcular los próximos 14 días con disponibilidad
    const today = new Date()
    const results: { date: string; slots: string[] }[] = []

    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

      // Duración estándar de clase de prueba: 60 min
      const slots = await getAvailableSlots(dateStr, teacherId, 60)

      if (slots.length > 0) {
        results.push({ date: dateStr, slots })
      }
    }

    return NextResponse.json(
      { teacherId, availability: results },
      {
        status: 200,
        headers: {
          // Cache por 5 minutos — equilibrio entre frescura y performance
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    )
  } catch (err: any) {
    console.error("[landing/availability] Error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
