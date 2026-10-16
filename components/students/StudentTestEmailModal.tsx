"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Mail, Send, X, CheckCircle2, Sparkles, KeyRound } from "lucide-react"
import { toast } from "sonner"

interface StudentTestEmailModalProps {
  isOpen: boolean
  onClose: () => void
  studentName: string
  studentEmail: string
  teacherName?: string
}

export default function StudentTestEmailModal({
  isOpen,
  onClose,
  studentName,
  studentEmail,
  teacherName,
}: StudentTestEmailModalProps) {
  const [emailType, setEmailType] = useState<"TEST_EMAIL" | "WELCOME">("TEST_EMAIL")
  const [customMessage, setCustomMessage] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  async function handleSend() {
    if (!studentEmail) {
      toast.error("El alumno no tiene un correo electrónico registrado.")
      return
    }

    setSending(true)
    try {
      const now = new Date()
      const sentDateFormatted = now.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })

      const params: Record<string, any> = {
        studentName: studentName || "Alumno",
        email: studentEmail,
        teacherName: teacherName || "Tu profesor",
        sentDate: sentDateFormatted,
      }

      if (emailType === "TEST_EMAIL") {
        if (customMessage.trim()) {
          params.customMessage = customMessage.trim()
        }
      } else if (emailType === "WELCOME") {
        if (tempPassword.trim()) {
          params.tempPassword = tempPassword.trim()
        }
      }

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: studentEmail,
          type: emailType,
          params,
          subject: emailType === "TEST_EMAIL"
            ? `Prueba de Notificaciones Khora ✉️ - ${studentName}`
            : undefined
        }
      })

      if (error) {
        throw new Error(error.message || "Fallo en la llamada al servicio de correos")
      }

      if (data?.error) {
        throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error))
      }

      toast.success(`¡Correo enviado exitosamente a ${studentEmail}!`)
      onClose()
      setCustomMessage("")
      setTempPassword("")
    } catch (err: any) {
      console.error("[StudentTestEmailModal] Error sending email:", err)
      toast.error("No se pudo enviar el correo: " + (err.message || "Error desconocido"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1a1a24] text-white border border-[#2d2d3d] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl relative p-6 md:p-8 animate-in zoom-in duration-200 font-sans">
        
        {/* Glow decorativo de fondo */}
        <div className="absolute top-[-25%] right-[-10%] w-60 h-60 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[5%] w-48 h-48 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header con botón de cerrar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Enviar Correo de Prueba
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Verifica que el alumno reciba notificaciones en su casilla.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800/60 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta de Destinatario */}
          <div className="p-3.5 bg-[#13131a] border border-[#2d2d3d] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 font-black text-sm flex items-center justify-center shrink-0">
                {studentName ? studentName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{studentName}</p>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{studentEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Casilla Activa
            </div>
          </div>

          {/* Selector de Tipo de Correo */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
              Selecciona el tipo de correo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setEmailType("TEST_EMAIL")}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  emailType === "TEST_EMAIL"
                    ? "bg-sky-950/30 border-sky-500/50 shadow-md shadow-sky-950/30 ring-1 ring-sky-500/30"
                    : "bg-[#13131a] border-[#2d2d3d] hover:border-neutral-700 text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">✉️</span>
                  <span className="text-xs font-black text-white">Prueba General</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Confirma que la casilla recibe correos de Khora y reporta estado activo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEmailType("WELCOME")}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  emailType === "WELCOME"
                    ? "bg-violet-950/30 border-violet-500/50 shadow-md shadow-violet-950/30 ring-1 ring-violet-500/30"
                    : "bg-[#13131a] border-[#2d2d3d] hover:border-neutral-700 text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎉</span>
                  <span className="text-xs font-black text-white">Bienvenida / Acceso</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Reenvía la bienvenida con enlace al portal y usuario del alumno.
                </p>
              </button>
            </div>
          </div>

          {/* Opciones según el tipo */}
          {emailType === "TEST_EMAIL" ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Mensaje adicional (Opcional):</span>
                <span className="text-[10px] text-neutral-500 lowercase">visible en el correo</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ej: Hola Julia, te envío este correo de prueba para comprobar que tu nueva casilla Gmail recibe bien todas las notificaciones..."
                rows={3}
                className="w-full bg-[#13131a] border border-[#2d2d3d] rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1 flex items-center justify-between">
                <span>Contraseña temporal (Opcional):</span>
                <span className="text-[10px] text-neutral-500 lowercase">para mostrar en el correo</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Ej: Clave123 (opcional)"
                  className="w-full bg-[#13131a] border border-[#2d2d3d] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 py-3 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 ${
                emailType === "TEST_EMAIL"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-950/30"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-950/30"
              }`}
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Correo</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
