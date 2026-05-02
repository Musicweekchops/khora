import { createClient } from "@supabase/supabase-js"

// Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
// configurados en tu entorno o en este script (para uso temporal).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixStudents() {
  console.log("Iniciando reparación de alumnos...")

  // 1. Obtener todos los alumnos que tienen rol STUDENT en User
  const { data: students, error: fetchErr } = await supabaseAdmin
    .from("User")
    .select("id, email, name")
    .eq("role", "STUDENT")

  if (fetchErr) {
    console.error("Error obteniendo alumnos:", fetchErr)
    return
  }

  if (!students || students.length === 0) {
    console.log("No se encontraron alumnos para arreglar.")
    return
  }

  console.log(`Se encontraron ${students.length} alumnos. Actualizando contraseñas a 'student123'...`)

  let successCount = 0
  let errorCount = 0

  // 2. Iterar sobre cada alumno y actualizar su contraseña con la API de Admin
  for (const student of students) {
    console.log(`Procesando a: ${student.name} (${student.email})`)
    
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      student.id,
      { password: "student123" }
    )

    if (updateErr) {
      console.error(`❌ Error actualizando a ${student.email}:`, updateErr.message)
      errorCount++
    } else {
      console.log(`✅ Contraseña de ${student.email} arreglada exitosamente.`)
      successCount++
    }
  }

  console.log("\n--- RESUMEN ---")
  console.log(`Alumnos arreglados: ${successCount}`)
  console.log(`Errores: ${errorCount}`)
  console.log("----------------")
}

fixStudents()
