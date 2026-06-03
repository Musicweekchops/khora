import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

console.log("Supabase URL:", supabaseUrl)
console.log("Service Key defined:", !!supabaseServiceKey)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  console.log("=== LAST 5 BOOKINGS ===")
  const { data: bookings, error: bErr } = await supabaseAdmin
    .from("Booking")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
  console.log(bookings || bErr)

  console.log("=== LAST 5 PAYMENTS ===")
  const { data: payments, error: pErr } = await supabaseAdmin
    .from("Payment")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
  console.log(payments || pErr)

  console.log("=== LAST 5 USERS ===")
  const { data: users, error: uErr } = await supabaseAdmin
    .from("User")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
  console.log(users || uErr)

  console.log("=== LAST 5 StudentProfiles ===")
  const { data: students, error: sErr } = await supabaseAdmin
    .from("StudentProfile")
    .select("*, User(name, email)")
    .order("created_at", { ascending: false })
    .limit(5)
  console.log(students || sErr)
}

check()
