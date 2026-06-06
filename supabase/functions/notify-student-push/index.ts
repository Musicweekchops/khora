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
    const { classId } = await req.json()

    if (!classId) {
      return new Response(
        JSON.stringify({ error: "Missing classId parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    // 1. Obtener detalles de la clase, estudiante y profesor
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
    const studentUserId = studentProfile?.user_id

    if (!studentUserId) {
      return new Response(
        JSON.stringify({ message: "Student has no user_id, skipping push notification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const teacherName = tUser?.name || "Tu profesor"
    const formattedTime = cls.start_time.slice(0, 5)

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
    webpush.setVapidDetails(
      "mailto:hola@khora.cl",
      "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
      "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
    )

    const payload = JSON.stringify({
      title: "🎸 ¡Clase Confirmada!",
      body: `${teacherName} confirmó tu clase del ${cls.date} a las ${formattedTime} hs.`,
      url: `/dashboard/clases/detalles?id=${cls.id}`
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
