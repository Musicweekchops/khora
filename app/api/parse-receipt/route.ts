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
Analiza la imagen o PDF de este comprobante de transferencia bancaria (ej. BancoEstado, Banco de Chile, Santander, BCI, Itaú, Mercado Pago, Banco Falabella, Scotiabank, etc.).

Debes extraer y responder ÚNICAMENTE un objeto JSON válido con los siguientes campos sin formato Markdown ni bloques de código extra:
{
  "amount": <monto numérico entero sin puntos ni símbolos de moneda, ej: 90000>,
  "date": <fecha en formato YYYY-MM-DD, ej: "2026-08-17">,
  "bank": <nombre del banco emisor o receptor en texto simple, ej: "BancoEstado">,
  "transfer_id": <código de transacción, número de comprobante o folio si existe, o null si no se lee>,
  "sender_name": <nombre de la persona que realiza la transferencia si aparece, o null>
}

Reglas strictly:
- Si el monto dice "$90.000" o "$ 90000 CLP", devuélvelo como número 90000.
- Si la fecha dice "17 de Agosto de 2026" o "17/08/2026", conviértela siempre a "2026-08-17".
- Si no logras determinar un valor con certeza, usa null en ese campo.
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("[parse-receipt] Gemini API error:", errText)
      return NextResponse.json({ error: "Error al procesar con Gemini API." }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Clean JSON response from Gemini
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
    let parsedJson: any = {}

    try {
      parsedJson = JSON.parse(cleanedText)
    } catch (e) {
      console.warn("[parse-receipt] Failed to parse JSON from Gemini response:", rawText)
    }

    return NextResponse.json({
      success: true,
      amount: typeof parsedJson.amount === "number" ? parsedJson.amount : null,
      date: typeof parsedJson.date === "string" ? parsedJson.date : null,
      bank: parsedJson.bank || null,
      transfer_id: parsedJson.transfer_id ? String(parsedJson.transfer_id) : null,
      sender_name: parsedJson.sender_name || null,
    })
  } catch (err: any) {
    console.error("[parse-receipt] Server error:", err)
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}
