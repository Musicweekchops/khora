import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createAcademy() {
  const email = "academy_test@khora.cl"
  const password = "Password123!"
  const slug = "tempo"
  const academyName = "Academia Tempo"

  console.log(`Checking if user ${email} already exists...`)
  const { data: users, error: userFindError } = await supabaseAdmin
    .from("User")
    .select("id, role")
    .eq("email", email)

  let userId: string

  if (users && users.length > 0) {
    userId = users[0].id
    console.log(`User already exists with ID: ${userId}, role: ${users[0].role}`)
    // Ensure role is ACADEMY
    if (users[0].role !== "ACADEMY") {
      console.log("Updating user role to ACADEMY...")
      await supabaseAdmin.from("User").update({ role: "ACADEMY" }).eq("id", userId)
    }
  } else {
    console.log("Creating new Auth user...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: academyName, role: "ACADEMY" }
    })

    if (authError) {
      console.error("❌ Auth error:", authError.message)
      return
    }
    userId = authData.user.id
    console.log(`✅ auth.users created. ID: ${userId}`)
    
    // Ensure user row exists in public.User
    const { error: userInsertError } = await supabaseAdmin.from("User").upsert({
      id: userId,
      email,
      name: academyName,
      role: "ACADEMY"
    })
    if (userInsertError) {
      console.error("❌ Error inserting public.User:", userInsertError.message)
      return
    }
    console.log("✅ public.User row created.")
  }

  // Check if AcademyProfile exists
  const { data: profiles, error: profileFindError } = await supabaseAdmin
    .from("AcademyProfile")
    .select("id, slug")
    .eq("user_id", userId)

  if (profiles && profiles.length > 0) {
    console.log(`✅ AcademyProfile already exists. ID: ${profiles[0].id}, slug: ${profiles[0].slug}`)
  } else {
    console.log("Creating AcademyProfile...")
    const { data: newProfile, error: profileInsertError } = await supabaseAdmin
      .from("AcademyProfile")
      .insert({
        user_id: userId,
        name: academyName,
        slug,
        region: "Santiago (Metropolitana)",
        description: "Academia de música de prueba",
        plan: "manual",
        is_active: true
      })
      .select()

    if (profileInsertError) {
      console.error("❌ Error creating AcademyProfile:", profileInsertError.message)
      return
    }
    console.log(`✅ AcademyProfile created successfully! Slug is: "${slug}"`)
  }

  console.log("\n=== CREDENTIALS TO LOG IN ===")
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`URL de Booking: http://localhost:3000/agendar?a=${slug}`)
  console.log("=============================")
}

createAcademy()
