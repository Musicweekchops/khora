import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "La clave GEMINI_API_KEY no está configurada en las variables de entorno." },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"

    const promptText = `
Eres un experto extractor OCR de comprobantes de pago y transferencias bancarias en Chile (BancoEstado, Banco de Chile, Santander, BCI, Itaú, Mercado Pago, Mach, Tenpo, Banco Falabella, Scotiabank, etc.).

Examina minuciosamente la imagen adjunta y extrae la información financiera.

Responde ÚNICAMENTE un objeto JSON válido con este formato exacto:
{
  "amount": 90000,
  "date": "2026-08-17",
  "bank": "BancoEstado",
  "transfer_id": "19482752",
  "sender_name": "Nombre Remitente"
}

Instrucciones para cada campo:
1. "amount": Busca la cifra de dinero transferido. Generalmente es el número más grande en pantalla (ej: $90.000, $ 90.000, 90000 CLP, Monto: 90.000). Retórnalo como NÚMERO ENTERO SIN PUNTOS NI SIGNOS DE MONEDA (ej: 90000).
2. "date": Busca la fecha de la transacción (ej: 17/08/2026, 17-08-2026, 17 de Agosto 2026). Retórnala SIEMPRE en formato ISO "YYYY-MM-DD" (ej: "2026-08-17"). Si solo hay fecha actual u hoy, usa la fecha visible.
3. "bank": Nombre del banco o institución (ej: BancoEstado, Banco de Chile, Santander, BCI, Mercado Pago, Mach, Tenpo, Banco Falabella).
4. "transfer_id": N° de comprobante, número de operación, ID de transacción, folio o referencia.
5. "sender_name": Nombre de quien envía la transferencia si está visible.

Si algún campo no es visible en la imagen, asigna null a dicho campo. No agregues explicaciones fuera del JSON.
`

    const candidateModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"]
    let response: Response | null = null
    let usedModel = ""

    for (const model of candidateModels) {
      try {
        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                    {
                      text: promptText,
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
              },
            }),
          }
        )

        if (apiRes.ok) {
          response = apiRes
          usedModel = model
          break
        } else {
          const errText = await apiRes.text()
          console.warn(`[parse-receipt] Model ${model} returned ${apiRes.status}:`, errText)
        }
      } catch (e: any) {
        console.warn(`[parse-receipt] Error fetching model ${model}:`, e.message)
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: "Error al comunicarse con la API de Gemini." }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Clean JSON string
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
    let parsedJson: any = {}

    try {
      parsedJson = JSON.parse(cleanedText)
    } catch (e) {
      console.warn("[parse-receipt] JSON parse failed, raw string:", rawText)
    }

    // Process amount robustly
    let finalAmount: number | null = null
    if (typeof parsedJson.amount === "number" && !isNaN(parsedJson.amount)) {
      finalAmount = parsedJson.amount
    } else if (parsedJson.amount) {
      const cleanedAmount = String(parsedJson.amount).replace(/\D/g, "")
      if (cleanedAmount) finalAmount = parseInt(cleanedAmount, 10)
    }

    // Process date robustly (format YYYY-MM-DD)
    let finalDate: string | null = null
    if (typeof parsedJson.date === "string" && parsedJson.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      finalDate = parsedJson.date
    } else if (typeof parsedJson.date === "string") {
      // Try to parse DD/MM/YYYY
      const parts = parsedJson.date.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
      if (parts) {
        const day = parts[1].padStart(2, "0")
        const month = parts[2].padStart(2, "0")
        const year = parts[3]
        finalDate = `${year}-${month}-${day}`
      }
    }

    return NextResponse.json({
      success: true,
      modelUsed: usedModel,
      amount: finalAmount,
      date: finalDate,
      bank: parsedJson.bank || null,
      transfer_id: parsedJson.transfer_id ? String(parsedJson.transfer_id) : null,
      sender_name: parsedJson.sender_name || null,
    })
  } catch (err: any) {
    console.error("[parse-receipt] Internal error:", err)
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}
