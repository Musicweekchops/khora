import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Asegúrate de agregar esta variable de entorno en Supabase:
// supabase secrets set RESEND_API_KEY="re_..."
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

// El dominio desde donde enviarás. En modo de prueba con Resend, puedes usar "onboarding@resend.dev" 
// pero solo podrás enviarte correos a ti mismo. Una vez verifiques tu dominio, cámbialo aquí.
const FROM_EMAIL = "Khora <onboarding@resend.dev>" 

serve(async (req) => {
  // Configuración de Supabase (usamos Service Role para ignorar RLS en este proceso de sistema)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Obtener la fecha de mañana en formato YYYY-MM-DD
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const targetDate = tomorrow.toISOString().split("T")[0]

    // 2. Buscar clases programadas para mañana
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
      return new Response(JSON.stringify({ message: "No hay clases programadas para mañana." }), {
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
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola ${sUser.name},</h2>
                <p>Te recordamos que tienes una clase programada para mañana <strong>${cls.date}</strong> a las <strong>${cls.start_time.slice(0, 5)}</strong> con el profesor ${tUser.name}.</p>
                <p>¡Prepárate y nos vemos en clase!</p>
              </div>
            `,
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
