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

    // 3. Filtrar alumnos aplicables que NO han pagado este mes
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
      
      const academyName = teacher.business_name || tUser.name

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
            subject: `Recordatorio de Mensualidad - ${currentMonth.toUpperCase()} 💳`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333;">Hola ${sUser.name},</h2>
                <p>Este es un recordatorio automático de <strong>${academyName}</strong>.</p>
                <p>Te recordamos que la mensualidad correspondiente al mes de <strong>${currentMonth}</strong> ya se encuentra disponible para pago.</p>
                <p>Por favor, ponte en contacto con tu profesor para gestionar la transferencia o pago en efectivo.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Este es un mensaje automatizado enviado a través de la plataforma Khora.</p>
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
