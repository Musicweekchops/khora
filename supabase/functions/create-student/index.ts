import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const { email, password, name, phone, teacher_id } = await req.json()

    if (!email || !password || !name || !teacher_id) {
      throw new Error("Missing required fields")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })

    // 1. Crear el usuario con la API de Administrador
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirmar el correo
      user_metadata: {
        name: name.trim(),
        role: "STUDENT",
        teacher_id: teacher_id,
      }
    })

    if (createErr) throw createErr
    if (!userData.user) throw new Error("No se devolvió el usuario creado")

    // 2. El trigger handle_new_user ya se debió ejecutar y crear el StudentProfile.
    // Opcionalmente actualizamos el teléfono en la tabla public.User si se entregó.
    if (phone && phone.trim() !== "") {
      const { error: phoneErr } = await supabaseAdmin
        .from("User")
        .update({ phone: phone.trim() })
        .eq("id", userData.user.id)
      
      if (phoneErr) console.warn("Error actualizando teléfono:", phoneErr)
    }

    // 3. Obtener los detalles del profesor (nombre, email, user_id) para notificaciones
    let teacherName = ""
    let teacherEmail = ""
    let teacherUserId = ""

    try {
      const { data: teacherData } = await supabaseAdmin
        .from("TeacherProfile")
        .select(`
          user_id,
          User ( name, email )
        `)
        .eq("id", teacher_id)
        .maybeSingle()
      
      if (teacherData) {
        teacherUserId = teacherData.user_id || ""
        const u = teacherData.User
        const tUser = Array.isArray(u) ? u[0] : u
        if (tUser) {
          teacherName = tUser.name || ""
          teacherEmail = tUser.email || ""
        }
      }
    } catch (err) {
      console.error("Error fetching teacher details:", err)
    }

    // 4. Enviar correo de bienvenida al estudiante
    try {
      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: email.trim().toLowerCase(),
          type: "WELCOME",
          params: {
            studentName: name.trim(),
            teacherName: teacherName,
            email: email.trim().toLowerCase(),
            tempPassword: password,
          }
        })
      })
      if (!emailRes.ok) {
        console.error("Error response from welcome email to student:", await emailRes.text())
      }
    } catch (err) {
      console.error("Error calling send-email function for student welcome:", err)
    }

    // 5. Enviar correo de notificación al Profesor (Desactivado a petición del usuario: prefiere solo Push)
    /*
    if (teacherEmail) {
      try {
        const teacherEmailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: teacherEmail,
            type: "TEACHER_NEW_STUDENT",
            params: {
              studentName: name.trim(),
              teacherName: teacherName,
              email: email.trim().toLowerCase(),
              phone: phone ? phone.trim() : null
            }
          })
        })
        if (!teacherEmailRes.ok) {
          console.error("Error response from notification email to teacher:", await teacherEmailRes.text())
        }
      } catch (err) {
        console.error("Error calling send-email function for teacher notification:", err)
      }
    }
    */

    // 6. Enviar Notificación Push Instantánea al Profesor (si tiene PWA instalada y suscripción activa)
    if (teacherUserId) {
      try {
        const { data: subs, error: subsErr } = await supabaseAdmin
          .from("PushSubscription")
          .select("*")
          .eq("user_id", teacherUserId)

        if (!subsErr && subs && subs.length > 0) {
          // Importar dinámicamente web-push para evitar consumo de memoria en Edge Functions si no se utiliza
          const webpush = await import("https://esm.sh/web-push@3.6.7")
          
          // Configurar credenciales VAPID
          webpush.setVapidDetails(
            "mailto:hola@khora.cl",
            "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
            "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
          )

          const payload = JSON.stringify({
            title: "⚡ ¡Nuevo Alumno Inscrito!",
            body: `${name.trim()} se acaba de registrar en tu panel de Khora.`,
            url: "/dashboard/alumnos"
          })

          for (const sub of subs) {
            try {
              await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth
                }
              }, payload)
            } catch (pushErr: any) {
              console.error("Error enviando notificación push al profesor:", pushErr)
              // Auto-limpieza de tokens expirados o desinstalados del navegador
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await supabaseAdmin
                  .from("PushSubscription")
                  .delete()
                  .eq("id", sub.id)
              }
            }
          }
        }
      } catch (err) {
        console.error("Error al despachar notificación push al profesor:", err)
      }
    }

    return new Response(JSON.stringify({ userId: userData.user.id }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 200,
    })

  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 400,
    })
  }
})
