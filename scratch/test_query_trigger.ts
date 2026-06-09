import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const userId = "9d644190-d829-41b8-a960-5cbf66eb2049"
  
  const { data: userRow } = await supabaseAdmin
    .from("User")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  const { data: teacherRow } = await supabaseAdmin
    .from("TeacherProfile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  console.log("User Row:", userRow)
  console.log("Teacher Row:", teacherRow)
}

check()
