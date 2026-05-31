import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Extraer ID de Pago
    let paymentId = ""
    
    if (req.method === "POST") {
      const body = await req.json()
      // Estructura webhook standard de Mercado Pago
      if (body.action === "payment.created" || body.action === "payment.updated") {
        paymentId = body.data?.id
      } else if (body.type === "payment") {
        paymentId = body.data?.id
      }
    } else {
      // Estructura IPN de Mercado Pago (por si acaso envía GET con query params)
      const url = new URL(req.url)
      const topic = url.searchParams.get("topic")
      if (topic === "payment") {
        paymentId = url.searchParams.get("id") ?? ""
      }
    }

    if (!paymentId) {
      // Retornar 200 para que Mercado Pago no reintente con errores si no es una acción de pago de interés
      return new Response(JSON.stringify({ message: "No payment ID found or action not relevant." }), { status: 200 })
    }

    console.log(`[Webhook] Procesando notificación de pago: ${paymentId}`)

    // 2. Obtener todas las configuraciones de facturación activas para descubrir la correspondiente
    const { data: configs, error: configErr } = await supabaseAdmin
      .from("TeacherBillingConfig")
      .select("*, TeacherProfile(id, user_id, User(email, name))")
      .eq("gateway_enabled", true)

    if (configErr || !configs || configs.length === 0) {
      throw new Error("No active payment configurations found in Khora.")
    }

    let paymentDetails = null
    let matchedConfig = null

    // Probar dinámicamente las credenciales hasta encontrar la dueña del pago
    for (const config of configs) {
      const token = config.sandbox_mode ? config.mp_sandbox_token : config.mp_access_token
      if (!token) continue

      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (mpRes.ok) {
          paymentDetails = await mpRes.json()
          matchedConfig = config
          break
        }
      } catch (err) {
        console.warn(`[Webhook] Token no válido para el pago ${paymentId}:`, err)
      }
    }

    if (!paymentDetails || !matchedConfig) {
      throw new Error(`Could not fetch details for payment ${paymentId} with any active credentials.`)
    }

    const { status, transaction_amount, metadata } = paymentDetails
    console.log(`[Webhook] Estado del pago ${paymentId}: ${status}`)

    // 3. Si el pago es Aprobado, procedemos a automatizar en base de datos
    if (status === "approved") {
      const teacherId = metadata.teacher_id
      const studentId = metadata.student_id
      const itemType = metadata.item_type
      const itemId = metadata.item_id
      const payerName = metadata.prospect_name
      const payerEmail = metadata.prospect_email
      const payerPhone = metadata.prospect_phone

      // 4. Idempotencia: Verificar si el pago ya fue registrado anteriormente en Khora
      const { data: existingPayment } = await supabaseAdmin
        .from("Payment")
        .select("id")
        .eq("mp_payment_id", paymentId)
        .maybeSingle()

      if (existingPayment) {
        console.log(`[Webhook] El pago ${paymentId} ya estaba registrado. Operación omitida.`)
        return new Response(JSON.stringify({ success: true, message: "Payment already processed." }), { status: 200 })
      }

      let targetStudentId = studentId

      // 5. Automatización según el tipo de Ítem cobrado:
      if (itemType === "TRIAL") {
        // A. CLASE DE PRUEBA: Confirmar y activar alumno
        // Buscar el StudentProfile temporal por correo
        const { data: student } = await supabaseAdmin
          .from("StudentProfile")
          .select("id, user_id")
          .eq("User.email", payerEmail.trim().toLowerCase())
          .maybeSingle()

        if (student) {
          targetStudentId = student.id
          
          // Actualizar estado del alumno a TRIAL e inicializar su mensualidad estándar a $90.000 CLP como solicitó Arnaldo
          await supabaseAdmin
            .from("StudentProfile")
            .update({ 
              status: "TRIAL", 
              monthly_fee: 90000 
            })
            .eq("id", student.id)

          // Confirmar el agendamiento (Booking) pendiente de esta clase de prueba
          await supabaseAdmin
            .from("Booking")
            .update({ status: "CONFIRMED" })
            .eq("email", payerEmail.trim().toLowerCase())
            .eq("teacher_id", teacherId)
            .eq("status", "PENDING")
        }
      } else if (itemType === "MONTHLY" && studentId) {
        // B. COBRO MENSUAL: Reactivar alumno activo
        await supabaseAdmin
          .from("StudentProfile")
          .update({ status: "ACTIVE" })
          .eq("id", studentId)
      } else if (itemType === "COURSE" && itemId) {
        // C. COMPRA DE CURSO DIGITAL / EXTRA: Desbloquear acceso en la biblioteca
        if (studentId) {
          // Insertar acceso a la biblioteca para este recurso
          const { error: accessErr } = await supabaseAdmin
            .from("StudentLibraryAccess")
            .upsert({
              student_id: studentId,
              content_id: itemId,
              assigned_by: teacherId
            }, { onConflict: "student_id,content_id" })

          if (accessErr) {
            console.error("[Webhook] Error otorgando acceso a biblioteca:", accessErr)
          }
        }
      }

      // 6. Registrar físicamente el pago en la tabla Payment
      if (targetStudentId) {
        const { error: insertPayErr } = await supabaseAdmin
          .from("Payment")
          .insert({
            student_id: targetStudentId,
            teacher_id: teacherId,
            amount: transaction_amount,
            method: "CARD",
            date: new Date().toISOString().split("T")[0],
            notes: `Pago automático aprobado vía Mercado Pago. (${paymentDetails.description || itemType})`,
            payment_type: itemType === "MONTHLY" ? "MONTHLY" : "SINGLE",
            mp_payment_id: paymentId
          })

        if (insertPayErr) {
          console.error("[Webhook] Error registrando pago en tabla:", insertPayErr)
        }

        // Actualizar el LTV (Lifetime Value) del estudiante sumando sus aportes históricos
        const { data: allPayments } = await supabaseAdmin
          .from("Payment")
          .select("amount")
          .eq("student_id", targetStudentId)

        const totalLtv = (allPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)

        await supabaseAdmin
          .from("StudentProfile")
          .update({ lifetime_value: totalLtv })
          .eq("id", targetStudentId)
      }

      // 7. Notificación Web Push instantánea al dispositivo del profesor
      const teacherUserId = matchedConfig.TeacherProfile?.user_id
      const teacherName = matchedConfig.TeacherProfile?.User?.name || "Profesor"
      
      if (teacherUserId) {
        try {
          const { data: subs } = await supabaseAdmin
            .from("PushSubscription")
            .select("*")
            .eq("user_id", teacherUserId)

          if (subs && subs.length > 0) {
            const webpush = await import("https://esm.sh/web-push@3.6.7")
            webpush.setVapidDetails(
              "mailto:hola@khora.cl",
              "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4",
              "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
            )

            let pushMsg = `${payerName} acaba de realizar un pago de $${transaction_amount.toLocaleString("es-CL")} CLP.`
            if (itemType === "TRIAL") pushMsg = `🥁 ¡Clase de Prueba PAGADA y confirmada por ${payerName}!`
            if (itemType === "COURSE") pushMsg = `📚 ¡${payerName} compró el curso: ${paymentDetails.description}!`

            const payload = JSON.stringify({
              title: "💰 ¡Pago Recibido Exitosamente!",
              body: pushMsg,
              url: "/dashboard/financiero"
            })

            for (const sub of subs) {
              try {
                await webpush.sendNotification({
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, payload)
              } catch (pushErr: any) {
                if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                  await supabaseAdmin.from("PushSubscription").delete().eq("id", sub.id)
                }
              }
            }
          }
        } catch (err) {
          console.error("[Webhook] Error enviando alerta Web Push:", err)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })

  } catch (err: any) {
    console.error("[Webhook Error]:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    })
  }
})
