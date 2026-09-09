import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

let SUPABASE_URL = ''
let SUPABASE_ANON_KEY = ''

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1]
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) SUPABASE_ANON_KEY = line.split('=')[1]
})

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
    .from("TeacherProfile")
    .select(`id, slug, instrumento, business_name, created_at, User:user_id(name, email)`)
    .limit(1)
  console.log("TeacherProfile:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}
test()
