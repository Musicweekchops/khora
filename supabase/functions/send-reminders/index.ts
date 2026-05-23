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
          user_id,
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

    // 3. Preparar correos y notificaciones push
    let sentCount = 0

    for (const cls of classes) {
      // Extraer datos (manejo de posibles arrays o únicos dependiedo de la relación)
      const studentProfile = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0] : cls.StudentProfile
      const teacherUser = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0]?.User : cls.TeacherProfile?.User

      const sUser = Array.isArray(studentProfile?.User) ? studentProfile.User[0] : studentProfile?.User
      const tUser = Array.isArray(teacherUser) ? teacherUser[0] : teacherUser
      const studentUserId = studentProfile?.user_id

      if (sUser?.email && tUser?.email) {
        // Retraso secuencial (jitter) para evitar que los proveedores de correo marquen envíos masivos como spam
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))

        // Personalización dinámica del asunto para romper la firma de patrones idénticos (anti-spam)
        const subjectOptions = [
          `🎸 ¡Hola ${sUser.name}! Recordatorio de tu clase de mañana con ${tUser.name}`,
          `🎹 ${sUser.name}, tienes una clase agendada para mañana con ${tUser.name}`,
          `🎵 ¡Hola! Mañana tienes clase de música con ${tUser.name}`
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
              isToday: false
            }),
          }),
        })

        if (resendRes.ok) {
          sentCount++
        } else {
          console.error("Error enviando a alumno:", await resendRes.text())
        }

        // Enviar Notificación Push al alumno si tiene suscripción activa
        if (studentUserId) {
          try {
            const { data: subs, error: subsErr } = await supabase
              .from("PushSubscription")
              .select("*")
              .eq("user_id", studentUserId)

            if (!subsErr && subs && subs.length > 0) {
              const webpush = await import("https://esm.sh/web-push@3.6.7")
              webpush.setVapidDetails(
                "mailto:hola@khora.cl",
                "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsUtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
                "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
              )

              const pushPayload = JSON.stringify({
                title: "🎵 Recordatorio de Clase",
                body: `Mañana tienes clase con ${tUser.name} a las ${cls.start_time.slice(0, 5)}.`,
                url: `/confirmar-clase?id=${cls.id}`
              })

              for (const sub of subs) {
                try {
                  await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.p256dh,
                      auth: sub.auth
                    }
                  }, pushPayload)
                } catch (pushErr: any) {
                  console.error("Error sending push to student:", pushErr)
                  if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                    await supabase
                      .from("PushSubscription")
                      .delete()
                      .eq("id", sub.id)
                  }
                }
              }
            }
          } catch (err) {
            console.error("Error dispatching push to student:", err)
          }
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
