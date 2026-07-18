import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("=== BOOKING DETAIL ===")
  const { data: booking, error: bErr } = await supabaseAdmin
    .from("Booking")
    .select("*, ClassType(*)")
    .eq("id", "bc8e972f-7acd-40fc-9042-c218f4b4a30a")
    .single()

  if (bErr) {
    console.error("Error booking:", bErr)
  } else {
    console.log(booking)
  }

  console.log("=== RELATED PAYMENTS ===")
  const { data: payments, error: pErr } = await supabaseAdmin
    .from("Payment")
    .select("*")
    .eq("student_id", booking?.student_id || "") // Wait, does booking have student_id?

  console.log(payments || pErr)
  
  console.log("=== RELATED CLASSES ===")
  const { data: classes, error: cErr } = await supabaseAdmin
    .from("Class")
    .select("*")
    .eq("booking_id", "bc8e972f-7acd-40fc-9042-c218f4b4a30a")
  console.log(classes || cErr)
}

run()
