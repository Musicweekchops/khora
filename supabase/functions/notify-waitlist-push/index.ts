import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { teacherId, prospectName, dayOfWeek, startTime } = await req.json()

    if (!teacherId || !prospectName) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: teacherId or prospectName" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    console.log(`[Waitlist Push] Buscando perfil para teacherId: ${teacherId}`)

    // 1. Obtener el user_id del profesor a partir de su TeacherProfile
    const { data: teacher, error: teacherErr } = await supabase
      .from("TeacherProfile")
      .select("user_id")
      .eq("id", teacherId)
      .maybeSingle()

    if (teacherErr) throw teacherErr
    if (!teacher || !teacher.user_id) {
      return new Response(
        JSON.stringify({ message: "Teacher has no user_id, skipping push notification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const teacherUserId = teacher.user_id

    // 2. Obtener las suscripciones push activas del profesor
    const { data: subs, error: subsErr } = await supabase
      .from("PushSubscription")
      .select("*")
      .eq("user_id", teacherUserId)

    if (subsErr) throw subsErr

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: "Teacher has no active push subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 3. Configurar web-push
    const webpush = await import("https://esm.sh/web-push@3.6.7")
    webpush.setVapidDetails(
      "mailto:hola@khora.cl",
      "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
      "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
    )

    // Formatear el día de la semana y horario para el mensaje
    const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const dayStr = DAY_NAMES[Number(dayOfWeek)] || "algún día"
    const timeStr = startTime ? startTime.slice(0, 5) : ""

    const payload = JSON.stringify({
      title: "👤 ¡Nuevo Prospecto en Lista de Espera!",
      body: `${prospectName} se registró para los ${dayStr} a las ${timeStr} hs.`,
      url: `/dashboard/espera`
    })

    console.log(`[Waitlist Push] Enviando notificación a ${subs.length} suscripciones del profesor ${teacherUserId}`)

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
        console.error(`[Waitlist Push] Error enviando a suscripción ${sub.id}:`, err)
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
        message: `Push notifications sent. Sent: ${successCount}, Failed: ${failedCount}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    console.error("[Waitlist Push Error]:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
