import fs from "fs"

// A tiny 1x1 GIF / PNG base64 for vision test
const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

async function testVision() {
  let apiKey = ""
  try {
    const envContent = fs.readFileSync(".env.local", "utf8")
    const match = envContent.match(/GEMINI_API_KEY=(.*)/)
    if (match) apiKey = match[1].trim()
  } catch (e) {}

  const promptText = "Responde en JSON exacto: {\"amount\": 50000, \"date\": \"2026-08-18\", \"bank\": \"BancoEstado\"}"

  const apiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/png",
                  data: dummyBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
      }),
    }
  )

  console.log("Vision Test Status:", apiRes.status)
  const data = await apiRes.json()
  console.log("Vision Test Data:", data?.candidates?.[0]?.content?.parts?.[0]?.text)
}

testVision()
