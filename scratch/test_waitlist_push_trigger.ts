import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testWaitlistPush() {
  console.log("🔍 Buscando el usuario y TeacherProfile de arnaldoallende@hotmail.com...")
  
  const { data: user, error: userErr } = await supabaseAdmin
    .from("User")
    .select("id, name")
    .eq("email", "arnaldoallende@hotmail.com")
    .maybeSingle()

  if (userErr || !user) {
    console.error("❌ No se encontró el usuario:", userErr || "No existe")
    return
  }

  const { data: teacher, error: teacherErr } = await supabaseAdmin
    .from("TeacherProfile")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (teacherErr || !teacher) {
    console.error("❌ No se encontró el TeacherProfile para el usuario:", teacherErr || "No existe")
    return
  }

  console.log(`✅ Encontrado. Teacher ID: ${teacher.id}. Invocando Edge Function...`)

  // Invocar la Edge Function notify-waitlist-push
  try {
    const { data, error } = await supabaseAdmin.functions.invoke("notify-waitlist-push", {
      body: {
        teacherId: teacher.id,
        prospectName: "Daniel Gómez (Test)",
        dayOfWeek: 2, // Martes
        startTime: "19:00:00"
      }
    })

    if (error) {
      console.error("❌ Error de invocación de función:", error)
    } else {
      console.log("🎉 Resultado de la invocación:", data)
    }
  } catch (err) {
    console.error("❌ Error excepcional:", err)
  }
}

testWaitlistPush()
