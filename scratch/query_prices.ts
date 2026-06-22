import { createClient } from "@supabase/supabase-js"


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("Supabase URL:", supabaseUrl)
  
  const { data: classTypes, error: ctError } = await supabaseAdmin
    .from("ClassType")
    .select("id, name, price, duration, teacher_id")
  
  console.log("--- ClassTypes ---")
  if (ctError) console.error("ClassType error:", ctError)
  else console.log(JSON.stringify(classTypes, null, 2))

  const { data: billingConfigs, error: bcError } = await supabaseAdmin
    .from("TeacherBillingConfig")
    .select("id, teacher_id, trial_class_price, gateway_enabled")

  console.log("--- TeacherBillingConfig ---")
  if (bcError) console.error("Billing config error:", bcError)
  else console.log(JSON.stringify(billingConfigs, null, 2))
}

run()
