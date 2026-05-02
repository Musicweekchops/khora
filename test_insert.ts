import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testSelect() {
  const { data, error } = await supabaseAdmin
    .from("ClassNote")
    .select("*, LibraryContent!ClassNote_content_id_fkey(title, url, type)")
    .limit(1)

  console.log("Data:", data)
  console.log("Error:", error)
}

testSelect()
