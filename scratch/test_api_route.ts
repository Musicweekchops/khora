import fs from "fs"

async function testApiRoute() {
  let apiKey = process.env.GEMINI_API_KEY || ""
  if (!apiKey) {
    try {
      const envContent = fs.readFileSync(".env.local", "utf8")
      const match = envContent.match(/GEMINI_API_KEY=(.*)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {}
  }

  console.log("Testing with GEMINI_API_KEY:", apiKey ? "Key found: " + apiKey.substring(0, 10) + "..." : "MISSING KEY")

  const dummyPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  )

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + apiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/png",
                data: dummyPngBuffer.toString("base64"),
              },
            },
            {
              text: `Analiza esta imagen y responde en JSON: {"amount": 90000, "date": "2026-08-17", "bank": "BancoEstado"}`,
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json"
      }
    }),
  })

  console.log("Response Status:", response.status)
  const text = await response.text()
  console.log("Response Body:", text)
}

testApiRoute()
