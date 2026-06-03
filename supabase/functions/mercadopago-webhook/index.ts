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
    const amountVal = Number(transaction_amount || 0)
    console.log(`[Webhook] Estado del pago ${paymentId}: ${status}`)

    // Safe extraction of TeacherProfile and User (handling potential array wrapping by PostgREST)
    const rawTp = matchedConfig.TeacherProfile
    const teacherProfileObj = Array.isArray(rawTp) ? rawTp[0] : rawTp
    const rawUser = teacherProfileObj?.User
    const teacherUserObj = Array.isArray(rawUser) ? rawUser[0] : rawUser

    const teacherName = teacherUserObj?.name || "Profesor"
    const teacherEmail = teacherUserObj?.email || ""
    const teacherUserId = teacherProfileObj?.user_id || ""

    // 3. Si el pago es Aprobado, procedemos a automatizar en base de datos
    if (status === "approved") {
      const parseVal = (v: any) => {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return null;
        return s;
      };

      const teacherId = parseVal(metadata.teacher_id)
      const studentId = parseVal(metadata.student_id)
      const itemType = parseVal(metadata.item_type)
      const itemId = parseVal(metadata.item_id)
      const payerName = parseVal(metadata.prospect_name) || "Alumno"
      const payerEmail = parseVal(metadata.prospect_email)
      const payerPhone = parseVal(metadata.prospect_phone) || ""
      const selectedDate = parseVal(metadata.selected_date)
      const selectedSlot = parseVal(metadata.selected_slot)
      const modalidad = parseVal(metadata.modalidad) || "presencial"

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
        // A. CLASE DE PRUEBA: Crear cuenta, registrar reserva CONFIRMED y agendar clase física
        
        // 1. Intentar buscar si el usuario/alumno ya existe por correo electrónico
        // Buscamos primero en la tabla User para resolver la relación
        let publicUser = null
        if (payerEmail) {
          const { data: foundUser } = await supabaseAdmin
            .from("User")
            .select("id")
            .eq("email", payerEmail.trim().toLowerCase())
            .maybeSingle()
          publicUser = foundUser
        }

        let targetStudent = null

        if (publicUser) {
          const { data: student } = await supabaseAdmin
            .from("StudentProfile")
            .select("id")
            .eq("user_id", publicUser.id)
            .maybeSingle()
          targetStudent = student
        }

        if (!targetStudent && payerEmail) {
          // Si el alumno no existe, creamos su cuenta invocando nuestra Edge Function create-student
          try {
            console.log(`[Webhook] Estudiante no encontrado. Creando automáticamente mediante create-student para: ${payerEmail}`)
            const studentRes = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({
                email: payerEmail.trim().toLowerCase(),
                password: "student123", // Contraseña temporal
                name: (payerName || "Alumno").trim(),
                phone: payerPhone,
                teacher_id: teacherId
              })
            })
            
            if (studentRes.ok) {
              const studentData = await studentRes.json()
              if (studentData?.userId) {
                const { data: student } = await supabaseAdmin
                  .from("StudentProfile")
                  .select("id")
                  .eq("user_id", studentData.userId)
                  .maybeSingle()
                targetStudent = student
              }
            } else {
              console.error("[Webhook] Falló la creación del estudiante:", await studentRes.text())
            }
          } catch (createErr) {
            console.error("[Webhook] Error excepcional llamando a create-student:", createErr)
          }
        }

        if (targetStudent) {
          targetStudentId = targetStudent.id
          
          // Actualizar estado del alumno a TRIAL e inicializar su mensualidad estándar a $90.000 CLP
          await supabaseAdmin
            .from("StudentProfile")
            .update({ 
              status: "TRIAL", 
              monthly_fee: 90000 
            })
            .eq("id", targetStudent.id)
        }

        // 2. Insertar la reserva (Booking) directamente como CONFIRMED
        if (selectedDate && selectedSlot) {
          const [h, m] = selectedSlot.split(":").map(Number)
          const endD = new Date()
          endD.setHours(h, m + 60, 0, 0)
          const endTimeStr = `${String(endD.getHours()).padStart(2, "0")}:${String(endD.getMinutes()).padStart(2, "0")}:00`

          const { data: newBooking, error: bookingInsertErr } = await supabaseAdmin
            .from("Booking")
            .insert({
              teacher_id: teacherId,
              name: payerName.trim(),
              email: payerEmail.trim().toLowerCase(),
              phone: payerPhone,
              date: selectedDate,
              start_time: selectedSlot,
              end_time: endTimeStr,
              total_price: amountVal || 25000,
              status: "CONFIRMED"
            })
            .select("id")
            .maybeSingle()

          if (bookingInsertErr) {
            console.error("[Webhook] Error al insertar booking:", bookingInsertErr)
          }

          // 3. Crear la sesión de clase física real directamente confirmada en la agenda (Class table)
          if (targetStudentId && newBooking) {
            console.log(`[Webhook] Insertando clase física en la agenda para la reserva aprobada: ${selectedDate} a las ${selectedSlot}`)
            const { error: classInsertErr } = await supabaseAdmin
              .from("Class")
              .insert({
                teacher_id: teacherId,
                student_id: targetStudentId,
                booking_id: newBooking.id,
                date: selectedDate,
                start_time: selectedSlot,
                end_time: endTimeStr,
                duration: 60,
                modalidad: modalidad,
                status: "CONFIRMED",
                is_recurring: false
              })

            if (classInsertErr) {
              console.error("[Webhook] Error al insertar clase física:", classInsertErr)
            }

            // A. Enviar correo de confirmación de clase al alumno
            try {
              console.log(`[Webhook] Enviando correo de confirmación de clase al alumno: ${payerEmail}`)
              const emailConfirmRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({
                  to: payerEmail.trim().toLowerCase(),
                  type: "CLASS_CONFIRMATION",
                  params: {
                    studentName: payerName.trim(),
                    modalidad: modalidad === "online" ? "Virtual (📹 Zoom/Meet)" : "Presencial (🏠 Estudio)",
                    date: new Date(selectedDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }),
                    time: selectedSlot.slice(0, 5),
                    link: "https://khora.cl/login"
                  }
                })
              })
              if (!emailConfirmRes.ok) {
                console.error("[Webhook] Error response from class confirmation email to student:", await emailConfirmRes.text())
              }
            } catch (err) {
              console.error("[Webhook] Error al enviar confirmación de clase por correo al alumno:", err)
            }

            // B. Enviar correo de notificación de nuevo alumno al profesor
            if (teacherEmail) {
              try {
                console.log(`[Webhook] Enviando correo de notificación de nuevo alumno al profesor: ${teacherEmail}`)
                const teacherEmailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`
                  },
                  body: JSON.stringify({
                    to: teacherEmail,
                    type: "TEACHER_NEW_STUDENT",
                    params: {
                      teacherName: teacherName,
                      studentName: payerName.trim(),
                      email: payerEmail.trim().toLowerCase(),
                      phone: payerPhone
                    }
                  })
                })
                if (!teacherEmailRes.ok) {
                  console.error("[Webhook] Error response from new student email to teacher:", await teacherEmailRes.text())
                }
              } catch (err) {
                console.error("[Webhook] Error al enviar notificación de nuevo alumno por correo al profesor:", err)
              }
            }
          }
        }
      } else if (itemType === "MONTHLY" && studentId) {
        // B. COBRO MENSUAL: Reactivar alumno activo
        await supabaseAdmin
          .from("StudentProfile")
          .update({ status: "ACTIVE" })
          .eq("id", studentId)
      } else if ((itemType === "COURSE" || itemType === "PRODUCT") && itemId) {
        // C. COMPRA DE PRODUCTO DIGITAL / PLAN / EXTRA: Registrar en la tabla Purchase
        if (studentId) {
          // 1. Registrar la compra
          const { error: purchaseErr } = await supabaseAdmin
            .from("Purchase")
            .upsert({
              student_id: studentId,
              product_id: itemId,
              teacher_id: teacherId,
              amount_paid: amountVal,
              payment_method: 'MERCADOPAGO',
              mp_payment_id: paymentId,
              status: 'COMPLETED'
            }, { onConflict: "student_id,product_id" })

          if (purchaseErr) {
            console.error("[Webhook] Error registrando compra de producto:", purchaseErr)
          }

          // 2. Consultar si el producto es de tipo 'PLAN'
          const { data: product } = await supabaseAdmin
            .from("Product")
            .select("type, duration_months")
            .eq("id", itemId)
            .maybeSingle()

          if (product && product.type === "PLAN") {
            const months = Number(product.duration_months || 1)
            const expirationDate = new Date()
            expirationDate.setMonth(expirationDate.getMonth() + months)

            const { error: profileErr } = await supabaseAdmin
              .from("StudentProfile")
              .update({
                status: "ACTIVE",
                subscription_expires_at: expirationDate.toISOString()
              })
              .eq("id", studentId)

            if (profileErr) {
              console.error("[Webhook] Error actualizando membresía del alumno:", profileErr)
            }
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
            amount: amountVal,
            method: "MERCADOPAGO",
            date: new Date().toISOString().split("T")[0],
            notes: `Pago automático aprobado vía Mercado Pago. (${paymentDetails.description || itemType})`,
            payment_type: itemType === "MONTHLY" ? "MONTHLY" : "SINGLE",
            mp_payment_id: paymentId
          })

        if (insertPayErr) {
          console.error("[Webhook] Error registrando pago en tabla:", insertPayErr)
        }

        // Enviar correo de confirmación de pago (recibo de pago) al alumno
        if (payerEmail) {
          try {
            console.log(`[Webhook] Enviando recibo de pago por correo a: ${payerEmail}`)
            const emailReceiptRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
              },
              body: JSON.stringify({
                to: payerEmail.trim().toLowerCase(),
                type: "PAYMENT_CONFIRMATION",
                params: {
                  studentName: payerName || "Estudiante",
                  itemName: paymentDetails.description || (itemType === "TRIAL" ? "Clase de prueba" : itemType === "MONTHLY" ? "Mensualidad de clases" : "Servicio Khora"),
                  amount: amountVal,
                  paymentId: paymentId
                }
              })
            })
            if (!emailReceiptRes.ok) {
              console.error("[Webhook] Error response from payment confirmation email:", await emailReceiptRes.text())
            }
          } catch (err) {
            console.error("[Webhook] Error al enviar correo de recibo de pago al alumno:", err)
          }
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

            let pushTitle = "💰 ¡Pago Recibido Exitosamente!"
            let pushMsg = `${payerName} acaba de realizar un pago de $${amountVal.toLocaleString("es-CL")} CLP.`
            
            if (itemType === "TRIAL") {
              let formattedDateStr = selectedDate || ""
              try {
                if (selectedDate) {
                  formattedDateStr = new Date(selectedDate + "T12:00").toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric"
                  })
                }
              } catch (_) {}
              pushTitle = "👤 ¡Clase de Prueba Agendada! 🎉"
              pushMsg = `${payerName} pagó y agendó una clase de prueba para el ${formattedDateStr} a las ${selectedSlot ? selectedSlot.slice(0, 5) : ""} hs.`
            } else if (itemType === "COURSE" || itemType === "PRODUCT") {
              pushTitle = "📚 ¡Nueva Venta de Curso! 💰"
              pushMsg = `${payerName} compró un producto/curso por $${amountVal.toLocaleString("es-CL")} CLP.`
            } else if (itemType === "MONTHLY") {
              pushTitle = "💵 ¡Mensualidad Recibida! 💳"
              pushMsg = `Alumno ${payerName} registró pago mensual de $${amountVal.toLocaleString("es-CL")} CLP.`
            }

            const payload = JSON.stringify({
              title: pushTitle,
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
