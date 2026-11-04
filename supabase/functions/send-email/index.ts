import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getTemplate, EmailType } from "./templates.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <hola@khora.cl>" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function addMinutes(startTime: string, minutes: number): string {
  const parts = startTime.split(":")
  const h = parseInt(parts[0] || "10")
  const m = parseInt(parts[1] || "0")
  const date = new Date()
  date.setHours(h, m, 0, 0)
  date.setMinutes(date.getMinutes() + minutes)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`
}

function generateIcs(params: any): string {
  const { classId, date, rawDate, startTime, rawStartTime, endTime, teacherName, studentName, modalidad, status } = params
  
  // Extraer fecha limpia (YYYY-MM-DD)
  let targetDate = rawDate || date || ""
  if (targetDate.includes("T")) {
    targetDate = targetDate.split("T")[0]
  }
  // Si no está en formato YYYY-MM-DD (ej: "Lunes, 21 de junio"), intentar parsear o usar hoy
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    try {
      const parsed = new Date(targetDate)
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed.toISOString().split("T")[0]
      } else {
        targetDate = new Date().toISOString().split("T")[0]
      }
    } catch {
      targetDate = new Date().toISOString().split("T")[0]
    }
  }

  // Extraer hora limpia (HH:MM:SS)
  let targetStartTime = rawStartTime || startTime || params.time || "10:00"
  if (targetStartTime.includes(" ")) {
    targetStartTime = targetStartTime.split(" ")[0]
  }
  const timeParts = targetStartTime.split(":")
  const cleanStartTime = `${String(timeParts[0] || "10").padStart(2, "0")}:${String(timeParts[1] || "00").padStart(2, "0")}:00`
  
  let targetEndTime = endTime || params.rawEndTime
  if (!targetEndTime) {
    targetEndTime = addMinutes(cleanStartTime, 60)
  }
  const endTimeParts = targetEndTime.split(":")
  const cleanEndTime = `${String(endTimeParts[0] || "11").padStart(2, "0")}:${String(endTimeParts[1] || "00").padStart(2, "0")}:00`

  const formatIcsDateTime = (dStr: string, tStr: string) => {
    const cleanDate = dStr.replace(/-/g, "") // YYYYMMDD
    const cleanTime = tStr.substring(0, 5).replace(/:/g, "") + "00" // HHMMSS
    return `${cleanDate}T${cleanTime}`
  }

  const dtStart = formatIcsDateTime(targetDate, cleanStartTime)
  const dtEnd = formatIcsDateTime(targetDate, cleanEndTime)
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  const isCancelled = status === "CANCELLED" || status === "STUDENT_CLASS_CANCELLED" || status === "STUDENT_CLASS_DELETED" || status === "TEACHER_CLASS_CANCELLED"
  let eventStatus = "CONFIRMED"
  if (isCancelled) {
    eventStatus = "CANCELLED"
  } else if (status === "PENDING_AUTHORIZATION" || status === "PENDING" || status === "STUDENT_BOOKING_REQUEST" || status === "TEACHER_NEW_BOOKING") {
    eventStatus = "TENTATIVE"
  }

  const isDeleted = status === "STUDENT_CLASS_DELETED"
  const summary = isDeleted
    ? `[ELIMINADA] Clase de Batería con ${teacherName}`
    : isCancelled 
      ? `[CANCELADA] Clase de Batería con ${teacherName}`
      : `Clase de Batería con ${teacherName}`
    
  const description = `Clase de batería Khora para ${studentName}. Modalidad: ${modalidad === 'online' ? 'Virtual (Zoom/Google Meet)' : 'Presencial'}. Estado: ${status}`
  const location = modalidad === 'online' ? "Enlace Virtual Khora (Zoom/Google Meet)" : "Academia de Batería Khora"

  const escapeText = (str: string) => str ? str.replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n") : ""

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Khora//Scheduling//ES",
    "CALSCALE:GREGORIAN",
    `METHOD:${isCancelled ? 'CANCEL' : 'PUBLISH'}`,
    "BEGIN:VEVENT",
    `UID:${classId || crypto.randomUUID()}@khora.cl`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `STATUS:${eventStatus}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ]

  return icsLines.join("\r\n")
}

