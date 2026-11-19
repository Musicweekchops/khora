import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <hola@khora.cl>"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Obtener profesor Arnaldo Allende
    const { data: teacherUser } = await supabase
      .from("User")
      .select("id, TeacherProfile ( id, funnel_header_image_url )")
      .eq("email", "arnaldoallende@hotmail.com")
      .maybeSingle()

    const teacherProfile: any = Array.isArray(teacherUser?.TeacherProfile)
      ? teacherUser?.TeacherProfile[0]
      : teacherUser?.TeacherProfile

    if (!teacherProfile?.id) {
      return new Response(
        JSON.stringify({ error: "Teacher profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      )
    }

    const teacherId = teacherProfile.id

    // 2. Obtener todos los pasos activos (tanto de secuencia como programados en fecha específica)
    const { data: steps } = await supabase
      .from("NurtureStep")
      .select(`
        id,
        step_order,
        step_type,
        scheduled_date,
        scheduled_time,
        broadcast_sent_at,
        subject,
        content_html,
        delay_days,
        target_audiences,
        library_content_id,
        header_image_url,
        LibraryContent ( id, title, type )
      `)
      .eq("teacher_id", teacherId)
      .eq("is_active", true)
      .order("step_order", { ascending: true })

    if (!steps || steps.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active nurture steps" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const defaultBannerUrl =
      teacherProfile.funnel_header_image_url ||
      steps.find((s: any) => s.header_image_url)?.header_image_url ||
      ""

    // 3. Obtener contactos del funnel y suscriptores del newsletter con consentimiento
    const { data: students } = await supabase
      .from("StudentProfile")
      .select(`
        id,
        status,
        lead_source,
        created_at,
        nurture_step,
        nurture_last_sent_at,
        User ( id, name, email, marketing_consent )
      `)
      .eq("teacher_id", teacherId)

    let reqBody: any = {}
    try {
      reqBody = await req.json()
    } catch (_e) {}

    const nowDate = new Date()
    const chileDateFmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const chileTimeFmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const todayChileStr = chileDateFmt.format(nowDate) // YYYY-MM-DD en Chile
    const currentChileTime = chileTimeFmt.format(nowDate) // HH:mm en Chile
    const [curH, curM] = currentChileTime.split(":").map(Number)

    // Helper para construir y enviar un correo de NurtureStep (secuencia o programado)
    async function dispatchEmailForStep(step: any, student: any, u: any): Promise<boolean> {
      const { data: logRow } = await supabase
        .from("NurtureLog")
        .insert({
          teacher_id: teacherId,
          step_id: step.id,
          student_profile_id: student.id,
          email: u.email.trim().toLowerCase(),
          sent_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      const logId = logRow?.id
      const fnBase = `${supabaseUrl}/functions/v1/send-email`
      const openPixelHtml = logId
        ? `<img src="${fnBase}?track_open=${logId}" width="1" height="1" alt="" style="display:block;width:1px !important;height:1px !important;border:0 !important;margin:0 !important;padding:0 !important;" />`
        : ""

      const firstName = u.name ? u.name.split(" ")[0] : "Alumno"
      const parsedSubject = step.subject.replace(/{{nombre}}/g, firstName)
      const bodyWithName = step.content_html.replace(/{{nombre}}/g, firstName)
      const rawParsedBody = bodyWithName.includes("<")
        ? bodyWithName
        : bodyWithName.replace(/\n/g, "<br>")

      const parsedBody = logId
        ? rawParsedBody.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (_m: string, href: string) => {
            if (href.includes("/functions/v1/send-email")) return `href="${href}"`
            return `href="${fnBase}?track_click=${logId}&to=${encodeURIComponent(href)}"`
          })
        : rawParsedBody

      let libraryHtml = ""
      if (step.LibraryContent) {
        const mat = step.LibraryContent
        const rawHref = `https://khora.cl/login?ref=funnel_step_${step.step_order}`
        const trackedHref = logId
          ? `${fnBase}?track_click=${logId}&to=${encodeURIComponent(rawHref)}`
          : rawHref
        libraryHtml = `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: left;">
            <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
              ${mat.type === "video" ? "📹 VIDEO DE PRÁCTICA" : "📄 PARTITURA / PDF"}
            </div>
            <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
              ${mat.title}
            </h4>
            <a href="${trackedHref}" style="display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 10px; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);">
              Ver Material en Khora
            </a>
          </div>
        `
      }

      let headerHtml = `
        <div style="text-align: center; padding: 24px 0 16px 0; border-bottom: 1px solid #f1f5f9;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Arnaldo Allende
          </h2>
        </div>
      `
      const bannerUrl = step.header_image_url || defaultBannerUrl
      if (bannerUrl) {
        headerHtml = `
          <div style="text-align: center; padding: 0; overflow: hidden; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
            <img src="${bannerUrl}" alt="Header" style="width: 100%; max-width: 540px; height: auto; max-height: 200px; object-fit: cover; display: block; margin: 0 auto;" />
          </div>
        `
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${parsedSubject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 36px 12px; width: 100%;">
            <tr>
              <td align="center">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                  <tr>
                    <td>
                      <!-- HEADER -->
                      ${headerHtml}
                      
                      <!-- CONTENT -->
                      <div style="padding: 32px 32px 24px 32px; font-size: 15px; color: #334155; line-height: 1.65;">
                        <p style="font-size: 16px; color: #0f172a; font-weight: 700; margin: 0 0 16px 0;">
                          ¡Hola ${firstName}!
                        </p>
                        <div style="color: #334155; line-height: 1.7;">
                          ${parsedBody}
                        </div>
                        ${libraryHtml}
                        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;">
                          <p style="margin: 0;">Un abrazo,<br><strong style="color: #0f172a;">Arnaldo Allende</strong></p>
                        </div>
                      </div>
                      
                      <!-- FOOTER -->
                      <div style="padding: 24px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          Recibes este correo porque eres alumno o tienes una cuenta en Khora.
                        </p>
                        <p style="font-size: 11px; color: #64748b; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          <a href="https://khora.cl/terminos" style="color: #7c3aed; text-decoration: underline;">Términos</a>
                          &nbsp;•&nbsp;
                          <a href="https://khora.cl/privacidad" style="color: #7c3aed; text-decoration: underline;">Privacidad</a>
                          &nbsp;•&nbsp;
                          <a href="mailto:hola@khora.cl" style="color: #7c3aed; text-decoration: underline;">Contacto</a>
                          ${logId ? `&nbsp;•&nbsp;<a href="${fnBase}?unsubscribe=${logId}" style="color: #64748b; text-decoration: underline;">Darse de baja</a>` : ""}
                        </p>
                        <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          © 2026 Khora • Arnaldo Allende.
                        </p>
                        ${openPixelHtml}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `

      if (!RESEND_API_KEY) return false

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: u.email.trim().toLowerCase(),
          subject: parsedSubject,
          html: emailHtml,
        }),
      })

      if (emailRes.ok) {
        return true
      } else {
        if (logId) {
          await supabase.from("NurtureLog").delete().eq("id", logId)
        }
        console.error("Resend error sending to", u.email, await emailRes.text())
        return false
      }
    }

    let scheduledSentCount = 0
    let sequenceSentCount = 0

    // =========================================================================
    // BLOQUE A: CORREOS PROGRAMADOS EN FECHA Y HORA ESPECÍFICA (step_type = 'SCHEDULED')
    // No modifican nurture_step ni nurture_last_sent_at de los alumnos.
    // =========================================================================
    const scheduledSteps = steps.filter((s: any) => s.step_type === "SCHEDULED")
    const forcedBroadcastId = reqBody?.broadcast_step_id || null

    for (const schedStep of scheduledSteps) {
      if (forcedBroadcastId) {
        if (schedStep.id !== forcedBroadcastId) continue
      } else {
        // Si ya fue enviado automáticamente antes, saltar
        if (schedStep.broadcast_sent_at) continue
        if (!schedStep.scheduled_date) continue

        const targetDate = String(schedStep.scheduled_date).slice(0, 10)
        const targetTime = (schedStep.scheduled_time || "18:00").slice(0, 5)

        const isDue =
          todayChileStr > targetDate ||
          (todayChileStr === targetDate && currentChileTime >= targetTime)

        if (!isDue) continue
      }

      // Consultar qué correos ya recibieron este step_id para evitar duplicados
      const { data: existingLogs } = await supabase
        .from("NurtureLog")
        .select("email")
        .eq("step_id", schedStep.id)

      const alreadySentEmails = new Set(
        (existingLogs || []).map((l: any) => (l.email || "").trim().toLowerCase())
      )

      let sentForThisBroadcast = 0
      const targetAudiences: string[] = Array.isArray(schedStep.target_audiences)
        ? schedStep.target_audiences
        : ["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"]

      for (const student of students || []) {
        const u: any = Array.isArray(student.User) ? student.User[0] : student.User
        if (!u || !u.email) continue
        if (u.marketing_consent === false) continue

        const cleanEmail = u.email.trim().toLowerCase()
        if (alreadySentEmails.has(cleanEmail)) continue

        const studentStatus = student.status || "PROSPECT"
        const isNewsletterSubscriber =
          student.lead_source === "NEWSLETTER" ||
          student.lead_source === "NEWSLETTER_ONLY"

        // Si el alumno es ACTIVE y no es suscriptor del newsletter, solo recibe si 'ACTIVE' está marcado en target_audiences
        const matchesAudience =
          targetAudiences.includes(studentStatus) ||
          (isNewsletterSubscriber && studentStatus !== "ACTIVE") ||
          (isNewsletterSubscriber && targetAudiences.includes("PROSPECT"))

        if (!matchesAudience) continue

        const ok = await dispatchEmailForStep(schedStep, student, u)
        if (ok) {
          alreadySentEmails.add(cleanEmail)
          sentForThisBroadcast++
          scheduledSentCount++
        }
      }

      // Marcar el correo programado como enviado (SIN tocar nurture_step ni nurture_last_sent_at de los alumnos)
      await supabase
        .from("NurtureStep")
        .update({
          broadcast_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", schedStep.id)
    }

    // Si la invocación fue exclusivamente para disparar un correo programado puntual, retornar de inmediato
    if (forcedBroadcastId) {
      return new Response(
        JSON.stringify({
          success: true,
          broadcast_step_id: forcedBroadcastId,
          sent: scheduledSentCount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // =========================================================================
    // BLOQUE B: SECUENCIA LINEAL DEL FUNNEL (step_type = 'SEQUENCE')
    // Se ejecuta únicamente en la ventana de las 18:00 hrs de Chile (o con force: true)
    // =========================================================================
    const isSequenceWindow = Boolean(reqBody?.force) || (curH === 18 && curM < 30)
    if (!isSequenceWindow) {
      return new Response(
        JSON.stringify({
          success: true,
          scheduled_sent: scheduledSentCount,
          sequence_skipped: true,
          reason: `Correos programados evaluados (${scheduledSentCount} enviados). Secuencia lineal espera ventana 18:00 hrs Chile (actual: ${currentChileTime}).`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const sequenceSteps = steps.filter(
      (s: any) => !s.step_type || s.step_type === "SEQUENCE"
    )

    const toUtcMidnightMs = (ymd: string) => {
      const [y, m, d] = ymd.split("-").map(Number)
      return Date.UTC(y, m - 1, d)
    }
    const todayChileUtcMs = toUtcMidnightMs(todayChileStr)

    for (const student of students || []) {
      const u: any = Array.isArray(student.User) ? student.User[0] : student.User
      if (!u || !u.email) continue
      if (u.marketing_consent === false) continue

      const currentStepNum = student.nurture_step || 0
      const nextStep = sequenceSteps.find(
        (s: any) => s.step_order === currentStepNum + 1
      )
      if (!nextStep) continue

      const studentStatus = student.status || "PROSPECT"
      const isNewsletterSubscriber =
        student.lead_source === "NEWSLETTER" ||
        student.lead_source === "NEWSLETTER_ONLY"
      if (
        !nextStep.target_audiences.includes(studentStatus) &&
        !isNewsletterSubscriber
      ) {
        continue
      }

      const refIso = student.nurture_last_sent_at || student.created_at
      const lastSentChileStr = chileDateFmt.format(new Date(refIso))
      const lastSentChileUtcMs = toUtcMidnightMs(lastSentChileStr)
      const calendarDaysDiff = Math.round(
        (todayChileUtcMs - lastSentChileUtcMs) / (1000 * 60 * 60 * 24)
      )

      const requiredCalendarDays =
        currentStepNum === 0 && nextStep.step_order === 1
          ? 1
          : Math.max(1, Number(nextStep.delay_days) || 7)

      if (calendarDaysDiff < requiredCalendarDays) continue

      const ok = await dispatchEmailForStep(nextStep, student, u)
      if (ok) {
        sequenceSentCount++
        await supabase
          .from("StudentProfile")
          .update({
            nurture_step: nextStep.step_order,
            nurture_last_sent_at: new Date().toISOString(),
          })
          .eq("id", student.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sequenceSentCount + scheduledSentCount,
        sequence_sent: sequenceSentCount,
        scheduled_sent: scheduledSentCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
