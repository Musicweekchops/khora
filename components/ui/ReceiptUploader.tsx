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

      // 2. Call AI Vision Endpoint /api/parse-receipt
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        console.warn("[ReceiptUploader] AI parse response not ok:", errJson)
        toast.info("Comprobante adjuntado. Ingresa el monto manualmente si es necesario.")
        onParsedData({ receiptUrl: publicUrl })
        return
      }

      const result = await res.json()

      if (result.success) {
        setDetectedData({
          amount: result.amount,
          date: result.date,
          bank: result.bank,
        })

        let notesText = ""
        if (result.bank || result.transfer_id) {
          notesText = `Transferencia ${result.bank || ""} ${result.transfer_id ? `#${result.transfer_id}` : ""}`.trim()
        }

        onParsedData({
          amount: result.amount,
          date: result.date,
          notes: notesText || null,
          receiptUrl: publicUrl,
          transferId: result.transfer_id,
        })

        toast.success("✨ ¡Comprobante analizado con éxito!")
      } else {
        onParsedData({ receiptUrl: publicUrl })
      }
    } catch (err: any) {
      console.error("[ReceiptUploader] Error processing receipt:", err)
      toast.error("Error al leer el archivo. Puedes ingresar los datos manualmente.")
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
            <div className="py-2 flex flex-col items-center gap-2 text-violet-600 animate-in fade-in duration-200">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Escaneando comprobante con IA…
              </span>
            </div>
          ) : (
            <div className="py-1 flex items-center gap-3 text-neutral-500">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  <span>Cargar comprobante</span>
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">IA Scan</span>
                </p>
                <p className="text-[11px] text-neutral-400 font-medium">Foto o PDF (BancoEstado, BCh, Santander, etc.)</p>
              </div>
            </div>
          )}
        </label>
      )}
    </div>
  )
}
