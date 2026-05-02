import { createClient } from "@supabase/supabase-js"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testQuery() {
  const { data, error } = await supabaseAdmin
    .from("Class")
    .select(`id, TeacherProfile ( User ( name ) )`)
    .limit(1)

  console.log(JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

testQuery()
