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
    .from("StudentProfile")
    .select(`
      id,
      monthly_fee,
      User:user_id(name, email),
      Teacher:teacher_id(business_name, slug)
    `)
    .lt("monthly_fee", 90000)
    .gt("monthly_fee", 0)
    
  if (error) {
    console.error("Error:", error)
  } else {
    console.log(`Found ${data.length} students paying less than 90.000 (and more than 0)`)
    console.log(JSON.stringify(data, null, 2))
  }
}
test()
