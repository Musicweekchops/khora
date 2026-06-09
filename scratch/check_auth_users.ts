import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function checkAuthUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error("Error listing users:", error.message)
    return
  }

  console.log("=== AUTH USERS ===")
  const testUsers = data.users.filter(u => u.email?.includes("test"))
  testUsers.forEach(u => {
    console.log(`ID: ${u.id}`)
    console.log(`Email: ${u.email}`)
    console.log(`Role (from metadata): ${u.user_metadata?.role}`)
    console.log(`Metadata:`, JSON.stringify(u.user_metadata, null, 2))
    console.log("---")
  })
}

checkAuthUsers()
