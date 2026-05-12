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
            subject: `Cobro Mensualidad - ${currentMonth.toUpperCase()}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px;">
                <h1 style="color: #111; font-size: 24px; margin-bottom: 30px;">Hola ${sUser.name.split(' ')[0]},</h1>
                
                <p style="color: #444; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                  Tu mensualidad de <strong>${currentMonth}</strong> ya se encuentra disponible para pago.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Total a pagar</p>
                  <p style="color: #0f172a; font-size: 36px; font-weight: 900; margin: 0;">${feeFormatted}</p>
                </div>

                <p style="color: #444; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                  Por favor, ponte en contacto con <strong>${teacherName}</strong> para realizar la transferencia.
                </p>

                <p style="color: #888; font-size: 13px;">
                  Si ya realizaste este pago, por favor ignora este mensaje.
                </p>
              </div>
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
