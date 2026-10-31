import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { getLayout } from "../send-email/templates.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <hola@khora.cl>"

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Obtener profesor Arnaldo Allende
    const { data: teacherUser } = await supabase
      .from("User")
      .select("id, TeacherProfile ( id )")
      .eq("email", "arnaldoallende@hotmail.com")
      .maybeSingle()

    const teacherProfile = Array.isArray(teacherUser?.TeacherProfile)
      ? teacherUser?.TeacherProfile[0]
      : teacherUser?.TeacherProfile

    if (!teacherProfile?.id) {
      return new Response(JSON.stringify({ error: "Teacher profile not found" }), { status: 404 })
    }

    const teacherId = teacherProfile.id

    // 2. Obtener pasos activos del funnel ordenados
    const { data: steps } = await supabase
      .from("NurtureStep")
      .select(`
        id,
        step_order,
        subject,
        content_html,
        delay_days,
        target_audiences,
        library_content_id,
        LibraryContent ( id, title, type, file_url )
      `)
      .eq("teacher_id", teacherId)
      .eq("is_active", true)
      .order("step_order", { ascending: true })

    if (!steps || steps.length === 0) {
      return new Response(JSON.stringify({ message: "No active nurture steps" }), { status: 200 })
    }

    // 3. Obtener alumnos no activos con consentimiento
    const { data: students } = await supabase
      .from("StudentProfile")
      .select(`
        id,
        status,
        created_at,
        nurture_step,
        nurture_last_sent_at,
        User ( id, name, email, marketing_consent )
      `)
      .eq("teacher_id", teacherId)
      .neq("status", "ACTIVE")

    let sentCount = 0
    const now = Date.now()

    for (const student of students || []) {
      const u = Array.isArray(student.User) ? student.User[0] : student.User
      if (!u || !u.email) continue
      if (u.marketing_consent === false) continue

      const currentStepNum = student.nurture_step || 0
      const nextStep = steps.find(s => s.step_order === currentStepNum + 1)
      if (!nextStep) continue

      // Verificar si el estado del alumno está en las audiencias objetivo de este paso
      const studentStatus = student.status || "PROSPECT"
      if (!nextStep.target_audiences.includes(studentStatus)) continue

      // Verificar tiempo de espera (delay_days)
      const lastSentTime = student.nurture_last_sent_at 
        ? new Date(student.nurture_last_sent_at).getTime()
        : new Date(student.created_at).getTime()

      const daysDiff = (now - lastSentTime) / (1000 * 60 * 60 * 24)
      if (daysDiff < nextStep.delay_days) continue

      // 4. Preparar correo
      const firstName = u.name ? u.name.split(" ")[0] : "Alumno"
      const parsedSubject = nextStep.subject.replace(/{{nombre}}/g, firstName)
      const parsedBody = nextStep.content_html
        .replace(/{{nombre}}/g, firstName)
        .replace(/\n/g, "<br>")

      let libraryHtml = ""
      if (nextStep.LibraryContent) {
        const mat = nextStep.LibraryContent
        libraryHtml = `
          <div style="background-color: #1a1a24; border: 1px solid #2d2d3d; border-radius: 20px; padding: 20px; margin: 24px 0; text-align: left;">
            <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              ${mat.type === "video" ? "📹 VIDEO DE PRÁCTICA" : "📄 PARTITURA / PDF"}
            </div>
            <h4 style="font-size: 16px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0;">
              ${mat.title}
            </h4>
            <a href="https://khora.cl/login?ref=funnel_step_${nextStep.step_order}" style="display: inline-block; background-color: #5b4fcf; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 12px;">
              Ver Material en Khora
            </a>
          </div>
        `
      }

      const emailHtml = getLayout(`
        <div style="padding: 0 32px 32px 32px; font-size: 14px; color: #d1d5db; line-height: 1.6;">
          <p style="font-size: 16px; color: #ffffff; font-weight: 700; margin-bottom: 16px;">
            ¡Hola ${firstName}!
          </p>
          <div style="color: #d1d5db; line-height: 1.7;">
            ${parsedBody}
          </div>
          ${libraryHtml}
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #2d2d3d; font-size: 13px; color: #9ca3af;">
            <p style="margin: 0;">Un abrazo,<br><strong style="color: #ffffff;">Arnaldo Allende</strong></p>
          </div>
        </div>
      `)

      // Enviar vía Resend
      if (RESEND_API_KEY) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: u.email.trim().toLowerCase(),
            subject: parsedSubject,
            html: emailHtml
          })
        })

        if (emailRes.ok) {
          sentCount++
          // Registrar log
          await supabase.from("NurtureLog").insert({
            teacher_id: teacherId,
            step_id: nextStep.id,
            student_profile_id: student.id,
            email: u.email.trim().toLowerCase(),
            sent_at: new Date().toISOString()
          })

          // Actualizar estado del alumno
          await supabase.from("StudentProfile").update({
            nurture_step: nextStep.step_order,
            nurture_last_sent_at: new Date().toISOString()
          }).eq("id", student.id)
        } else {
          console.error("Resend error sending to", u.email, await emailRes.text())
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

