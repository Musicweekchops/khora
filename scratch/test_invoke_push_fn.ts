const supabaseUrl = "https://ljazboprejtdrfsisfxu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXpib3ByZWp0ZHJmc2lzZnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5NzUxMCwiZXhwIjoyMDkxNzczNTEwfQ.wTGF8ZIlHrX8agKTj4_hL_KX_xudcqDzmiGFjvONITQ"

async function run() {
  console.log("🚀 Fetching notify-teacher-push edge function (NO classId at root)...")
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/notify-teacher-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        type: "BOOKING_CREATED",
        customParams: {
          teacherUserId: "fdaacc04-af13-4c10-b14e-0f828931d9e7", // Arnaldo Allende
          studentName: "Test Cesar",
          date: "2026-07-22",
          time: "13:00",
          classId: "bc8e972f-7acd-40fc-9042-c218f4b4a30a"
        }
      })
    })

    console.log("Status:", res.status)
    console.log("Response headers:", Object.fromEntries(res.headers.entries()))
    const text = await res.text()
    console.log("Response body:", text)
  } catch (err) {
    console.error("Fetch error:", err)
  }
}

run()
