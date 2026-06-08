import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function backfillRegionAndInstrumento() {
  console.log("🔍 Obteniendo todos los usuarios de auth.users...")
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) { console.error("❌ Error:", listErr.message); return }

  console.log(`📋 Total usuarios en auth: ${users.length}\n`)

  let updated = 0
  let skipped = 0

  for (const authUser of users) {
    const meta = authUser.user_metadata || {}
    const role = meta.role
    if (role !== "TEACHER") continue

    const region     = meta.region     || null
    const instrumento = meta.instrumento || null

    // Solo actualizar si hay datos para rellenar
    if (!region && !instrumento) { skipped++; continue }

    // Buscar el TeacherProfile actual
    const { data: tp } = await supabaseAdmin
      .from("TeacherProfile")
      .select("id, region, instrumento")
      .eq("user_id", authUser.id)
      .maybeSingle()

    if (!tp) { console.log(`⚠️  Sin TeacherProfile: ${authUser.email}`); continue }

    // Solo actualizar campos que están null en la DB pero tienen valor en metadata
    const updates: Record<string, string> = {}
    if (!tp.region     && region)      updates.region      = region
    if (!tp.instrumento && instrumento) updates.instrumento = instrumento

    if (Object.keys(updates).length === 0) { skipped++; continue }

    const { error: updErr } = await supabaseAdmin
      .from("TeacherProfile")
      .update(updates)
      .eq("id", tp.id)

    if (updErr) {
      console.error(`❌ Error actualizando ${authUser.email}:`, updErr.message)
    } else {
      console.log(`✅ ${authUser.email} → ${JSON.stringify(updates)}`)
      updated++
    }
  }

  console.log(`\n📊 Resumen: ${updated} perfiles actualizados, ${skipped} sin cambios.`)
}

backfillRegionAndInstrumento()
