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

  const isCancelled = status === "CANCELLED" || status === "STUDENT_CLASS_CANCELLED" || status === "STUDENT_CLASS_DELETED"
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
      TEACHER_NEW_BOOKING: "Nueva solicitud de reserva de clase 🔔",
      STUDENT_BOOKING_REJECTED: "Tu solicitud de reserva no pudo ser confirmada ✕",
      STUDENT_CLASS_RESCHEDULED: "🔄 Tu clase de música ha sido reprogramada",
      STUDENT_BOOKING_REQUEST: "Solicitud de reserva recibida ⏳",
      STUDENT_CLASS_DELETED: "Tu clase de música ha sido eliminada",
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
    const isClassNotification = ['STUDENT_CLASS_CONFIRMED', 'TEACHER_CLASS_RESCHEDULED', 'STUDENT_CLASS_CANCELLED', 'STUDENT_CLASS_RESCHEDULED', 'CLASS_CONFIRMATION', 'STUDENT_BOOKING_REQUEST', 'STUDENT_CLASS_DELETED'].includes(type)
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
            filename: `clase-khora${type === 'STUDENT_CLASS_CANCELLED' || type === 'STUDENT_CLASS_DELETED' ? '-cancelada' : ''}.ics`,
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
