import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

console.log("Supabase URL:", supabaseUrl)
console.log("Service Key defined:", !!supabaseServiceKey)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const { data: configs, error: configErr } = await supabaseAdmin
    .from("TeacherBillingConfig")
    .select("*, TeacherProfile(id, user_id, User:user_id(email, name))")
    .eq("gateway_enabled", true)
  
  console.log("Configs query result:")
  console.log(JSON.stringify(configs, null, 2))
  console.log("Error:", configErr)
}

check()
