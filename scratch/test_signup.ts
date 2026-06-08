import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function runTest(name: string, email: string) {
  console.log(`\n=== Probando registro: "${name}" (${email}) ===`)

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "TestPassword123!",
    email_confirm: true,
    user_metadata: { name, role: "TEACHER", instrumento: "Guitarra", region: "Santiago" }
  })

  if (authError) { console.error("❌ Auth error:", authError.message); return }
  const userId = authData.user.id
  console.log(`✅ auth.users creado. ID: ${userId}`)

  await new Promise(r => setTimeout(r, 2000))

  const { data: pu } = await supabaseAdmin.from("User").select("id,name,role").eq("id", userId).maybeSingle()
  const { data: tp } = await supabaseAdmin.from("TeacherProfile").select("id,slug,instrumento").eq("user_id", userId).maybeSingle()

  console.log("public.User:", pu ? `✅ name="${pu.name}" role="${pu.role}"` : "❌ NO EXISTE")
  console.log("TeacherProfile:", tp ? `✅ slug="${tp.slug}" instrumento="${tp.instrumento}"` : "❌ NO EXISTE")

  // Cleanup
  await supabaseAdmin.auth.admin.deleteUser(userId)
  console.log("🧹 Usuario de prueba eliminado.")
}

async function main() {
  await runTest("Test Profesor", `test_ascii_${Date.now()}@khora.cl`)
  await runTest("Ritmática", `test_accent_${Date.now()}@khora.cl`)
}

main()
