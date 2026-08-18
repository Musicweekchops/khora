import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

async function run() {
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes("placeholder")) {
    console.log("No live credentials found in process.env")
    return
  }

  const client = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await client.storage.createBucket("payment-receipts", {
    public: true
  })

  if (error) {
    console.log("Bucket status:", error.message)
  } else {
    console.log("Bucket created successfully:", data)
  }
}

run()
