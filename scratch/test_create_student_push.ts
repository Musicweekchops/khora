import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log("🔍 Consultando profesores y sus suscripciones push...")

  // 1. Obtener todos los profesores
  const { data: teachers, error: tErr } = await supabaseAdmin
    .from("TeacherProfile")
    .select(`
      id,
      user_id,
      User ( name, email )
    `)

  if (tErr || !teachers) {
    console.error("❌ Error al obtener profesores:", tErr)
    return
  }

  console.log(`✅ Profesores encontrados: ${teachers.length}`)

  let targetTeacher = null

  for (const t of teachers) {
    const user = Array.isArray(t.User) ? t.User[0] : t.User
    const name = user?.name || "Sin nombre"
    const email = user?.email || "Sin email"

    // 2. Obtener suscripciones para este profesor
    const { data: subs } = await supabaseAdmin
      .from("PushSubscription")
      .select("id")
      .eq("user_id", t.user_id)

    const subCount = subs ? subs.length : 0
    console.log(`• Profesor: ${name} (${email}) - ID Perfil: ${t.id} - Suscripciones Push: ${subCount}`)

    if (subCount > 0 && !targetTeacher) {
      targetTeacher = t
    }
  }

  // Si ningún profesor tiene suscripciones, usamos el primero
  if (!targetTeacher && teachers.length > 0) {
    targetTeacher = teachers[0]
  }

  if (!targetTeacher) {
    console.error("❌ No se encontraron profesores para probar.")
    return
  }

  const teacherUser = Array.isArray(targetTeacher.User) ? targetTeacher.User[0] : targetTeacher.User
  console.log(`\n🚀 Utilizando profesor para la prueba: ${teacherUser?.name} (ID: ${targetTeacher.id})`)

  // 3. Invocar la Edge Function create-student CON push (skipPush = false o no provisto)
  const testEmail = `test_push_student_${Date.now()}@khora.cl`
  console.log(`\n🧪 Invocando create-student para ${testEmail} (skipPush: omitido)...`)

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email: testEmail,
        password: "student_test_123",
        name: "Clotilde Alumna Prueba (Push)",
        phone: "+56911112222",
        teacher_id: targetTeacher.id
      })
    })

    const data = await res.json()
    console.log("Response Status:", res.status)
    console.log("Response Body:", data)

    if (res.ok && data?.userId) {
      console.log("✅ Estudiante creado exitosamente en base de datos.")

      // Limpiar el estudiante creado para no ensuciar la base de datos
      console.log("\n🧹 Limpiando estudiante de prueba...")
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(data.userId)
      if (delErr) {
        console.error("❌ Error al limpiar estudiante:", delErr.message)
      } else {
        console.log("✅ Estudiante de prueba eliminado de auth.users.")
      }
    } else {
      console.error("❌ Error en respuesta de Edge Function:", data)
    }
  } catch (err) {
    console.error("❌ Error excepcional:", err)
  }
}

run()
