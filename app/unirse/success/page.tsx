"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, Calendar, Clock, User, ArrowRight, MessageSquare, ShieldCheck, Ticket } from "lucide-react"

function SuccessDetails() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const paymentId = searchParams.get("payment_id") || searchParams.get("preference_id") || "N/A"
  
  const [booking, setBooking] = useState<{
    teacherName: string
    teacherPhone: string
    instrument: string
    date: string
    time: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("khora-booking-success")
      if (saved) {
        try {
          setBooking(JSON.parse(saved))
        } catch (e) {
          console.error("Error parsing booking success data", e)
        }
      }
    }
  }, [])

  // Fallback defaults in case sessionStorage was cleared
  const teacherName = booking?.teacherName || "Tu Profesor"
  const teacherPhone = booking?.teacherPhone || "56944291538"
  const instrument = booking?.instrument || "clase"
  const rawDate = booking?.date || ""
  const time = booking?.time || ""

  // Format date elegantly (e.g., "lunes, 15 de junio")
  let formattedDate = "Por confirmar"
  if (rawDate) {
    try {
      formattedDate = new Date(rawDate + "T12:00").toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch (_) {
      formattedDate = rawDate
    }
  }

  // Pre-build the WhatsApp text message
  const formattedMsg = encodeURIComponent(
    `¡Hola ${teacherName}! Acabo de confirmar el pago de mi clase de prueba de ${instrument} agendada para el ${formattedDate} a las ${time} hs (Orden #${paymentId}). ¡Quedo atento para iniciar!`
  )
  const destPhone = teacherPhone.replace(/\+/g, "")
  const whatsappUrl = `https://wa.me/${destPhone}?text=${formattedMsg}`

  return (
    <div className="max-w-md w-full mx-auto space-y-8 relative z-10 animate-in fade-in zoom-in duration-500">
      
      {/* SUCCESS CARD / RECEIPT */}
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl relative">
        {/* Glow Line decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="p-8 text-center space-y-6">
          {/* Animated Success Badge */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping duration-1000 opacity-75" />
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg relative z-10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">¡Pago Confirmado!</h1>
            <p className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">Tu clase ha sido agendada con éxito</p>
          </div>

          {/* Dotted border separator */}
          <div className="relative flex items-center my-4">
            <div className="absolute -left-10 w-4 h-4 bg-neutral-950 rounded-full border border-neutral-800" />
            <div className="w-full border-t-2 border-dashed border-neutral-800" />
            <div className="absolute -right-10 w-4 h-4 bg-neutral-950 rounded-full border border-neutral-800" />
          </div>

          {/* Ticket Details */}
          <div className="space-y-4 text-left font-sans bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/40">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-neutral-800/60">
              <span className="text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-neutral-600" />
                Número de Orden
              </span>
              <span className="text-white font-mono font-bold text-xs">{paymentId}</span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Profesor</p>
                  <p className="text-sm font-bold text-white mt-1">{teacherName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base text-neutral-500 leading-none mt-0.5 flex-shrink-0">🎸</span>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Especialidad</p>
                  <p className="text-sm font-bold text-white mt-1 capitalize">Clase de {instrument}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Fecha de Clase</p>
                  <p className="text-sm font-bold text-white mt-1 capitalize">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Horario Reservado</p>
                  <p className="text-sm font-bold text-white mt-1">{time ? `${time} hs` : "Por confirmar"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-950/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Profesor (WhatsApp)</span>
            </a>

            <button
              onClick={() => router.push("/dashboard/clases")}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-750 active:scale-[0.98] text-neutral-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-neutral-700/50"
            >
              <span>Ir a mi Panel de Estudio</span>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust elements */}
      <div className="text-center text-neutral-600 text-[10px] space-y-2">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-neutral-600" /> Transacción Segura</span>
          <span className="w-1 h-1 rounded-full bg-neutral-800" />
          <span className="flex items-center gap-1">⚡ Procesado por Mercado Pago</span>
        </div>
        <p>© 2026 Khora. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 bg-cover bg-center bg-no-repeat relative font-sans text-white"
      style={{
        backgroundImage: "linear-gradient(rgba(18, 18, 20, 0.94), rgba(18, 18, 20, 0.98)), url('/studio.jpg')"
      }}
    >
      {/* Glows Ambientales */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 blur-[85px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/5 blur-[85px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-violet-950 border-t-violet-400 rounded-full animate-spin mb-4" />
          <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Cargando tu Recibo...</p>
        </div>
      }>
        <SuccessDetails />
      </Suspense>
    </div>
  )
}
