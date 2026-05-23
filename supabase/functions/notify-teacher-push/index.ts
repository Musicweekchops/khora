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
        StudentProfile (
          User ( name )
        ),
        TeacherProfile (
          user_id,
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
    
    const sUser = Array.isArray(studentProfile?.User) ? studentProfile?.User[0] : studentProfile?.User
    const teacherUserId = teacherProfile?.user_id

    if (!teacherUserId) {
      return new Response(
        JSON.stringify({ message: "Teacher has no user_id, skipping push notification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const studentName = sUser?.name || "Un alumno"
    const formattedTime = cls.start_time.slice(0, 5)

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

    // 3. Enviar notificación push
    const webpush = await import("https://esm.sh/web-push@3.6.7")
    webpush.setVapidDetails(
      "mailto:hola@khora.cl",
      "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsUtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4", // CORRECT KEY WITH LtQf (web-push is fine with standard, we supply the valid one)
      "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
    )

    // Reemplazamos la clave con LtQf en el setVapidDetails!
    webpush.setVapidDetails(
      "mailto:hola@khora.cl",
      "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
      "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
    )

    const payload = JSON.stringify({
      title: "🎸 ¡Clase Confirmada!",
      body: `${studentName} confirmó su asistencia para la clase del ${cls.date} a las ${formattedTime} hs.`,
      url: "/dashboard/agenda" // Redirige a la agenda del profesor
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
        console.error(`Error sending push to teacher subscription ${sub.id}:`, err)
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
    console.error("Function notify-teacher-push error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
