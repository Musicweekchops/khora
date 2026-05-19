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

    // 3. Obtener el nombre del profesor para personalizar el correo de bienvenida
    let teacherName = ""
    try {
      const { data: teacherData } = await supabaseAdmin
        .from("TeacherProfile")
        .select(`
          User ( name )
        `)
        .eq("id", teacher_id)
        .maybeSingle()
      
      if (teacherData?.User) {
        const u = teacherData.User
        teacherName = Array.isArray(u) ? u[0]?.name : u?.name || ""
      }
    } catch (err) {
      console.error("Error fetching teacher name for welcome email:", err)
    }

    // 4. Enviar correo de bienvenida de forma automatizada
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
        console.error("Error response from send-email:", await emailRes.text())
      }
    } catch (err) {
      console.error("Error calling send-email function:", err)
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
