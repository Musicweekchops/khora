import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

// ==========================================
// CONFIGURACIÓN DE LAS LLAVES DE NOTIFICACIÓN
// ==========================================
const VAPID_PUBLIC_KEY = "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"
const VAPID_PRIVATE_KEY = "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
const VAPID_SUBJECT = "mailto:hola@khora.cl"

// Configurar Web Push
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

// ==========================================
// CONFIGURACIÓN DE CREDENCIALES SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("\n❌ Faltan las variables de entorno para conectarse a Supabase.")
  console.error("Asegúrate de ejecutar el script con:")
  console.error("NEXT_PUBLIC_SUPABASE_URL=tu_url SUPABASE_SERVICE_ROLE_KEY=tu_service_key npx tsx test_push_greeting.ts\n")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ==========================================
// MENSAJE DE SALUDO PERSONALIZABLE
// ==========================================
const payload = JSON.stringify({
  title: "👋 ¡Hola de parte de Khora!",
  body: "Este es un test de saludo para verificar que tus notificaciones están activas. ¡Buen día! 🥁🎸",
  url: "/dashboard" // Redirecciona al dashboard al hacer click
})

async function sendGreetingTest() {
  console.log("--------------------------------------------------")
  console.log("🚀 INICIANDO TEST DE SALUDO - NOTIFICACIONES PUSH")
  console.log("--------------------------------------------------")

  // 1. Obtener todas las suscripciones push activas en el sistema
  console.log("🔍 Consultando suscripciones en la tabla PushSubscription...")
  const { data: subscriptions, error } = await supabaseAdmin
    .from("PushSubscription")
    .select(`
      id,
      user_id,
      endpoint,
      p256dh,
      auth,
      User:user_id ( name, email )
    `)

  if (error) {
    console.error("❌ Error al obtener suscripciones de Supabase:", error.message)
    return
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("⚠️ No se encontraron suscripciones activas en la base de datos.")
    console.log("Asegúrate de que los usuarios hayan aceptado las notificaciones en sus celulares/dispositivos.")
    return
  }

  console.log(`✅ Se encontraron ${subscriptions.length} suscripción(es) activa(s).`)
  console.log("Preparando envíos de notificación...\n")

  let successCount = 0
  let failCount = 0
  let deletedCount = 0

  // 2. Enviar a cada suscripción
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    const user = Array.isArray(sub.User) ? sub.User[0] : sub.User
    const userName = user?.name || "Usuario Desconocido"
    const userEmail = user?.email || "Sin email"

    console.log(`[${i + 1}/${subscriptions.length}] Enviando a: ${userName} (${userEmail})`)

    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, payload)

      console.log(`   ✅ ¡Notificación enviada con éxito!`)
      successCount++
    } catch (err: any) {
      console.error(`   ❌ Falló el envío: ${err.message}`)
      if (err.statusCode) {
        console.error(`      Status Code: ${err.statusCode}`)
      }
      if (err.body) {
        console.error(`      Response Body: ${err.body}`)
      }
      if (err.headers) {
        console.error(`      Response Headers:`, JSON.stringify(err.headers, null, 2))
      }
      
      // Si la suscripción ya no es válida (statusCode 410 o 404), la limpiamos para mantener la BD limpia
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`   🧹 Limpiando suscripción expirada de la base de datos...`)
        const { error: delErr } = await supabaseAdmin
          .from("PushSubscription")
          .delete()
          .eq("id", sub.id)

        if (delErr) {
          console.error(`   ⚠️ Error al eliminar suscripción expirada:`, delErr.message)
        } else {
          console.log(`   ✅ Suscripción obsoleta eliminada.`)
          deletedCount++
        }
      }
      failCount++
    }
  }

  console.log("\n--------------------------------------------------")
  console.log("📊 RESUMEN DE ENVÍOS:")
  console.log(`   - Exitosos: ${successCount}`)
  console.log(`   - Fallidos: ${failCount}`)
  console.log(`   - Suscripciones obsoletas eliminadas: ${deletedCount}`)
  console.log("--------------------------------------------------")
  console.log("✨ Proceso terminado.")
}

sendGreetingTest()
