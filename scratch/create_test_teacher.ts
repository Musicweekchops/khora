import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  const teacherEmail = "profesor_test@khora.cl"
  const teacherPassword = "Password123!"
  const teacherName = "Profesor de Prueba"
  const instrumento = "Batería"

  // 1. Get the academy id
  const { data: academy, error: acError } = await supabaseAdmin
    .from("AcademyProfile")
    .select("id")
    .eq("slug", "tempo")
    .single()

  if (acError || !academy) {
    console.error("❌ Academy 'tempo' not found. Run create_test_academy.ts first.", acError)
    return
  }
  const academyId = academy.id
  console.log(`✅ Found academy ID: ${academyId}`)

  // 2. Clean up existing teacher if any in auth.users
  console.log("Checking if teacher user already exists in auth.users...")
  const { data: usersList } = await supabaseAdmin.auth.admin.listUsers()
  const match = usersList?.users.find(u => u.email === teacherEmail)
  if (match) {
    console.log(`Cleaning up existing auth user ID: ${match.id}`)
    await supabaseAdmin.auth.admin.deleteUser(match.id)
  }

  // 3. Create Auth user
  console.log("Creating new teacher in Auth...")
  const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: teacherEmail,
    password: teacherPassword,
    email_confirm: true,
    user_metadata: {
      name: teacherName,
      role: "TEACHER",
      instrumento: instrumento,
      academy_id: academyId,
    },
  })

  if (createErr || !userData.user) {
    console.error("❌ Auth error creating teacher:", JSON.stringify(createErr, null, 2))
    return
  }
  const newUserId = userData.user.id
  console.log(`✅ Teacher Auth created. ID: ${newUserId}`)

  // 4. Wait for trigger
  console.log("Waiting for trigger to complete...")
  await new Promise((r) => setTimeout(r, 2000))

  // 5. Check if TeacherProfile was created and associated
  const { data: teacherProfile, error: tpErr } = await supabaseAdmin
    .from("TeacherProfile")
    .select("id, academy_id")
    .eq("user_id", newUserId)
    .maybeSingle()

  if (tpErr || !teacherProfile) {
    console.error("❌ TeacherProfile not created by trigger!", tpErr)
    return
  }
  console.log(`✅ TeacherProfile found. ID: ${teacherProfile.id}, academy_id: ${teacherProfile.academy_id}`)

  // 6. Link to academy in AcademyTeacher
  console.log("Linking teacher in AcademyTeacher...")
  const { error: atErr } = await supabaseAdmin
    .from("AcademyTeacher")
    .insert({ academy_id: academyId, teacher_id: teacherProfile.id, status: "ACTIVE" })

  if (atErr) {
    console.error("❌ Error creating AcademyTeacher:", atErr.message)
    return
  }
  console.log("✅ AcademyTeacher association created successfully!")

  // 7. Verify teacher dashboard permissions / sidebar context
  console.log("\n=== TEACHER CREDENTIALS ===")
  console.log(`Email: ${teacherEmail}`)
  console.log(`Password: ${teacherPassword}`)
  console.log("===========================")
}

run()
