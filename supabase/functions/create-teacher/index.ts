import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, password, name, instrumento, academy_id } = await req.json()

    if (!email || !password || !name || !instrumento || !academy_id) {
      throw new Error("Missing required fields: email, password, name, instrumento, academy_id")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1. Verificar que la academia existe y está activa
    const { data: academy, error: academyErr } = await supabaseAdmin
      .from("AcademyProfile")
      .select("id, name, is_active")
      .eq("id", academy_id)
      .single()

    if (academyErr || !academy) throw new Error("Academy not found")
    if (!academy.is_active) throw new Error("Academy is not active")

    // 2. Crear el usuario en auth.users con rol TEACHER + academy_id en metadata
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: "TEACHER",
        instrumento: instrumento.trim(),
        academy_id: academy_id,
      },
    })

    if (createErr) throw createErr
    if (!userData.user) throw new Error("No se devolvió el usuario creado")

    const newUserId = userData.user.id

    // 3. Esperar a que el trigger handle_new_user cree TeacherProfile
    await new Promise((r) => setTimeout(r, 1500))

    // 4. Obtener el TeacherProfile recién creado y crear AcademyTeacher
    const { data: teacherProfile, error: tpErr } = await supabaseAdmin
      .from("TeacherProfile")
      .select("id")
      .eq("user_id", newUserId)
      .maybeSingle()

    if (tpErr || !teacherProfile) throw new Error("TeacherProfile not created by trigger")

    // 5. Asegurar que academy_id esté seteado en TeacherProfile (el trigger ya lo hace, esto es fallback)
    await supabaseAdmin
      .from("TeacherProfile")
      .update({ academy_id: academy_id })
      .eq("id", teacherProfile.id)

    // 6. Crear la relación AcademyTeacher
    const { error: atErr } = await supabaseAdmin
      .from("AcademyTeacher")
      .insert({ academy_id, teacher_id: teacherProfile.id, status: "ACTIVE" })
      .select()
      .single()

    if (atErr && atErr.code !== "23505") throw atErr // Ignorar duplicate si ya existe

    // 7. Enviar correo de bienvenida al profesor
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: email.trim().toLowerCase(),
          type: "WELCOME",
          params: {
            studentName: name.trim(),
            teacherName: academy.name,
            email: email.trim().toLowerCase(),
            tempPassword: password,
          },
        }),
      })
    } catch (emailErr) {
      console.warn("Error enviando correo de bienvenida:", emailErr)
    }

    return new Response(
      JSON.stringify({ userId: newUserId, teacherProfileId: teacherProfile.id }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
    )

  } catch (error: any) {
    console.error("create-teacher error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
    )
  }
})
