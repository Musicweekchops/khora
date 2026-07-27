"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

function ConfirmContinuityContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const action = searchParams.get("action") // 'confirm' | 'pause'

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"confirmed" | "paused" | "error">("error")
  const [studentName, setStudentName] = useState("Alumno")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token || !action) {
      setLoading(false)
      setErrorMsg("Enlace o parámetros incompletos")
      return
    }

    async function processContinuity() {
      try {
        setLoading(true)

        // Buscar alumno por token
        const { data: student, error } = await supabase
          .from("StudentProfile")
          .select("id, status, User ( name )")
          .eq("continuity_token", token)
          .maybeSingle()

        if (error || !student) {
          setStatus("error")
          setErrorMsg("Token no encontrado o caducado")
          setLoading(false)
          return
        }

        const sUser = Array.isArray(student.User) ? student.User[0] : student.User
        setStudentName(sUser?.name || "Alumno")

        if (action === "pause") {
          // Cambiar a PAUSED y deshabilitar cobranza
          await supabase
            .from("StudentProfile")
            .update({
              status: "PAUSED",
              collection_active: false,
              continuity_status: "PAUSED",
              continuity_updated_at: new Date().toISOString()
            })
            .eq("id", student.id)

          setStatus("paused")
        } else if (action === "confirm") {
          // Confirmar continuidad
          await supabase
            .from("StudentProfile")
            .update({
              continuity_status: "CONFIRMED",
              continuity_updated_at: new Date().toISOString()
            })
            .eq("id", student.id)

          setStatus("confirmed")
        } else {
          setStatus("error")
          setErrorMsg("Acción no válida")
        }
      } catch (err: any) {
        console.error("[confirmar-continuidad error]:", err)
        setStatus("error")
        setErrorMsg("Error al conectar con el servidor")
      } finally {
        setLoading(false)
      }
    }

    processContinuity()
  }, [token, action])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-semibold">Procesando tu respuesta...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#161622] border border-[#272738] rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold bg-white/5 border border-white/10 shadow-inner">
          {status === "confirmed" ? "🎉" : status === "paused" ? "⏸️" : "⚠️"}
        </div>

        {status === "confirmed" && (
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-white">¡Continuidad Confirmada!</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Hola <strong className="text-white">{studentName}</strong>, hemos registrado tu confirmación para continuar tus clases de música el próximo mes. ¡Nos vemos en clase! 🎵
            </p>
          </div>
        )}

        {status === "paused" && (
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-amber-400">Pausa Registrada</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Hola <strong className="text-white">{studentName}</strong>, hemos registrado que no continuarás el próximo mes. Tu horario de clases ha sido liberado y la cobranza fue pausada.
            </p>
            <p className="text-neutral-500 text-xs italic">
              Si deseas retomar en el futuro, comunícate directamente con tu profesor para reagendar tu cupo.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-red-400">Enlace No Válido</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {errorMsg || "No se pudo procesar tu respuesta. Es posible que el enlace haya caducado o sea incorrecto."}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <Link
            href="/"
            className="inline-block w-full py-3 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Ir a Khora
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmContinuityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d12] flex items-center justify-center text-white">Cargando...</div>}>
      <ConfirmContinuityContent />
    </Suspense>
  )
}
