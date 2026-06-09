import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("=== CHECKING FUNCTION DEFINITION ===")
  const { data: funcData, error: funcError } = await supabaseAdmin.rpc("get_function_def", { func_name: "handle_new_user" })
  if (funcError) {
    // If helper not available, let's query pg_proc directly via a simple select if we can, 
    // or try querying pg_proc via a custom rpc or just check the columns.
    console.log("Could not fetch definition via get_function_def, querying information_schema...")
  } else {
    console.log("Function Def:", funcData)
  }

  console.log("\n=== CHECKING TeacherProfile COLUMNS ===")
  const { data: cols, error: colsError } = await supabaseAdmin
    .from("TeacherProfile")
    .select("*")
    .limit(1)
  
  if (colsError) {
    console.error("Error reading TeacherProfile:", colsError)
  } else {
    console.log("TeacherProfile structure / sample:", cols)
  }

  console.log("\n=== CHECKING User COLUMNS ===")
  const { data: uCols, error: uColsError } = await supabaseAdmin
    .from("User")
    .select("*")
    .limit(1)
  
  if (uColsError) {
    console.error("Error reading User:", uColsError)
  } else {
    console.log("User structure / sample:", uCols)
  }
}

run()
