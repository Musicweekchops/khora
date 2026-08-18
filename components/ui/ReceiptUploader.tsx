"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Upload, FileText, CheckCircle2, Sparkles, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export interface ParsedReceiptData {
  amount?: number | null
  date?: string | null
  notes?: string | null
  receiptUrl?: string | null
  transferId?: string | null
}

interface Props {
  onParsedData: (data: ParsedReceiptData) => void
  currentReceiptUrl?: string | null
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(",") ? result.split(",")[1] : result
      resolve(base64)
    }
    reader.onerror = err => reject(err)
    reader.readAsDataURL(file)
  })
}

export default function ReceiptUploader({ onParsedData, currentReceiptUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentReceiptUrl || null)
  const [detectedData, setDetectedData] = useState<{ amount?: number | null; date?: string | null; bank?: string | null } | null>(null)

  async function handleFileChange(file: File) {
    if (!file) return

    setLoading(true)
    setDetectedData(null)

    let publicUrl: string | null = null

    try {
      // 1. Upload to Supabase Storage bucket 'payment-receipts'
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, file, { cacheControl: "3600", upsert: true })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("payment-receipts").getPublicUrl(filePath)
        publicUrl = urlData?.publicUrl || null
      } else {
        console.warn("[ReceiptUploader] Storage upload fallback:", uploadError?.message)
        publicUrl = URL.createObjectURL(file)
      }

      setPreviewUrl(publicUrl)

      // 2. Call AI Vision (try server route /api/parse-receipt first, or browser-native Gemini fetch for static sites like Render)
      let parsedData: ParsedReceiptData | null = null

      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/parse-receipt", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          const result = await res.json()
          if (result.success && (result.amount || result.date)) {
            let notesText = ""
            if (result.bank || result.transfer_id) {
              notesText = `Transferencia ${result.bank || ""} ${result.transfer_id ? `#${result.transfer_id}` : ""}`.trim()
            }
            parsedData = {
              amount: result.amount,
              date: result.date,
              notes: notesText || null,
              receiptUrl: publicUrl,
              transferId: result.transfer_id,
            }
            setDetectedData({
              amount: result.amount,
              date: result.date,
              bank: result.bank,
            })
          }
        }
      } catch (e) {
        console.warn("[ReceiptUploader] Server route unavailable, trying browser fallback:", e)
      }

      // Browser-native client fallback (works on Render static site export)
      if (!parsedData || (!parsedData.amount && !parsedData.date)) {
        const apiKey =
          process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "AQ.Ab8RN6JHV-mhUeDKh6-xV9T02wlz4rsfqb8bR4jQICD43NDCSg"

        if (apiKey) {
          try {
            const base64Data = await fileToBase64(file)
            const mimeType = file.type || "image/jpeg"

            const promptText = `
Analiza la imagen o PDF de este comprobante de transferencia bancaria en Chile (BancoEstado, Banco de Chile, Santander, BCI, Itaú, Mercado Pago, Banco Falabella, Mach, Tenpo, etc.).

Extrae y responde ÚNICAMENTE un objeto JSON válido con los siguientes campos:
{
  "amount": 90000,
  "date": "2026-08-17",
  "bank": "BancoEstado",
  "transfer_id": "19482752"
}

Reglas:
- "amount": Número entero sin puntos ni signos de moneda (ej: 90000). Busca la cifra principal transferida ($90.000, $ 90.000).
- "date": Fecha de la transferencia en formato YYYY-MM-DD (ej: "2026-08-17").
- "bank": Nombre del banco o app.
- "transfer_id": Folio, comprobante o N° de operación.
`

            const candidateModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"]
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
                            { inline_data: { mime_type: mimeType, data: base64Data } },
                            { text: promptText },
                          ],
                        },
                      ],
                      generationConfig: { response_mime_type: "application/json" },
                    }),
                  }
                )

                if (apiRes.ok) {
                  const data = await apiRes.json()
                  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
                  const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
                  const parsedJson = JSON.parse(cleanedText)

                  let finalAmount: number | null = null
                  if (typeof parsedJson.amount === "number" && !isNaN(parsedJson.amount)) {
                    finalAmount = parsedJson.amount
                  } else if (parsedJson.amount) {
                    const cleanedAmount = String(parsedJson.amount).replace(/\D/g, "")
                    if (cleanedAmount) finalAmount = parseInt(cleanedAmount, 10)
                  }

                  let finalDate: string | null = null
                  if (typeof parsedJson.date === "string" && parsedJson.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    finalDate = parsedJson.date
                  }

                  let notesText = ""
                  if (parsedJson.bank || parsedJson.transfer_id) {
                    notesText = `Transferencia ${parsedJson.bank || ""} ${parsedJson.transfer_id ? `#${parsedJson.transfer_id}` : ""}`.trim()
                  }

                  parsedData = {
                    amount: finalAmount,
                    date: finalDate,
                    notes: notesText || null,
                    receiptUrl: publicUrl,
                    transferId: parsedJson.transfer_id ? String(parsedJson.transfer_id) : null,
                  }
                  setDetectedData({
                    amount: finalAmount,
                    date: finalDate,
                    bank: parsedJson.bank || null,
                  })
                  break
                }
              } catch (modelErr) {
                console.warn(`[ReceiptUploader] Model ${model} fetch failed:`, modelErr)
              }
            }
          } catch (err) {
            console.error("[ReceiptUploader] Browser Gemini OCR error:", err)
          }
        }
      }

      if (parsedData && (parsedData.amount || parsedData.date)) {
        onParsedData(parsedData)
        toast.success("✨ ¡Comprobante analizado con éxito!")
      } else {
        onParsedData({ receiptUrl: publicUrl })
        toast.info("Comprobante adjuntado. Puedes ingresar los datos manualmente si lo deseas.")
      }
    } catch (err: any) {
      console.error("[ReceiptUploader] Error processing receipt:", err)
      toast.error("Error al procesar la imagen.")
      if (publicUrl) onParsedData({ receiptUrl: publicUrl })
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    setPreviewUrl(null)
    setDetectedData(null)
    onParsedData({ receiptUrl: null })
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
        Comprobante de Pago (IA Scan)
      </label>

      {previewUrl ? (
        <div className="relative bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
            {previewUrl.endsWith(".pdf") ? (
              <FileText className="w-7 h-7 text-red-500" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Comprobante" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Comprobante adjuntado</span>
            </div>

            {detectedData && (detectedData.amount || detectedData.date) && (
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-semibold text-neutral-600">
                {detectedData.amount && (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    ${detectedData.amount.toLocaleString("es-CL")}
                  </span>
                )}
                {detectedData.date && (
                  <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md">
                    {detectedData.date}
                  </span>
                )}
                {detectedData.bank && (
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md">
                    {detectedData.bank}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-200/50 rounded-xl transition-all"
            title="Quitar comprobante"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          loading
            ? "border-violet-300 bg-violet-50/50"
            : "border-neutral-200 hover:border-violet-400 hover:bg-neutral-50/50"
        }`}>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileChange(file)
            }}
          />

          {loading ? (
            <div className="py-2 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
              <span className="text-xs font-bold text-violet-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Escaneando comprobante con IA...
              </span>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-1">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-neutral-700">
                Arrastra o selecciona el comprobante
              </p>
              <p className="text-[11px] text-neutral-400 font-medium">
                Sube la foto de la transferencia para autocompletar el pago con IA
              </p>
            </div>
          )}
        </label>
      )}
    </div>
  )
}
