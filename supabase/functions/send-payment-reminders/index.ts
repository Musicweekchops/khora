import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <onboarding@resend.dev>"

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const now = new Date()
    const currentMonth = now.toLocaleDateString("es-CL", { month: "long" })
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

    // 1. Obtener todos los alumnos ACTIVOS y que tengan la COBRANZA ACTIVA (collection_active = true)
    const { data: students, error: stdError } = await supabase
      .from("StudentProfile")
      .select(`
        id, 
        collection_active,
        payment_frequency,
        payment_day,
        monthly_fee,
        User!inner ( name, email ),
        TeacherProfile!inner ( business_name, User!inner(name) )
      `)
      .eq("status", "ACTIVE")
      .eq("collection_active", true)

    if (stdError) throw stdError
    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ message: "No hay alumnos activos con cobranza pendiente." }), { status: 200 })
    }

    // Filtrar alumnos aplicables para recordatorio: 
    // - Que paguen mensual (MONTHLY)
    // - Que su día de pago (payment_day) sea HOY o ANTES (ej. si hoy es 6, cobrarle a los del 1 al 6)
    const currentDay = now.getDate()
    const applicableStudents = students.filter(s => 
      s.payment_frequency === 'MONTHLY' && 
      (s.payment_day || 5) <= currentDay
    )

    if (applicableStudents.length === 0) {
      return new Response(JSON.stringify({ message: "Ningún alumno cumple con la fecha de facturación para enviar correo hoy." }), { status: 200 })
    }

    // 2. Obtener todos los pagos registrados este mes
    const { data: payments, error: payError } = await supabase
      .from("Payment")
      .select("student_id")
      .gte("date", startOfMonth)

    if (payError) throw payError

    // 3. Filtrar alumnos aplicables que NO han pagado este mes (Si ya pagó, se omite el mensaje)
    const paidStudentIds = new Set(payments?.map(p => p.student_id) || [])
    const unpaidStudents = applicableStudents.filter(s => !paidStudentIds.has(s.id))

    if (unpaidStudents.length === 0) {
      return new Response(JSON.stringify({ message: "Todos los alumnos ya tienen su pago registrado este mes." }), { status: 200 })
    }

    // 4. Enviar correos de cobranza vía Resend a los deudores
    let sentCount = 0

    for (const student of unpaidStudents) {
      const sUser = Array.isArray(student.User) ? student.User[0] : student.User
      const teacher = Array.isArray(student.TeacherProfile) ? student.TeacherProfile[0] : student.TeacherProfile
      const tUser = Array.isArray(teacher.User) ? teacher.User[0] : teacher.User
      
      const teacherName = tUser.name
      const feeFormatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(student.monthly_fee || 0)

      if (sUser?.email && (student.monthly_fee || 0) > 0) {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: sUser.email,
            subject: `Resumen de Mensualidad - ${currentMonth.toUpperCase()}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 40px 20px; background-color: #f4f4f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); overflow: hidden;">
                  
                  <!-- HEADER (Accent Bar) -->
                  <tr>
                    <td style="height: 6px; background: linear-gradient(90deg, #8b5cf6, #3b82f6); width: 100%;"></td>
                  </tr>

                  <!-- MAIN CONTENT -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Icon / Avatar -->
                      <div style="width: 48px; height: 48px; background-color: #f3f4f6; border-radius: 16px; text-align: center; line-height: 48px; font-size: 20px; margin-bottom: 24px; color: #8b5cf6; font-weight: bold;">
                        💳
                      </div>

                      <h1 style="color: #09090b; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                        Hola ${sUser.name.split(' ')[0]}
                      </h1>
                      
                      <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                        Tu resumen de cuenta de <strong>${currentMonth}</strong> ya está disponible.
                      </p>

                      <!-- AMOUNT CARD -->
                      <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <p style="color: #71717a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Total a pagar</p>
                        <p style="color: #18181b; font-size: 38px; font-weight: 900; margin: 0; letter-spacing: -1px;">${feeFormatted}</p>
                      </div>

                      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 0 12px 12px 0;">
                        Por favor, ponte en contacto con <strong>${teacherName}</strong> para gestionar la transferencia.
                      </p>

                      <!-- DIVIDER -->
                      <hr style="border: none; border-top: 1px dashed #e4e4e7; margin: 32px 0;" />

                      <!-- FOOTER -->
                      <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                        Si ya realizaste el pago en las últimas horas, por favor ignora este mensaje.<br>
                        <em>Enviado de forma segura y automática.</em>
                      </p>

                    </td>
                  </tr>
                </table>

              </body>
              </html>
            `,
          }),
        })

        if (resendRes.ok) sentCount++
      }
    }

    return new Response(JSON.stringify({ 
      message: `Proceso completado. Se enviaron ${sentCount} recordatorios de cobro.` 
    }), { headers: { "Content-Type": "application/json" }, status: 200 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
