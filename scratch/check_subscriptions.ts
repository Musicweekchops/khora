import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("=== TEACHERS ===")
  const { data: teachers, error: tErr } = await supabaseAdmin
    .from("TeacherProfile")
    .select("id, user_id, slug, User ( id, name, email )")
  
  if (tErr) {
    console.error("Error fetching teachers:", tErr)
  } else {
    console.log(teachers)
  }

  console.log("=== PUSH SUBSCRIPTIONS ===")
  const { data: subs, error: sErr } = await supabaseAdmin
    .from("PushSubscription")
    .select("id, user_id, endpoint, created_at")
  
  if (sErr) {
    console.error("Error fetching subscriptions:", sErr)
  } else {
    console.log(subs)
  }
}

run()
