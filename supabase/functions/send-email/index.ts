import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getTemplate, EmailType } from "./templates.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = "Khora <hola@khora.cl>" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, type, params, subject } = await req.json()

    if (!to || !type || !params) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type, params" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const htmlContent = getTemplate(type as EmailType, params)

    if (!htmlContent) {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
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
    }

    const finalSubject = subject || defaultSubjects[type as EmailType] || "Notificación de Khora"

    // Enviar correo vía Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to,
        subject: finalSubject,
        html: htmlContent,
      }),
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
