import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatFriendlyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  if (/[a-zA-Z]/g.test(dateStr)) return dateStr
  try {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const dateObj = new Date(year, month, day)
      const weekday = dateObj.toLocaleDateString("es-CL", { weekday: "long" })
      const monthName = dateObj.toLocaleDateString("es-CL", { month: "long" })
      const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
      const capMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)
      return `${capWeekday} ${day} de ${capMonthName}`
    }
  } catch (_e) {}
  return dateStr
}

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { classId, type, customParams } = await req.json()

    if (!classId && !customParams) {
      return new Response(
        JSON.stringify({ error: "Missing classId or customParams parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    let studentUserId: string
    let teacherName: string
    let date: string
    let formattedTime: string
    let finalClassId = classId

    if (customParams) {
      studentUserId = customParams.studentUserId
      teacherName = customParams.teacherName || "Tu profesor"
      date = customParams.date
      formattedTime = customParams.time
      if (customParams.classId) {
        finalClassId = customParams.classId
      }

      if (!studentUserId || !date || !formattedTime) {
        return new Response(
          JSON.stringify({ error: "Missing required fields in customParams: studentUserId, date, time" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        )
      }
    } else {
      // 1. Obtener detalles de la clase, estudiante y profesor de la base de datos
      const { data: cls, error: classErr } = await supabase
        .from("Class")
        .select(`
          id,
          date,
          start_time,
          status,
          StudentProfile (
            user_id,
            User ( name )
          ),
          TeacherProfile (
            User ( name )
          )
        `)
        .eq("id", classId)
        .maybeSingle()

      if (classErr) throw classErr
      if (!cls) {
        return new Response(
          JSON.stringify({ error: "Class not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        )
      }

      // Robustez de tipos
      const studentProfile = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0] : cls.StudentProfile
      const teacherProfile = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0] : cls.TeacherProfile
      
      const tUser = Array.isArray(teacherProfile?.User) ? teacherProfile?.User[0] : teacherProfile?.User
      studentUserId = studentProfile?.user_id

      if (!studentUserId) {
        return new Response(
          JSON.stringify({ message: "Student has no user_id, skipping push notification" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        )
      }

      teacherName = tUser?.name || "Tu profesor"
      date = cls.date
      formattedTime = cls.start_time.slice(0, 5)
    }

    // 2. Obtener las suscripciones push activas del estudiante
    const { data: subs, error: subsErr } = await supabase
      .from("PushSubscription")
      .select("*")
      .eq("user_id", studentUserId)

    if (subsErr) throw subsErr

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: "Student has no active push subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 3. Enviar notificación push
    const webpush = await import("https://esm.sh/web-push@3.6.7")
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || Deno.env.get("VITE_VAPID_PUBLIC_KEY") || "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
    webpush.setVapidDetails(
      "mailto:hola@khora.cl",
      vapidPublicKey,
      vapidPrivateKey
    )

    const isCancelled = type === 'CANCELLED'
    const isRejected = type === 'REJECTED'
    const isDeleted = type === 'DELETED'
    
    let notificationTitle = "🎸 ¡Clase Confirmada!"
    let notificationBody = `${teacherName} confirmó tu clase del ${formatFriendlyDate(date)} a las ${formattedTime} hs.`
    
    if (isCancelled) {
      notificationTitle = "✕ Clase Cancelada"
      notificationBody = `${teacherName} canceló tu clase del ${formatFriendlyDate(date)} a las ${formattedTime} hs.`
    } else if (isRejected) {
      notificationTitle = "✕ Reserva Rechazada"
      notificationBody = `${teacherName} rechazó tu solicitud de reserva del ${formatFriendlyDate(date)} a las ${formattedTime} hs.`
    } else if (isDeleted) {
      notificationTitle = "✕ Clase Eliminada"
      notificationBody = `${teacherName} eliminó tu clase del ${formatFriendlyDate(date)} a las ${formattedTime} hs.`
    }
    
    const notificationUrl = (isCancelled || isRejected || isDeleted || !finalClassId) 
      ? "/dashboard" 
      : `/dashboard/clases/detalles?id=${finalClassId}`

    const payload = JSON.stringify({
      title: notificationTitle,
      body: notificationBody,
      url: notificationUrl
    })

    let successCount = 0
    let failedCount = 0

    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload)
        successCount++
      } catch (err: any) {
        console.error(`Error sending push to student subscription ${sub.id}:`, err)
        failedCount++
        // Limpiar suscripciones inválidas (410 o 404)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from("PushSubscription")
            .delete()
            .eq("id", sub.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Push notifications sent to student. Sent: ${successCount}, Failed: ${failedCount}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    console.error("Function notify-student-push error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
