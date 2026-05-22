import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { getTemplate } from "../send-email/templates.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <hola@khora.cl>"

serve(async (req) => {
  // Configuración de Supabase (usamos Service Role para ignorar RLS en este proceso de sistema)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let targetDate = ''

    // Intentar leer parámetros de fecha del cuerpo (para re-intentos manuales)
    try {
      if (req.method === "POST") {
        const body = await req.json()
        if (body.targetDate) targetDate = body.targetDate
      }
    } catch (_) {
      // Ignorar si no hay cuerpo JSON o falla la lectura
    }

    if (!targetDate) {
      // 1. Obtener la fecha de HOY en la zona horaria de Chile (America/Santiago)
      const now = new Date()
      const formatterDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })
      targetDate = formatterDate.format(now)
    }

    // 2. Buscar todas las clases programadas para este día
    const { data: classes, error: classesError } = await supabase
      .from("Class")
      .select(`
        id,
        date,
        start_time,
        StudentProfile!inner (
          User!inner ( name, email )
        ),
        TeacherProfile!inner (
          User!inner ( name, email )
        )
      `)
      .eq("date", targetDate)
      .eq("status", "SCHEDULED")

    if (classesError) throw classesError

    if (!classes || classes.length === 0) {
      return new Response(JSON.stringify({ message: `No hay clases programadas para la fecha ${targetDate}` }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    // 3. Preparar correos para enviar con Resend
    let sentCount = 0

    for (const cls of classes) {
      // Extraer datos (manejo de posibles arrays o únicos dependiedo de la relación)
      const studentUser = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0]?.User : cls.StudentProfile?.User
      const teacherUser = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0]?.User : cls.TeacherProfile?.User

      const sUser = Array.isArray(studentUser) ? studentUser[0] : studentUser
      const tUser = Array.isArray(teacherUser) ? teacherUser[0] : teacherUser

      if (sUser?.email && tUser?.email) {
        // Retraso secuencial (jitter) para evitar que los proveedores de correo marquen envíos masivos como spam
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))

        // Personalización dinámica del asunto para romper la firma de patrones idénticos (anti-spam)
        const subjectOptions = [
          `🎶 ¡Hola ${sUser.name}! Hoy tienes clase de música con ${tUser.name}`,
          `🎸 ${sUser.name}, te recordamos tu clase de hoy con ${tUser.name}`,
          `🥁 ¡Hola! Tu clase con ${tUser.name} está programada para hoy`
        ]
        const dynamicSubject = subjectOptions[cls.id.charCodeAt(cls.id.length - 1) % subjectOptions.length]

        // Enviar correo al alumno
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: sUser.email,
            subject: dynamicSubject,
            html: getTemplate('CLASS_REMINDER', {
              studentName: sUser.name,
              teacherName: tUser.name,
              date: cls.date,
              time: cls.start_time.slice(0, 5),
              link: `https://khora.cl/confirmar-clase?id=${cls.id}`,
              isToday: true
            }),
          }),
        })

        if (resendRes.ok) {
          sentCount++
        } else {
          console.error("Error enviando a alumno:", await resendRes.text())
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Proceso completado. ${sentCount} recordatorios enviados.` 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
