import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

// VAPID keys for Khora Web Push
const VAPID_PUBLIC_KEY = "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"
const VAPID_PRIVATE_KEY = "HTsnrmAK-XWgfOHMO2u2I_t9rbL-4qmaisaF00mcEdI"
const VAPID_SUBJECT = "mailto:hola@khora.cl"

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("\n❌ Error: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.")
  console.error("Debes correr el comando pasando tus credenciales así:\n")
  console.error("NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx npx tsx scratch/test_push_tool.ts\n")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("🔍 Consultando dispositivos con notificaciones activas...")
  
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
    console.error("❌ Error de Supabase:", error.message)
    return
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("\n⚠️ No hay ninguna suscripción push registrada en la base de datos.")
    console.log("Asegúrate de que los usuarios hayan aceptado recibir notificaciones desde sus celulares/computadores en Khora.")
    return
  }

  console.log(`\n👥 Dispositivos registrados encontrados: ${subscriptions.length}`)
  console.log("--------------------------------------------------------------------------------")
  
  for (const sub of subscriptions) {
    const user = Array.isArray(sub.User) ? sub.User[0] : sub.User
    const name = user?.name || "Usuario Sin Nombre"
    const email = user?.email || "Sin Email"
    
    console.log(`• Alumno/Profesor: ${name} (${email})`)
  }
  
  console.log("--------------------------------------------------------------------------------")
  console.log("🚀 Enviando notificación de test a todos los dispositivos...")

  const payload = JSON.stringify({
    title: "⚡ Notificación de Prueba",
    body: "¡Tu canal de notificaciones push de Khora está activo y funcionando! 🥁🎸",
    url: "/dashboard"
  })

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    const user = Array.isArray(sub.User) ? sub.User[0] : sub.User
    const email = user?.email || "Sin Email"
    
    console.log(`[${i + 1}/${subscriptions.length}] Enviando a: ${email}...`)
    
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, payload)
      console.log("   ✅ ¡Notificación enviada exitosamente!")
    } catch (err: any) {
      console.error(`   ❌ Error de envío: ${err.message}`)
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log("   🧹 Suscripción expirada. Eliminándola de la base de datos...")
        await supabaseAdmin.from("PushSubscription").delete().eq("id", sub.id)
      }
    }
  }
  
  console.log("\n✨ Proceso terminado.")
}

run()
