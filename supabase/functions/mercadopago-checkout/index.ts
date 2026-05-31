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

  try {
    const { teacher_id, student_id, item_type, item_id, prospect_name, prospect_email, prospect_phone, selected_date, selected_slot, modalidad } = await req.json()

    if (!teacher_id || !item_type) {
      throw new Error("Missing required fields: teacher_id and item_type are mandatory.")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // 1. Verificar exclusividad: Solo habilitado para arnaldoallende@hotmail.com por ahora
    const { data: teacherProfile, error: profileErr } = await supabaseAdmin
      .from("TeacherProfile")
      .select("id, User ( email )")
      .eq("id", teacher_id)
      .maybeSingle()

    if (profileErr || !teacherProfile) {
      throw new Error("Teacher profile not found.")
    }

    const teacherEmail = (teacherProfile.User as any)?.email
    if (teacherEmail !== "arnaldoallende@hotmail.com") {
      throw new Error("La pasarela de pagos no está disponible para este profesor por el momento.")
    }

    // 2. Obtener credenciales de pago
    const { data: billingConfig, error: configErr } = await supabaseAdmin
      .from("TeacherBillingConfig")
      .select("*")
      .eq("teacher_id", teacher_id)
      .maybeSingle()

    if (configErr || !billingConfig || !billingConfig.gateway_enabled) {
      throw new Error("La pasarela de pagos no está configurada o se encuentra desactivada.")
    }

    // Determinar credenciales y URLs según el modo (Sandbox o Producción)
    const isSandbox = billingConfig.sandbox_mode
    const accessToken = isSandbox ? billingConfig.mp_sandbox_token : billingConfig.mp_access_token
    const publicKey = isSandbox ? billingConfig.mp_sandbox_key : billingConfig.mp_public_key

    if (!accessToken) {
      throw new Error("Faltan las credenciales secretas de Mercado Pago en la base de datos.")
    }

    // 3. Determinar el ítem, precio y descripción de la compra
    let itemName = "Servicio de Clases - Musicweekchops"
    let itemPrice = 0
    let payerName = prospect_name || "Alumno"
    let payerEmail = prospect_email || "hola@musicweekchops.com"
    let payerPhone = prospect_phone || ""

    if (item_type === "TRIAL") {
      // Clase de Prueba
      itemName = "Clase de Prueba de Batería (Musicweekchops)"
      itemPrice = billingConfig.trial_class_price || 25000
    } else if (item_type === "MONTHLY") {
      // Mensualidad de Alumno Activo
      if (!student_id) throw new Error("student_id is required for MONTHLY payments.")
      
      const { data: student, error: studentErr } = await supabaseAdmin
        .from("StudentProfile")
        .select("monthly_fee, User ( name, email, phone )")
        .eq("id", student_id)
        .maybeSingle()

      if (studentErr || !student) throw new Error("Student profile not found.")
      
      const sUser = student.User as any
      payerName = sUser?.name || payerName
      payerEmail = sUser?.email || payerEmail
      payerPhone = sUser?.phone || payerPhone
      itemPrice = Number(student.monthly_fee) || 90000 // Default 90.000 si está en 0
      itemName = `Mensualidad Clases de Batería - ${payerName}`
    } else if (item_type === "COURSE" || item_type === "PRODUCT") {
      // Compra de Material Digital / Cursos Extras
      if (!item_id) throw new Error("item_id is required for COURSE/PRODUCT purchases.")
      
      // Buscar el producto en la tabla Product
      const { data: productItem, error: prodErr } = await supabaseAdmin
        .from("Product")
        .select("title, price")
        .eq("id", item_id)
        .maybeSingle()

      if (prodErr || !productItem) throw new Error("Digital product not found.")
      
      if (student_id) {
        const { data: student } = await supabaseAdmin
          .from("StudentProfile")
          .select("User ( name, email, phone )")
          .eq("id", student_id)
          .maybeSingle()
        if (student?.User) {
          const sUser = student.User as any
          payerName = sUser?.name || payerName
          payerEmail = sUser?.email || payerEmail
          payerPhone = sUser?.phone || payerPhone
        }
      }

      itemName = `Producto Digital: ${productItem.title}`
      itemPrice = Number(productItem.price)
    } else {
      throw new Error("Invalid item_type provided.")
    }

    // 4. Crear la preferencia en Mercado Pago
    // URL de retorno de éxito
    const protocol = req.headers.get("x-forwarded-proto") || "https"
    const host = req.headers.get("host") || "khora.cl"
    const origin = `${protocol}://${host}`

    const mpPayload = {
      items: [
        {
          id: item_id || item_type,
          title: itemName,
          quantity: 1,
          currency_id: "CLP",
          unit_price: itemPrice
        }
      ],
      payer: {
        name: payerName,
        email: payerEmail,
        phone: {
          number: payerPhone.replace(/\+/g, "")
        }
      },
      back_urls: {
        success: `${origin}/dashboard/clases?payment=success`,
        failure: `${origin}/dashboard/clases?payment=failure`,
        pending: `${origin}/dashboard/clases?payment=pending`
      },
      auto_return: "approved",
      metadata: {
        teacher_id: teacher_id,
        student_id: student_id || null,
        item_type: item_type,
        item_id: item_id || null,
        prospect_name: payerName,
        prospect_email: payerEmail,
        prospect_phone: payerPhone,
        selected_date: selected_date || null,
        selected_slot: selected_slot || null,
        modalidad: modalidad || null
      },
      // URL del Webhook seguro
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`
    }

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(mpPayload)
    })

    const mpData = await mpRes.json()

    if (!mpRes.ok || mpData.error) {
      throw new Error(mpData.message || "Error al comunicarse con Mercado Pago.")
    }

    // Retornar el link adecuado según el modo
    const checkoutUrl = isSandbox ? mpData.sandbox_init_point : mpData.init_point

    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: checkoutUrl, 
      preferenceId: mpData.id,
      publicKey: publicKey 
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    })

  } catch (err: any) {
    console.error("Checkout Edge Function Error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 400
    })
  }
})