// 1x1 transparent GIF bytes
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
])

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqUrl = new URL(req.url)
    const trackOpenId = reqUrl.searchParams.get("track_open")
    const trackClickId = reqUrl.searchParams.get("track_click")
    const unsubscribeId = reqUrl.searchParams.get("unsubscribe")
    const getCommunityConfigParam = reqUrl.searchParams.get("community_config")

    if (getCommunityConfigParam) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      const { data: teacherUser } = await supabaseAdmin
        .from("User")
        .select("id, TeacherProfile ( id )")
        .eq("email", "arnaldoallende@hotmail.com")
        .maybeSingle()

      const tp: any = Array.isArray(teacherUser?.TeacherProfile)
        ? teacherUser?.TeacherProfile[0]
        : teacherUser?.TeacherProfile

      let customConfig: any = {}
      try {
        const { data: fileBlob } = await supabaseAdmin.storage.from("landing").download("headers/community_config.json")
        if (fileBlob) {
          customConfig = JSON.parse(await fileBlob.text())
        }
      } catch (_e) {}

      let fallbackHeader = ""
      if (!customConfig.headerImageUrl && tp?.id) {
        const { data: anyStep } = await supabaseAdmin
          .from("NurtureStep")
          .select("header_image_url")
          .eq("teacher_id", tp.id)
          .not("header_image_url", "is", null)
          .limit(1)
          .maybeSingle()
        fallbackHeader = anyStep?.header_image_url || ""
      }

      return new Response(
        JSON.stringify({
          headerImageUrl: customConfig.headerImageUrl || fallbackHeader || "",
          badge: customConfig.badge || "🥁 Comunidad de Batería",
          title: customConfig.title || "Súmate a la comunidad de estudiantes",
          subtitle: customConfig.subtitle || "Recibe ejercicios de práctica, partituras, material de estudio y novedades directamente en tu correo.",
          ctaText: customConfig.ctaText || "Sumarme a la comunidad",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 0. Seguimiento de apertura (píxel 1x1), clics y baja de suscripción (unsubscribe) del Funnel
    if (trackOpenId || trackClickId || unsubscribeId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
        const nowIso = new Date().toISOString()

        if (trackOpenId) {
          await supabaseAdmin
            .from("NurtureLog")
            .update({ opened_at: nowIso })
            .eq("id", trackOpenId)
            .is("opened_at", null)
        }

        if (trackClickId) {
          const { data: existing } = await supabaseAdmin
            .from("NurtureLog")
            .select("opened_at, clicked_at")
            .eq("id", trackClickId)
            .maybeSingle()

          await supabaseAdmin
            .from("NurtureLog")
            .update({
              opened_at: existing?.opened_at || nowIso,
              clicked_at: existing?.clicked_at || nowIso,
            })
            .eq("id", trackClickId)
        }

        if (unsubscribeId) {
          const { data: logRow } = await supabaseAdmin
            .from("NurtureLog")
            .select("id, email, opened_at, converted_at, StudentProfile ( user_id )")
            .eq("id", unsubscribeId)
            .maybeSingle()

          if (logRow) {
            await supabaseAdmin
              .from("NurtureLog")
              .update({
                opened_at: logRow.opened_at || nowIso,
                conversion_details: logRow.converted_at ? undefined : "UNSUBSCRIBED",
              })
              .eq("id", unsubscribeId)

            const sp: any = Array.isArray(logRow.StudentProfile) ? logRow.StudentProfile[0] : logRow.StudentProfile
            if (sp?.user_id) {
              await supabaseAdmin
                .from("User")
                .update({ marketing_consent: false })
                .eq("id", sp.user_id)
            } else if (logRow.email) {
              await supabaseAdmin
                .from("User")
                .update({ marketing_consent: false })
                .ilike("email", logRow.email.trim())
            }
          }
        }
      } catch (trackErr) {
        console.error("Error registrando evento de apertura/clic/baja:", trackErr)
      }

      if (unsubscribeId) {
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Suscripción cancelada</title>
</head>
<body style="margin:0;padding:40px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;text-align:center;">
  <div style="max-width:420px;margin:60px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:800;">Te has dado de baja correctamente</h2>
    <p style="margin:0 0 20px 0;font-size:14px;color:#64748b;line-height:1.6;">
      Ya no recibirás más correos automáticos de esta secuencia.
    </p>
    <a href="https://khora.cl" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 20px;border-radius:10px;">
      Volver a Khora
    </a>
  </div>
</body>
</html>`
        return new Response(html, {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        })
      }

      if (trackClickId) {
        const target = reqUrl.searchParams.get("to") || "https://khora.cl/login"
        return Response.redirect(target, 302)
      }

      return new Response(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      })
    }

    const body = await req.json()

    // 1. Subida segura de cabecera a Storage vía Service Role
    if (body.action === 'upload-header') {
      const { base64, ext = "png", contentType = "image/png" } = body
      if (!base64) {
        return new Response(
          JSON.stringify({ error: "Missing base64 data" }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        )
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64
      const binaryStr = atob(rawBase64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }

      const fileName = `headers/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabaseAdmin.storage.from("landing").upload(fileName, bytes, {
        contentType: contentType,
        upsert: true
      })
      if (uploadErr) {
        return new Response(
          JSON.stringify({ error: uploadErr.message }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        )
      }

      const { data: { publicUrl } } = supabaseAdmin.storage.from("landing").getPublicUrl(fileName)
      return new Response(
        JSON.stringify({ success: true, publicUrl }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 1.b Guardar configuración editable de la Landing de Comunidad
    if (body.action === 'save-community-config') {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      const configPayload = {
        headerImageUrl: body.headerImageUrl ?? "",
        badge: body.badge || "🥁 Comunidad de Batería",
        title: body.title || "Súmate a la comunidad de estudiantes",
        subtitle: body.subtitle || "Recibe ejercicios de práctica, partituras, material de estudio y novedades directamente en tu correo.",
        ctaText: body.ctaText || "Sumarme a la comunidad",
        updatedAt: new Date().toISOString(),
      }

      const encoder = new TextEncoder()
      await supabaseAdmin.storage.from("landing").upload(
        "headers/community_config.json",
        encoder.encode(JSON.stringify(configPayload)),
        { contentType: "application/json", upsert: true }
      )

      return new Response(
        JSON.stringify({ success: true, config: configPayload }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 1.c Suscripción pública a la Comunidad + Notificación Push instantánea al Profesor
    if (body.action === 'subscribe-community') {
      const rawName = (body.name || "").trim()
      const rawEmail = (body.email || "").trim().toLowerCase()

      if (!rawName || !rawEmail || !rawEmail.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Por favor ingresa tu nombre y un correo válido." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        )
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      // Obtener profesor Arnaldo Allende
      const { data: teacherUser } = await supabaseAdmin
        .from("User")
        .select("id, TeacherProfile ( id )")
        .eq("email", "arnaldoallende@hotmail.com")
        .maybeSingle()

      const tp: any = Array.isArray(teacherUser?.TeacherProfile)
        ? teacherUser?.TeacherProfile[0]
        : teacherUser?.TeacherProfile

      if (!teacherUser?.id || !tp?.id) {
        return new Response(
          JSON.stringify({ error: "No se encontró el perfil del profesor." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        )
      }

      // Buscar si el usuario ya existe por email
      const { data: existingUser } = await supabaseAdmin
        .from("User")
        .select("id, name")
        .ilike("email", rawEmail)
        .maybeSingle()

      let studentUserId = existingUser?.id

      if (studentUserId) {
        await supabaseAdmin
          .from("User")
          .update({
            marketing_consent: true,
            name: existingUser?.name || rawName,
          })
          .eq("id", studentUserId)
      } else {
        const newId = crypto.randomUUID()
        const { error: userInsertErr } = await supabaseAdmin
          .from("User")
          .insert({
            id: newId,
            email: rawEmail,
            name: rawName,
            role: "STUDENT",
            marketing_consent: true,
          })
        if (userInsertErr) {
          return new Response(
            JSON.stringify({ error: userInsertErr.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          )
        }
        studentUserId = newId
      }

      // Verificar si ya tiene StudentProfile con Arnaldo
      const { data: existingSp } = await supabaseAdmin
        .from("StudentProfile")
        .select("id, status, lead_source, nurture_step")
        .eq("user_id", studentUserId)
        .eq("teacher_id", tp.id)
        .maybeSingle()

      let studentProfileId = existingSp?.id

      if (!studentProfileId) {
        // Suscriptor nuevo exclusivo de Newsletter/Comunidad (no se mezcla con alumnos de clases)
        const { data: insertedSp } = await supabaseAdmin
          .from("StudentProfile")
          .insert({
            user_id: studentUserId,
            teacher_id: tp.id,
            status: "PROSPECT",
            lead_source: "NEWSLETTER_ONLY",
            nurture_step: 0,
          })
          .select("id")
          .single()
        studentProfileId = insertedSp?.id
      } else if (existingSp?.lead_source !== "NEWSLETTER_ONLY") {
        // Ya era alumno registrado en Khora: mantener su estado de alumno y etiquetarlo en el Newsletter
        await supabaseAdmin
          .from("StudentProfile")
          .update({
            lead_source: "NEWSLETTER",
          })
          .eq("id", studentProfileId)
      }

      // Enviar inmediatamente el Correo #0 (step_order = 0) si está activo
      let welcomeEmailSent = false
      let welcomeError: string | null = null
      try {
        const { data: anyStepWithHeader } = await supabaseAdmin
          .from("NurtureStep")
          .select("header_image_url")
          .eq("teacher_id", tp.id)
          .not("header_image_url", "is", null)
          .limit(1)
          .maybeSingle()

        const defaultHeader = anyStepWithHeader?.header_image_url || null

        let { data: stepZero } = await supabaseAdmin
          .from("NurtureStep")
          .select(`
            id,
            step_order,
            subject,
            content_html,
            header_image_url,
            is_active,
            LibraryContent ( id, title, type )
          `)
          .eq("teacher_id", tp.id)
          .eq("step_order", 0)
          .maybeSingle()

        // Si aún no existe ningún Correo #0 en la base de datos, crearlo por defecto
        if (!stepZero) {
          const { data: createdZero } = await supabaseAdmin
            .from("NurtureStep")
            .insert({
              teacher_id: tp.id,
              step_order: 0,
              subject: "¡Bienvenido/a a la comunidad de estudiantes, {{nombre}}! 🥁",
              content_html:
                "Qué alegría tenerte en la comunidad de estudiantes.\n\nPor aquí te iré compartiendo ejercicios de práctica, partituras, ideas de estudio y novedades para acompañarte en tu avance en la batería.\n\nGuarda este correo en tu bandeja principal para que no te pierdas el material de los próximos días.",
              delay_days: 0,
              target_audiences: ["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"],
              header_image_url: defaultHeader,
              is_active: true,
            })
            .select(`
              id,
              step_order,
              subject,
              content_html,
              header_image_url,
              is_active,
              LibraryContent ( id, title, type )
            `)
            .maybeSingle()
          stepZero = createdZero
        }

        if (stepZero && stepZero.is_active && studentProfileId && RESEND_API_KEY) {
          const { data: existingLog } = await supabaseAdmin
            .from("NurtureLog")
            .select("id")
            .eq("step_id", stepZero.id)
            .eq("student_profile_id", studentProfileId)
            .maybeSingle()

          if (!existingLog) {
            const nowIso = new Date().toISOString()
            const { data: logRow } = await supabaseAdmin
              .from("NurtureLog")
              .insert({
                teacher_id: tp.id,
                step_id: stepZero.id,
                student_profile_id: studentProfileId,
                email: rawEmail,
                sent_at: nowIso,
              })
              .select("id")
              .single()

            const logId = logRow?.id
            const fnBase = `${supabaseUrl}/functions/v1/send-email`
            const openPixelHtml = logId
              ? `<img src="${fnBase}?track_open=${logId}" width="1" height="1" alt="" style="display:block;width:1px !important;height:1px !important;border:0 !important;margin:0 !important;padding:0 !important;" />`
              : ""

            const firstName = rawName.split(" ")[0] || "Alumno"
            const parsedSubject = stepZero.subject.replace(/{{nombre}}/g, firstName)
            const bodyWithName = stepZero.content_html.replace(/{{nombre}}/g, firstName)
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
            const libMat: any = Array.isArray(stepZero.LibraryContent)
              ? stepZero.LibraryContent[0]
              : stepZero.LibraryContent
            if (libMat) {
              const rawHref = `https://khora.cl/login?ref=funnel_step_0`
              const trackedHref = logId
                ? `${fnBase}?track_click=${logId}&to=${encodeURIComponent(rawHref)}`
                : rawHref
              libraryHtml = `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: left;">
                  <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                    ${libMat.type === "video" ? "📹 VIDEO DE PRÁCTICA" : "📄 PARTITURA / PDF"}
                  </div>
                  <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
                    ${libMat.title}
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
            const bannerUrl = stepZero.header_image_url || defaultHeader
            if (bannerUrl) {
              headerHtml = `
                <div style="text-align: center; padding: 0; overflow: hidden; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                  <img src="${bannerUrl}" alt="Cabecera" style="width: 100%; max-width: 540px; height: auto; max-height: 220px; object-fit: cover; display: block; margin: 0 auto;" />
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
                            ${headerHtml}
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
                            <div style="padding: 24px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                              <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                Recibes este correo porque te sumaste a la comunidad de estudiantes de Arnaldo Allende.
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

            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: rawEmail,
                subject: parsedSubject,
                html: emailHtml,
              }),
            })

            if (emailRes.ok) {
              welcomeEmailSent = true
              await supabaseAdmin
                .from("StudentProfile")
                .update({
                  nurture_step: existingSp?.nurture_step || 0,
                  nurture_last_sent_at: nowIso,
                })
                .eq("id", studentProfileId)
            } else {
              const errTxt = await emailRes.text()
              welcomeError = errTxt
              if (logId) {
                await supabaseAdmin.from("NurtureLog").delete().eq("id", logId)
              }
            }
          }
        }
      } catch (welcomeErr: any) {
        welcomeError = welcomeErr?.message || String(welcomeErr)
        console.error("Error enviando Correo #0 de bienvenida:", welcomeErr)
      }

      // Enviar Notificación Push a todos los dispositivos de Arnaldo
      let pushSent = 0
      try {
        const { data: subs } = await supabaseAdmin
          .from("PushSubscription")
          .select("*")
          .eq("user_id", teacherUser.id)

        if (subs && subs.length > 0) {
          const webpush = await import("https://esm.sh/web-push@3.6.7")
          const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || Deno.env.get("VITE_VAPID_PUBLIC_KEY") || "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"
          const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
          webpush.setVapidDetails("mailto:hola@khora.cl", vapidPublicKey, vapidPrivateKey)

          const pushPayload = JSON.stringify({
            title: "🥁 ¡Nuevo miembro en la Comunidad!",
            body: `${rawName} (${rawEmail}) se acaba de sumar a la comunidad de estudiantes.`,
            url: "/dashboard/funnel",
          })

          for (const sub of subs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                pushPayload
              )
              pushSent++
            } catch (pushErr: any) {
              if (pushErr?.statusCode === 410 || pushErr?.statusCode === 404) {
                await supabaseAdmin.from("PushSubscription").delete().eq("id", sub.id)
              }
            }
          }
        }
      } catch (e) {
        console.error("Error enviando push de comunidad:", e)
      }

      return new Response(
        JSON.stringify({ success: true, pushSent, welcomeEmailSent, welcomeError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 1.d Reenviar Correo #0 a suscriptores recientes de la Comunidad que no lo hayan recibido
    if (body.action === 'backfill-step-zero') {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

      const { data: teacherUser } = await supabaseAdmin
        .from("User")
        .select("id, TeacherProfile ( id )")
        .eq("email", "arnaldoallende@hotmail.com")
        .maybeSingle()

      const tp: any = Array.isArray(teacherUser?.TeacherProfile)
        ? teacherUser?.TeacherProfile[0]
        : teacherUser?.TeacherProfile

      if (!tp?.id) {
        return new Response(JSON.stringify({ error: "No teacher profile" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        })
      }

      const { data: anyStepWithHeader } = await supabaseAdmin
        .from("NurtureStep")
        .select("header_image_url")
        .eq("teacher_id", tp.id)
        .not("header_image_url", "is", null)
        .limit(1)
        .maybeSingle()

      const defaultHeader = anyStepWithHeader?.header_image_url || null

      let { data: stepZero } = await supabaseAdmin
        .from("NurtureStep")
        .select(`
          id,
          step_order,
          subject,
          content_html,
          header_image_url,
          is_active,
          LibraryContent ( id, title, type )
        `)
        .eq("teacher_id", tp.id)
        .eq("step_order", 0)
        .maybeSingle()

      if (!stepZero) {
        const { data: createdZero } = await supabaseAdmin
          .from("NurtureStep")
          .insert({
            teacher_id: tp.id,
            step_order: 0,
            subject: "¡Bienvenido/a a la comunidad de estudiantes, {{nombre}}! 🥁",
            content_html:
              "Qué alegría tenerte en la comunidad de estudiantes.\n\nPor aquí te iré compartiendo ejercicios de práctica, partituras, ideas de estudio y novedades para acompañarte en tu avance en la batería.\n\nGuarda este correo en tu bandeja principal para que no te pierdas el material de los próximos días.",
            delay_days: 0,
            target_audiences: ["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"],
            header_image_url: defaultHeader,
            is_active: true,
          })
          .select(`
            id,
            step_order,
            subject,
            content_html,
            header_image_url,
            is_active,
            LibraryContent ( id, title, type )
          `)
          .maybeSingle()
        stepZero = createdZero
      }

      const sinceIso = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      const { data: recentProspects } = await supabaseAdmin
        .from("StudentProfile")
        .select("id, status, lead_source, nurture_step, created_at, User ( id, name, email, marketing_consent )")
        .eq("teacher_id", tp.id)
        .eq("status", "PROSPECT")
        .gte("created_at", sinceIso)

      const taggedNewsletterOnly: string[] = []
      const taggedExistingStudent: string[] = []
      for (const sp of recentProspects || []) {
        const u: any = Array.isArray(sp.User) ? sp.User[0] : sp.User
        const emailStr = u?.email || sp.id
        const { count: classCount } = await supabaseAdmin
          .from("Class")
          .select("id", { count: "exact", head: true })
          .eq("student_id", sp.id)
        const { count: payCount } = await supabaseAdmin
          .from("Payment")
          .select("id", { count: "exact", head: true })
          .eq("student_id", sp.id)

        if ((classCount || 0) > 0 || (payCount || 0) > 0) {
          await supabaseAdmin.from("StudentProfile").update({ lead_source: "NEWSLETTER" }).eq("id", sp.id)
          taggedExistingStudent.push(emailStr)
        } else if (sp.lead_source !== "NEWSLETTER_ONLY") {
          await supabaseAdmin.from("StudentProfile").update({ lead_source: "NEWSLETTER_ONLY" }).eq("id", sp.id)
          taggedNewsletterOnly.push(`${emailStr} (was: ${sp.lead_source || "null"})`)
        }
      }

      const sentTo: string[] = []
      if (stepZero && stepZero.is_active && RESEND_API_KEY) {
        for (const sp of recentProspects || []) {
          const u: any = Array.isArray(sp.User) ? sp.User[0] : sp.User
          if (!u?.email || u.marketing_consent === false) continue

          const { data: existingLog } = await supabaseAdmin
            .from("NurtureLog")
            .select("id")
            .eq("step_id", stepZero.id)
            .eq("student_profile_id", sp.id)
            .maybeSingle()

          if (existingLog) continue

          const nowIso = new Date().toISOString()
          const rawEmail = u.email.trim().toLowerCase()
          const rawName = u.name || "Alumno"
          const { data: logRow } = await supabaseAdmin
            .from("NurtureLog")
            .insert({
              teacher_id: tp.id,
              step_id: stepZero.id,
              student_profile_id: sp.id,
              email: rawEmail,
              sent_at: nowIso,
            })
            .select("id")
            .single()

          const logId = logRow?.id
          const fnBase = `${supabaseUrl}/functions/v1/send-email`
          const openPixelHtml = logId
            ? `<img src="${fnBase}?track_open=${logId}" width="1" height="1" alt="" style="display:block;width:1px !important;height:1px !important;border:0 !important;margin:0 !important;padding:0 !important;" />`
            : ""

          const firstName = rawName.split(" ")[0] || "Alumno"
          const parsedSubject = stepZero.subject.replace(/{{nombre}}/g, firstName)
          const bodyWithName = stepZero.content_html.replace(/{{nombre}}/g, firstName)
          const rawParsedBody = bodyWithName.includes("<")
            ? bodyWithName
            : bodyWithName.replace(/\n/g, "<br>")

          const parsedBody = logId
            ? rawParsedBody.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (_m: string, href: string) => {
                if (href.includes("/functions/v1/send-email")) return `href="${href}"`
                return `href="${fnBase}?track_click=${logId}&to=${encodeURIComponent(href)}"`
              })
            : rawParsedBody

          const bannerUrl = stepZero.header_image_url || defaultHeader
          const headerHtml = bannerUrl
            ? `<div style="text-align: center; padding: 0; overflow: hidden; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;"><img src="${bannerUrl}" alt="Cabecera" style="width: 100%; max-width: 540px; height: auto; max-height: 220px; object-fit: cover; display: block; margin: 0 auto;" /></div>`
            : `<div style="text-align: center; padding: 24px 0 16px 0; border-bottom: 1px solid #f1f5f9;"><h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">Arnaldo Allende</h2></div>`

          const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${parsedSubject}</title></head><body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 36px 12px; width: 100%;"><tr><td align="center"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;"><tr><td>${headerHtml}<div style="padding: 32px 32px 24px 32px; font-size: 15px; color: #334155; line-height: 1.65;"><p style="font-size: 16px; color: #0f172a; font-weight: 700; margin: 0 0 16px 0;">¡Hola ${firstName}!</p><div style="color: #334155; line-height: 1.7;">${parsedBody}</div><div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;"><p style="margin: 0;">Un abrazo,<br><strong style="color: #0f172a;">Arnaldo Allende</strong></p></div></div><div style="padding: 24px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;"><p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">Recibes este correo porque te sumaste a la comunidad de estudiantes de Arnaldo Allende.</p><p style="font-size: 11px; color: #64748b; margin: 0;"><a href="https://khora.cl/terminos" style="color: #7c3aed; text-decoration: underline;">Términos</a> &nbsp;•&nbsp; <a href="https://khora.cl/privacidad" style="color: #7c3aed; text-decoration: underline;">Privacidad</a> &nbsp;•&nbsp; <a href="mailto:hola@khora.cl" style="color: #7c3aed; text-decoration: underline;">Contacto</a>${logId ? `&nbsp;•&nbsp;<a href="${fnBase}?unsubscribe=${logId}" style="color: #64748b; text-decoration: underline;">Darse de baja</a>` : ""}</p><p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0;">© 2026 Khora • Arnaldo Allende.</p>${openPixelHtml}</div></td></tr></table></td></tr></table></body></html>`

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: rawEmail,
              subject: parsedSubject,
              html: emailHtml,
            }),
          })

          if (emailRes.ok) {
            sentTo.push(rawEmail)
            await supabaseAdmin
              .from("StudentProfile")
              .update({ nurture_step: sp.nurture_step || 0, nurture_last_sent_at: nowIso })
              .eq("id", sp.id)
          } else if (logId) {
            await supabaseAdmin.from("NurtureLog").delete().eq("id", logId)
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          sentTo,
          taggedNewsletterOnly,
          taggedExistingStudent,
          recentProspectsCount: recentProspects?.length || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    const { to, type, params, subject, customHtml, html } = body

    if (!to || (!type && !customHtml && !html)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, and either type or customHtml" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const htmlContent = customHtml || html || (type ? getTemplate(type as EmailType, params || {}) : null)

    if (!htmlContent) {
      return new Response(
        JSON.stringify({ error: "Invalid email type or empty html" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const defaultSubjects: Record<EmailType, string> = {
      WELCOME: "Te damos la bienvenida a Khora",
      CLASS_CONFIRMATION: "Tu clase de musica esta confirmada",
      CLASS_REMINDER: "Recordatorio: Tienes una clase de musica programada",
      TEACHER_CLASS_CONFIRMED: "Clase confirmada por tu alumno",
      TEACHER_NEW_STUDENT: "¡Tienes un nuevo alumno inscrito en Khora! 🎉",
      PAYMENT_CONFIRMATION: "Confirmación de Pago - Recibo de Clases Khora ✓",
      STUDENT_CLASS_CONFIRMED: "¡Tu clase de música ha sido confirmada!",
      TEACHER_CLASS_RESCHEDULED: "🔄 Tu clase de música ha sido reagendada",
      STUDENT_CLASS_CANCELLED: "Tu clase de música ha sido cancelada",
      TEACHER_NEW_BOOKING: "Nueva solicitud de reserva de clase 🔔",
      STUDENT_BOOKING_REJECTED: "Tu solicitud de reserva no pudo ser confirmada ✕",
      STUDENT_CLASS_RESCHEDULED: "🔄 Tu clase de música ha sido reprogramada",
      STUDENT_BOOKING_REQUEST: "Solicitud de reserva recibida ⏳",
      STUDENT_CLASS_DELETED: "Tu clase de música ha sido eliminada",
      TEACHER_CLASS_CANCELLED: "✕ Clase cancelada por tu alumno",
      TEST_EMAIL: "Correo de prueba desde Khora ✉️",
    }

    const finalSubject = subject || defaultSubjects[type as EmailType] || "Notificación de Khora"

    // Construir cuerpo de la llamada a Resend
    const resendBody: any = {
      from: FROM_EMAIL,
      to: to,
      subject: finalSubject,
      html: htmlContent,
    }

    // Si params tiene información de la clase, generar y adjuntar el archivo .ics
    const isClassNotification = ['STUDENT_CLASS_CONFIRMED', 'TEACHER_CLASS_RESCHEDULED', 'STUDENT_CLASS_CANCELLED', 'STUDENT_CLASS_RESCHEDULED', 'CLASS_CONFIRMATION', 'STUDENT_BOOKING_REQUEST', 'STUDENT_CLASS_DELETED', 'TEACHER_CLASS_CANCELLED'].includes(type)
    const hasDateAndTime = (params.date || params.rawDate) && (params.time || params.rawStartTime || params.startTime)

    if (isClassNotification || hasDateAndTime) {
      try {
        const icsContent = generateIcs({
          classId: params.classId,
          date: params.date,
          rawDate: params.rawDate,
          startTime: params.time || params.startTime,
          rawStartTime: params.rawStartTime,
          endTime: params.endTime,
          teacherName: params.teacherName || "Tu profesor",
          studentName: params.studentName || "Alumno",
          modalidad: params.modalidad || "online",
          status: params.status || type,
        })

        const encoder = new TextEncoder()
        const icsBytes = encoder.encode(icsContent)
        let binary = ""
        const len = icsBytes.byteLength
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(icsBytes[i])
        }
        const icsBase64 = btoa(binary)

        resendBody.attachments = [
          {
            content: icsBase64,
            filename: `clase-khora${type === 'STUDENT_CLASS_CANCELLED' || type === 'TEACHER_CLASS_CANCELLED' || type === 'STUDENT_CLASS_DELETED' ? '-cancelada' : ''}.ics`,
            content_type: "text/calendar",
          }
        ]
        console.log("Archivo iCalendar (.ics) generado y adjunto exitosamente.")
      } catch (icsErr) {
        console.error("Error al generar o adjuntar el archivo ICS:", icsErr)
      }
    }

    // Enviar correo vía Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendBody),
    })

    const resData = await res.json()

    if (!res.ok) {
      throw new Error(JSON.stringify(resData))
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    console.error("Email sending error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
