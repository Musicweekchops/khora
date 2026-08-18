import fs from "fs"

async function testGeneration() {
  let apiKey = ""
  try {
    const envContent = fs.readFileSync(".env.local", "utf8")
    const match = envContent.match(/GEMINI_API_KEY=(.*)/)
    if (match) apiKey = match[1].trim()
  } catch (e) {}

  const modelsToTest = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]

  for (const model of modelsToTest) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Responde únicamente en JSON: {\"status\": \"ok\"}" }] }]
      })
    })

    console.log(`Model [${model}] HTTP Status:`, res.status)
    if (res.ok) {
      const data = await res.json()
      console.log(`Model [${model}] Response:`, data.candidates?.[0]?.content?.parts?.[0]?.text)
      break
    }
  }
}

testGeneration()
