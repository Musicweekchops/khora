import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <onboarding@resend.dev>"
const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://khora.cl"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function isLastMondayOfMonth(date: Date) {
  if (date.getDay() !== 1) return false
  const totalDays = getDaysInMonth(date.getFullYear(), date.getMonth())
  return date.getDate() + 7 > totalDays
}

function isPastOrEqualLastFridayOfMonth(date: Date) {
  const totalDays = getDaysInMonth(date.getFullYear(), date.getMonth())
  let lastFriday = totalDays
  while (new Date(date.getFullYear(), date.getMonth(), lastFriday).getDay() !== 5) {
    lastFriday--
  }
  return date.getDate() >= lastFriday
}

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const now = new Date()
    const currentMonthName = now.toLocaleDateString("es-CL", { month: "long" })
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextMonthName = nextMonthDate.toLocaleDateString("es-CL", { month: "long" })
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

    let continuityEmailsSent = 0
    let paymentEmailsSent = 0

    // =========================================================================
    // ETAPA 1: CORREO DE CONTINUIDAD (Lunes de la última semana del mes)
    // =========================================================================
    if (isLastMondayOfMonth(now)) {
      console.log("[Reminders] Hoy es el último Lunes del mes. Enviando confirmación de continuidad...")

      const { data: activeStudents, error: actErr } = await supabase
        .from("StudentProfile")
        .select(`
          id,
          continuity_token,
          User!inner ( name, email ),
          TeacherProfile!inner ( User!inner ( name ) )
        `)
        .eq("status", "ACTIVE")
        .eq("collection_active", true)

      if (!actErr && activeStudents && activeStudents.length > 0) {
        for (const student of activeStudents) {
          const sUser = Array.isArray(student.User) ? student.User[0] : student.User
          const teacher = Array.isArray(student.TeacherProfile) ? student.TeacherProfile[0] : student.TeacherProfile
          const tUser = Array.isArray(teacher?.User) ? teacher.User[0] : teacher?.User

          let token = student.continuity_token
          if (!token) {
            token = crypto.randomUUID()
            await supabase.from("StudentProfile").update({ continuity_token: token }).eq("id", student.id)
          }

          if (sUser?.email) {
            const confirmUrl = `${SITE_URL}/api/confirm-continuity?token=${token}&action=confirm`
            const pauseUrl = `${SITE_URL}/api/confirm-continuity?token=${token}&action=pause`

            const resendRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: sUser.email,
                subject: `¿Continúas tus clases de música en ${nextMonthName.toUpperCase()}? 🎵`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head><meta charset="utf-8"></head>
                  <body style="margin: 0; padding: 40px 20px; background-color: #f4f4f5; font-family: 'Inter', sans-serif;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);">
                      <tr><td style="height: 6px; background: linear-gradient(90deg, #8b5cf6, #10b981);"></td></tr>
                      <tr>
                        <td style="padding: 40px;">
                          <div style="width: 48px; height: 48px; background-color: #f3f4f6; border-radius: 16px; text-align: center; line-height: 48px; font-size: 22px; margin-bottom: 24px;">🎵</div>
                          <h1 style="color: #09090b; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">Hola ${sUser.name.split(' ')[0]}</h1>
                          <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                            Estamos planificando los horarios y cupos para el mes de <strong>${nextMonthName}</strong> con tu profesor <strong>${tUser?.name || 'de música'}</strong>.
                          </p>
                          <p style="color: #09090b; font-size: 15px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                            ¿Vas a continuar con tus clases el próximo mes?
                          </p>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="padding-bottom: 12px;">
                                <a href="${confirmUrl}" style="display: block; width: 100%; padding: 16px 0; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 16px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                                  ✓ Sí, continúo en mi horario
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <a href="${pauseUrl}" style="display: block; width: 100%; padding: 14px 0; background-color: #f4f4f5; color: #71717a; text-decoration: none; font-weight: 700; font-size: 13px; border-radius: 16px; text-align: center;">
                                  No continúo el próximo mes
                                </a>
                              </td>
                            </tr>
                          </table>
                          <hr style="border: none; border-top: 1px dashed #e4e4e7; margin: 32px 0;" />
                          <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                            Si seleccionas 'No continúo', tu cupo horario se liberará y se pausará la cobranza automática.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `,
              }),
            })
            if (resendRes.ok) {
              continuityEmailsSent++
              await supabase
                .from("StudentProfile")
                .update({ continuity_status: "PENDING" })
                .eq("id", student.id)
            }
          }
        }
      }
    }

    // =========================================================================
    // ETAPA 2: CADENCIA DE RECORDATORIOS DE COBRO (Último Viernes + C/2 Días)
    // =========================================================================
    if (isPastOrEqualLastFridayOfMonth(now)) {
      console.log("[Reminders] Evaluando cadencia de cobro (último Viernes o posterior)...")

      // 1. Obtener alumnos activos con cobranza activa que no hayan pausado continuidad
      const { data: students, error: stdError } = await supabase
        .from("StudentProfile")
        .select(`
          id, 
          collection_active,
          payment_frequency,
          payment_day,
          monthly_fee,
          continuity_status,
          last_payment_reminder_sent_at,
          User!inner ( name, email ),
          TeacherProfile!inner ( business_name, User!inner(name) )
        `)
        .eq("status", "ACTIVE")
        .eq("collection_active", true)
        .neq("continuity_status", "PAUSED")

      if (stdError) throw stdError

      if (students && students.length > 0) {
        // 2. Obtener pagos registrados este mes
        const { data: payments } = await supabase
          .from("Payment")
          .select("student_id")
          .gte("date", startOfMonth)

        const paidStudentIds = new Set(payments?.map(p => p.student_id) || [])

        // 3. Filtrar alumnos que NO han pagado y cuya última notificación fue hace 48h o más (o nunca)
        const unpaidStudents = students.filter(s => {
          if (paidStudentIds.has(s.id)) return false
          if ((s.monthly_fee || 0) <= 0) return false

          if (!s.last_payment_reminder_sent_at) return true

          const lastSent = new Date(s.last_payment_reminder_sent_at)
          const diffMs = now.getTime() - lastSent.getTime()
          const diffHours = diffMs / (1000 * 60 * 60)
          return diffHours >= 44 // Permite margen de ~48 horas
        })

        for (const student of unpaidStudents) {
          const sUser = Array.isArray(student.User) ? student.User[0] : student.User
          const teacher = Array.isArray(student.TeacherProfile) ? student.TeacherProfile[0] : student.TeacherProfile
          const tUser = Array.isArray(teacher?.User) ? teacher.User[0] : teacher?.User

          const teacherName = tUser?.name || "tu profesor"
          const feeFormatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(student.monthly_fee || 0)

          // 4. Buscar si el alumno tiene clases pendientes por recuperar (is_recovery_pending = true)
          const { data: recoveryClasses } = await supabase
            .from("Class")
            .select("date, start_time, modalidad")
            .eq("student_id", student.id)
            .eq("is_recovery_pending", true)
            .order("date", { ascending: true })

          let recoveryHtml = ""
          if (recoveryClasses && recoveryClasses.length > 0) {
            const listItems = recoveryClasses.map(rc => {
              const dStr = new Date(rc.date + "T12:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })
              const timeStr = rc.start_time ? rc.start_time.slice(0, 5) : ""
              const modStr = rc.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"
              return `<li style="margin-bottom: 6px; color: #3f3f46; font-size: 13px; font-weight: 600;">📅 <strong>${dStr}</strong> a las ${timeStr} (${modStr})</li>`
            }).join("")

            recoveryHtml = `
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
                <p style="color: #854d0e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
                  📌 Clases Pendientes por Recuperar (${recoveryClasses.length})
                </p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${listItems}
                </ul>
              </div>
            `
          }

          if (sUser?.email) {
            const resendRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: sUser.email,
                subject: `Resumen de Mensualidad - ${currentMonthName.toUpperCase()}`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head><meta charset="utf-8"></head>
                  <body style="margin: 0; padding: 40px 20px; background-color: #f4f4f5; font-family: 'Inter', sans-serif;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); overflow: hidden;">
                      <tr><td style="height: 6px; background: linear-gradient(90deg, #8b5cf6, #3b82f6); width: 100%;"></td></tr>
                      <tr>
                        <td style="padding: 40px;">
                          <div style="width: 48px; height: 48px; background-color: #f3f4f6; border-radius: 16px; text-align: center; line-height: 48px; font-size: 20px; margin-bottom: 24px; color: #8b5cf6; font-weight: bold;">💳</div>
                          <h1 style="color: #09090b; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">Hola ${sUser.name.split(' ')[0]}</h1>
                          <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                            Te recordamos que tu resumen de cuenta de <strong>${currentMonthName}</strong> está listo para pago.
                          </p>

                          <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 28px;">
                            <p style="color: #71717a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Total a pagar</p>
                            <p style="color: #18181b; font-size: 38px; font-weight: 900; margin: 0; letter-spacing: -1px;">${feeFormatted}</p>
                          </div>

                          ${recoveryHtml}

                          <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; background-color: #f4f4f5; border-left: 3px solid #8b5cf6; padding: 12px 16px; border-radius: 0 12px 12px 0;">
                            Ponte en contacto con <strong>${teacherName}</strong> para coordinar la transferencia o realizar el pago correspondiente.
                          </p>

                          <hr style="border: none; border-top: 1px dashed #e4e4e7; margin: 32px 0;" />
                          <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                            Si ya realizaste el pago en las últimas horas, por favor ignora este mensaje.<br>
                            <em>Enviado automáticamente por Khora.</em>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `,
              }),
            })

            if (resendRes.ok) {
              paymentEmailsSent++
              await supabase
                .from("StudentProfile")
                .update({ last_payment_reminder_sent_at: new Date().toISOString() })
                .eq("id", student.id)
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Proceso finalizado. Correos de continuidad: ${continuityEmailsSent}. Correos de cobro: ${paymentEmailsSent}.` 
    }), { headers: { "Content-Type": "application/json" }, status: 200 })

  } catch (error: any) {
    console.error("[send-payment-reminders Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
