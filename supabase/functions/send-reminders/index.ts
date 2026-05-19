import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { getTemplate } from "../send-email/templates.ts"

// Asegúrate de agregar esta variable de entorno en Supabase:
// supabase secrets set RESEND_API_KEY="re_..."
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

// El dominio desde donde enviarás. En modo de prueba con Resend, puedes usar "onboarding@resend.dev" 
// pero solo podrás enviarte correos a ti mismo. Una vez verifiques tu dominio, cámbialo aquí.
const FROM_EMAIL = "Khora <hola@khora.cl>" 

serve(async (req) => {
  // Configuración de Supabase (usamos Service Role para ignorar RLS en este proceso de sistema)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let targetDate = ''
    let targetHour = ''

    // Intentar leer parámetros de fecha y hora del cuerpo (para re-intentos manuales)
    try {
      if (req.method === "POST") {
        const body = await req.json()
        if (body.targetDate) targetDate = body.targetDate
        if (body.targetHour) targetHour = body.targetHour
      }
    } catch (_) {
      // Ignorar si no hay cuerpo JSON o falla la lectura
    }

    if (!targetDate || !targetHour) {
      // 1. Obtener la hora objetivo (24 horas desde ahora) en la zona horaria de Chile
      const targetTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      // Formatear a YYYY-MM-DD
      const formatterDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })
      targetDate = formatterDate.format(targetTime)

      // Formatear la hora actual en esa ventana (ej. si son las 14:00, busca entre 14:00:00 y 14:59:59)
      const formatterHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', hour: '2-digit', hour12: false })
      const targetHourStr = formatterHour.format(targetTime)
      targetHour = targetHourStr === '24' ? '00' : targetHourStr.padStart(2, '0')
    }

    const startTimeLimit = `${targetHour}:00:00`
    const endTimeLimit = `${targetHour}:59:59`

    // 2. Buscar clases programadas para mañana en esta ventana de 1 hora
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
      .gte("start_time", startTimeLimit)
      .lte("start_time", endTimeLimit)
      .eq("status", "SCHEDULED")

    if (classesError) throw classesError

    if (!classes || classes.length === 0) {
      return new Response(JSON.stringify({ message: `No hay clases programadas para ${targetDate} a las ${targetHour}:00` }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    // 3. Preparar correos para enviar con Resend
    let sentCount = 0
    const teacherSummaries: Record<string, { email: string, name: string, studentNames: string[] }> = {}

    for (const cls of classes) {
      // Extraer datos (manejo de posibles arrays o únicos dependiedo de la relación)
      const studentUser = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0]?.User : cls.StudentProfile?.User
      const teacherUser = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0]?.User : cls.TeacherProfile?.User

      const sUser = Array.isArray(studentUser) ? studentUser[0] : studentUser
      const tUser = Array.isArray(teacherUser) ? teacherUser[0] : teacherUser

      if (sUser?.email && tUser?.email) {
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
            subject: "¡Recordatorio de Clase Mañana! 🥁",
            html: getTemplate('CLASS_REMINDER', {
              studentName: sUser.name,
              teacherName: tUser.name,
              date: cls.date,
              time: cls.start_time.slice(0, 5),
              link: `https://khora.cl/confirmar-clase?id=${cls.id}`
            }),
          }),
        })

        if (resendRes.ok) {
          sentCount++
          // Agrupar información para el resumen del profesor
          const tEmail = tUser.email
          if (!teacherSummaries[tEmail]) {
            teacherSummaries[tEmail] = { email: tEmail, name: tUser.name, studentNames: [] }
          }
          teacherSummaries[tEmail].studentNames.push(sUser.name)
        } else {
          console.error("Error enviando a alumno:", await resendRes.text())
        }
      }
    }

    // 4. Enviar resumen a cada profesor
    for (const tEmail in teacherSummaries) {
      const summary = teacherSummaries[tEmail]
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: summary.email,
          subject: "Resumen de recordatorios enviados hoy",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hola ${summary.name},</h2>
              <p>El sistema ha enviado exitosamente los recordatorios por correo para tus clases de mañana a los siguientes alumnos:</p>
              <ul>
                ${summary.studentNames.map((name: string) => `<li>${name}</li>`).join('')}
              </ul>
              <p>¡Buen trabajo!</p>
            </div>
          `,
        }),
      })
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
