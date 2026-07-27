import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Obtener la hora actual en Chile (America/Santiago)
    const now = new Date()
    const formatterDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' })
    const formatterTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    
    const todayStr = formatterDate.format(now) // YYYY-MM-DD
    const currentTimeStr = formatterTime.format(now) // HH:mm:ss
    
    const [curH, curM] = currentTimeStr.split(":").map(Number)
    const currentMinutesFromMidnight = curH * 60 + curM

    console.log(`[TeacherPushReminders] Ejecutando chequeo para ${todayStr} a las ${currentTimeStr} (${currentMinutesFromMidnight} min desde medianoche)`)

    // 2. Obtener todas las clases de HOY que no hayan recibido recordatorio al profesor aún
    const { data: classes, error: classErr } = await supabase
      .from("Class")
      .select(`
        id,
        date,
        start_time,
        end_time,
        status,
        modalidad,
        teacher_id,
        student_id,
        teacher_reminder_sent_at,
        StudentProfile (
          User ( name )
        ),
        TeacherProfile (
          user_id,
          teacher_reminder_minutes,
          teacher_reminder_first_class_only,
          User ( name )
        )
      `)
      .eq("date", todayStr)
      .in("status", ["SCHEDULED", "CONFIRMED"])
      .is("teacher_reminder_sent_at", null)

    if (classErr) throw classErr
    if (!classes || classes.length === 0) {
      return new Response(JSON.stringify({ message: `No hay clases de hoy pendientes de notificar al profesor.` }), { status: 200 })
    }

    let notificationsSent = 0

    // VAPID Keys
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || Deno.env.get("VITE_VAPID_PUBLIC_KEY") || "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"

    for (const cls of classes) {
      const studentProfile = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0] : cls.StudentProfile
      const teacherProfile = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0] : cls.TeacherProfile

      const sUser = Array.isArray(studentProfile?.User) ? studentProfile.User[0] : studentProfile?.User
      const teacherUserId = teacherProfile?.user_id

      if (!teacherUserId) continue

      // Calcular inicio de clase en minutos desde medianoche
      const [startH, startM] = cls.start_time.split(":").map(Number)
      const classStartMinutes = startH * 60 + startM

      // Tiempo restante hasta la clase
      const minutesUntilClass = classStartMinutes - currentMinutesFromMidnight

      // Preferencias del profesor
      const targetLeadMinutes = teacherProfile?.teacher_reminder_minutes ?? 60
      const firstClassOnly = teacherProfile?.teacher_reminder_first_class_only ?? false

      // Ventana de evaluación (ej. si la preferencia es 60 min, evalúa si la clase empieza en 45 a 70 min)
      const minWindow = targetLeadMinutes - 15
      const maxWindow = targetLeadMinutes + 15

      if (minutesUntilClass >= minWindow && minutesUntilClass <= maxWindow) {
        // 3. Determinar si esta es la PRIMERA CLASE DEL DÍA del profesor
        const { data: teacherTodayClasses } = await supabase
          .from("Class")
          .select("start_time")
          .eq("teacher_id", cls.teacher_id)
          .eq("date", todayStr)
          .in("status", ["SCHEDULED", "CONFIRMED", "COMPLETED"])
          .order("start_time", { ascending: true })

        const firstClassStartTime = teacherTodayClasses && teacherTodayClasses.length > 0
          ? teacherTodayClasses[0].start_time
          : cls.start_time

        const isFirstClassOfDay = (cls.start_time === firstClassStartTime)

        // Si el profesor configuró "Solo primera clase" y NO es la primera clase, omitimos
        if (firstClassOnly && !isFirstClassOfDay) {
          console.log(`[TeacherPushReminders] Omitiendo clase ${cls.id} porque el profesor configuró solo 1ª clase del día.`)
          continue
        }

        // 4. Buscar suscripciones push del profesor
        const { data: subs } = await supabase
          .from("PushSubscription")
          .select("*")
          .eq("user_id", teacherUserId)

        if (subs && subs.length > 0) {
          const webpush = await import("https://esm.sh/web-push@3.6.7")
          webpush.setVapidDetails("mailto:hola@khora.cl", vapidPublicKey, vapidPrivateKey)

          const studentName = sUser?.name || "Un alumno"
          const classTimeStr = cls.start_time.slice(0, 5)
          const modalidadStr = cls.modalidad === "online" ? "Virtual" : "Presencial"

          let pushTitle = "⏰ Próxima Clase en 1 Hora"
          let pushBody = `Clase con ${studentName} a las ${classTimeStr} hs (${modalidadStr}).`

          if (isFirstClassOfDay) {
            pushTitle = "🚨 ¡Atención! Tu jornada inicia en 1 hora"
            pushBody = `Primera clase del día con ${studentName} a las ${classTimeStr} hs (${modalidadStr}). ¡Hora de salir al estudio! 🚗`
          }

          const payload = JSON.stringify({
            title: pushTitle,
            body: pushBody,
            url: `/dashboard/clases/detalles?id=${cls.id}`
          })

          for (const sub of subs) {
            try {
              await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              }, payload)
            } catch (pushErr: any) {
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await supabase.from("PushSubscription").delete().eq("id", sub.id)
              }
            }
          }

          notificationsSent++

          // 5. Marcar que ya se envió la notificación de recordatorio para esta clase
          await supabase
            .from("Class")
            .update({ teacher_reminder_sent_at: new Date().toISOString() })
            .eq("id", cls.id)
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Revisión completada. Se enviaron ${notificationsSent} alertas push al profesor.`
    }), { headers: { "Content-Type": "application/json" }, status: 200 })

  } catch (error: any) {
    console.error("[send-teacher-class-reminders Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
