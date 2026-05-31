"use client"

import React, { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { formatTime } from "@/lib/utils"
import { getAvailableSlots } from "@/lib/availability"
import { DAY_NAMES } from "@/lib/schedule"
import { useToast } from "@/components/ui/Toast"
import {
  Phone,
  User,
  Mail,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react"

function RegistrationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get("teacherId")
  const { toast } = useToast()

  const [teacherName, setTeacherName] = useState("")
  const [teacherEmail, setTeacherEmail] = useState("")
  const [loadingTeacher, setLoadingTeacher] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // ESTADO EXCLUSIVO LANDING PREMIUM (Arnaldo Allende)
  const [whatsapp, setWhatsapp] = useState("")
  const [step, setStep] = useState(1) // 1 = Captura WhatsApp, 2 = Calendario de Horarios
  const [selectedDate, setSelectedDate] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Datos del Formulario
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    modalidad: "presencial",
  })

  // Lista de Espera Modal / Drawer
  const [showWaitlistForm, setShowWaitlistForm] = useState(false)
  const [waitlistPref, setWaitlistPref] = useState({
    day: 1,
    time: "18:00"
  })

  const isArnaldo = teacherEmail === "arnaldoallende@hotmail.com"

  // 1. Cargar Datos del Profesor y Meta Pixel si aplica
  useEffect(() => {
    async function loadTeacher() {
      if (!teacherId) {
        setError("El enlace de inscripción no contiene información del profesor.")
        setLoadingTeacher(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("TeacherProfile")
        .select("id, User ( name, email )")
        .eq("id", teacherId)
        .maybeSingle()

      if (data?.User) {
        const userObj: any = data.User
        const name = Array.isArray(userObj) ? userObj[0]?.name : userObj.name
        const email = Array.isArray(userObj) ? userObj[0]?.email : userObj.email
        setTeacherName(name)
        setTeacherEmail(email)

        // Inyectar Meta Pixel si corresponde a Arnaldo y está configurado
        if (email === "arnaldoallende@hotmail.com" && typeof window !== "undefined") {
          const pixelId = localStorage.getItem("khora-meta-pixel")
          if (pixelId) {
            const script = document.createElement("script")
            script.innerHTML = `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `
            document.head.appendChild(script)
          }
        }
      } else {
        setError("El enlace de inscripción no es válido o ha expirado.")
      }
      setLoadingTeacher(false)
    }
    loadTeacher()
  }, [teacherId])

  // Cargar disponibilidad de horarios para Arnaldo
  useEffect(() => {
    if (selectedDate && teacherId && isArnaldo) {
      loadSlots()
    }
  }, [selectedDate, teacherId, isArnaldo])

  async function loadSlots() {
    setLoadingSlots(true)
    setSelectedSlot(null)
    try {
      // Duración estándar de la clase de prueba: 60 minutos
      const slots = await getAvailableSlots(selectedDate, teacherId!, 60)
      setAvailableSlots(slots)
    } catch (err) {
      console.error("Error loading slots:", err)
    }
    setLoadingSlots(false)
  }

  // Lanzar evento Pixel al registrar conversión
  const trackMetaLead = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        value: 0.00,
        currency: 'USD'
      })
    }
  }

  // ── ACCIÓN LANDING PREMIUM: EMPEZAR AHORA ──
  const handleStartCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!whatsapp.trim()) {
      toast("Ingresa tu número de WhatsApp", "error")
      return
    }
    // Formatear WhatsApp
    let formattedPhone = whatsapp.trim()
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.startsWith("56") ? `+${formattedPhone}` : `+56${formattedPhone}`
    }
    setWhatsapp(formattedPhone)
    setStep(2) // Avanzar al agendamiento interactivo
    toast("WhatsApp guardado. Selecciona tu horario.", "success")
  }

  // ── ACCIÓN LANDING PREMIUM: AGENDAR SLOT DISPONIBLE ──
  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !selectedSlot || !teacherId) return

    setSubmitting(true)
    setError("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const cleanEmail = form.email.trim().toLowerCase()
      const cleanPhone = whatsapp.trim()

      // 1. Validar si ya existe una reserva de prueba PENDING o CONFIRMED con el mismo Email o Teléfono
      const { data: existingBooking } = await supabase
        .from("Booking")
        .select("id")
        .eq("teacher_id", teacherId)
        .or(`phone.eq.${cleanPhone},email.eq.${cleanEmail}`)
        .in("status", ["PENDING", "CONFIRMED"])
        .maybeSingle()

      if (existingBooking) {
        throw new Error("Ya registraste una solicitud de clase de prueba o tienes una cuenta activa con este correo o teléfono. Por favor contáctanos directamente para coordinar tu clase.")
      }

      // 2. Si es Arnaldo y la pasarela de pagos está configurada, generar link de cobro e ir a Mercado Pago directamente
      // NOTA: Para evitar "reservas basura" que bloqueen horarios a otros, NO insertamos el Booking ni creamos el alumno
      // en la base de datos hasta que el Webhook confirme que el pago fue APROBADO.
      if (isArnaldo) {
        try {
          const checkoutRes = await fetch(`${supabaseUrl}/functions/v1/mercadopago-checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": anonKey || "",
              "Authorization": `Bearer ${anonKey}`
            },
            body: JSON.stringify({
              teacher_id: teacherId,
              student_id: null,
              item_type: "TRIAL",
              prospect_name: form.name.trim(),
              prospect_email: cleanEmail,
              prospect_phone: cleanPhone,
              selected_date: selectedDate,
              selected_slot: selectedSlot,
              modalidad: form.modalidad
            })
          })

          const checkoutData = await checkoutRes.json()
          if (checkoutRes.ok && checkoutData.checkoutUrl) {
            // Medir conversión en Meta Ads antes de irse
            trackMetaLead()

            toast("¡Reserva iniciada! Redireccionando a Mercado Pago para confirmar...", "success")
            setTimeout(() => {
              window.location.href = checkoutData.checkoutUrl
            }, 1500)
            return // Detiene el flujo para evitar el fallback manual de WhatsApp
          }
        } catch (checkoutErr) {
          console.error("Error al generar checkout de pago:", checkoutErr)
          // Si falla la pasarela, continuamos con el flujo tradicional de WhatsApp
        }
      }

      // 3. FLUJO DE WHATSAPP (FALLBACK si falla o está desactivada la pasarela automática)
      // A. Crear al alumno mediante nuestra Edge Function create-student
      const res = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: "student123", // Contraseña temporal
          name: form.name.trim(),
          phone: cleanPhone,
          teacher_id: teacherId
        })
      })

      const edgeData = await res.json()

      if (!res.ok || edgeData?.error) {
        throw new Error(edgeData?.error || "Error al crear la cuenta. Intenta con otro correo.")
      }

      const newUserId = edgeData.userId

      // B. Actualizar el perfil del prospecto en Khora
      await supabase
        .from("StudentProfile")
        .update({
          modalidad: form.modalidad,
          preferred_day: DAY_NAMES[new Date(selectedDate + "T12:00").getDay()],
          preferred_time: selectedSlot,
          status: "TRIAL", // Pasa a clase de prueba directamente
          lead_source: "WEBSITE"
        })
        .eq("user_id", newUserId)

      // C. Crear el agendamiento (Booking) físico en Khora con estado PENDING para WhatsApp manual
      const [h, m] = selectedSlot.split(":").map(Number)
      const endD = new Date()
      endD.setHours(h, m + 60, 0, 0)
      const endTimeStr = `${String(endD.getHours()).padStart(2, "0")}:${String(endD.getMinutes()).padStart(2, "0")}:00`

      await supabase.from("Booking").insert({
        teacher_id: teacherId,
        name: form.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        date: selectedDate,
        start_time: selectedSlot,
        end_time: endTimeStr,
        total_price: 0,
        status: "PENDING"
      })

      // D. Medir conversión en Meta Ads
      trackMetaLead()

      // E. Redireccionar directamente a WhatsApp con el mensaje pre-armado
      setSuccess(true)
      const formattedDate = new Date(selectedDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const textMsg = encodeURIComponent(
        `¡Hola Arnaldo! Mi nombre es ${form.name.trim()}. Acabo de registrarme para una clase de prueba de batería este ${formattedDate} a las ${formatTime(selectedSlot)} hs. ¿Me podrías confirmar si queda reservada?`
      )

      toast("¡Inscripción exitosa! Abriendo tu WhatsApp...", "success")

      setTimeout(() => {
        window.location.href = `https://wa.me/56944291538?text=${textMsg}` // Número celular de Arnaldo Allende
      }, 1500)

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado")
      setSubmitting(false)
    }
  }

  // ── ACCIÓN LANDING PREMIUM: AGREGAR A LISTA DE ESPERA (ESCASEZ) ──
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !teacherId) return

    setSubmitting(true)
    setError("")

    try {
      const timeFormatted = `${String(waitlistPref.time).slice(0, 5)}:00`

      // 1. Insertar el prospecto directamente en la tabla ScheduleWaitingList
      const { error: waitlistErr } = await supabase
        .from("ScheduleWaitingList")
        .insert({
          teacher_id: teacherId,
          prospect_name: form.name.trim(),
          prospect_email: form.email.trim().toLowerCase(),
          prospect_phone: whatsapp,
          day_of_week: Number(waitlistPref.day),
          start_time: timeFormatted,
          end_time: formatTime(timeFormatted) // Mismo horario estimado
        })

      if (waitlistErr) throw waitlistErr

      // 2. Medir conversión en Meta Ads
      trackMetaLead()

      setSuccess(true)
      toast("¡Te has unido a la Lista de Espera Prioritaria!", "success")

      // WhatsApp Hook de Lista de espera
      const dayName = DAY_NAMES[Number(waitlistPref.day)]
      const textMsg = encodeURIComponent(
        `¡Hola Arnaldo! Mi nombre es ${form.name.trim()}. No encontré horarios disponibles en tu agenda, por lo que me acabo de inscribir en tu Lista de Espera prioritaria para los ${dayName} a las ${formatTime(timeFormatted)} hs. ¡Quedo atento si se libera un cupo!`
      )

      setTimeout(() => {
        window.location.href = `https://wa.me/56984288031?text=${textMsg}`
      }, 1500)

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado")
      setSubmitting(false)
    }
  }

  // ── VISTA ESTÁNDAR TRADICIONAL DE KHORA (Para otros profesores) ──
  async function handleStandardSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !teacherId) return

    setSubmitting(true)
    setError("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          name: form.name.trim(),
          phone: whatsapp.trim() || null,
          teacher_id: teacherId
        })
      })

      const edgeData = await res.json()

      if (!res.ok || edgeData?.error) {
        throw new Error(edgeData?.error || "Error al crear la cuenta. Intenta con otro correo.")
      }

      const newUserId = edgeData.userId

      // Guardar preferencias tradicionales
      await supabase
        .from("StudentProfile")
        .update({
          modalidad: form.modalidad,
          status: "PROSPECT",
          lead_source: "WEBSITE"
        })
        .eq("user_id", newUserId)

      setSuccess(true)

      await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password.trim()
      })

      setTimeout(() => {
        router.push("/dashboard/tareas")
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado")
      setSubmitting(false)
    }
  }

  if (loadingTeacher) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-violet-950 border-t-violet-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !teacherName) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[32px] max-w-sm w-full text-center shadow-xl">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-white mb-2">Enlace Inválido</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">¡Inscripción Exitosa!</h2>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            Tu solicitud se ha registrado correctamente en Khora. Abriendo chat de WhatsApp para coordinar...
          </p>
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // ===================================================================
  // 🎭 RENDER: LANDING DE ALTA CONVERSIÓN PREMIUM (ARNALDO ALLENDE)
  // ===================================================================
  if (isArnaldo) {
    return (
      <div
        className="min-h-screen flex flex-col justify-between items-center p-4 md:p-8 bg-cover bg-center bg-no-repeat relative font-sans text-white"
        style={{
          backgroundImage: "linear-gradient(rgba(18, 18, 20, 0.92), rgba(18, 18, 20, 0.96)), url('/studio.jpg')"
        }}
      >
        {/* Glows Ambientales */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

        {/* HEADER LIMPIO (Sin logos pesados) */}
        <div className="w-full flex justify-center py-4 relative z-10" />

        {/* CONTENEDOR CENTRAL */}
        <div className="max-w-2xl w-full mx-auto my-auto py-10 relative z-10 text-center space-y-8">

          {step === 1 ? (
            // ── STEP 1: CAPTURA DE WHATSAPP (Aesthetic Drumeo Hero) ──
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white uppercase select-none">
                  DOMINA LA BATERÍA CON <br />
                  <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    MI SISTEMA DE CLASES 1 A 1
                  </span>
                </h1>
                <p className="text-neutral-300 font-medium text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
                  Clases 100% personalizadas y adaptadas a tu nivel con Arnaldo Allende. Reserva tu clase de prueba hoy mismo.
                </p>
              </div>

              {/* FORMULARIO SIMPLE 1 PASO */}
              <form onSubmit={handleStartCampaign} className="max-w-md mx-auto bg-neutral-900/50 backdrop-blur-md p-2 rounded-2xl md:rounded-full border border-neutral-800 flex flex-col md:flex-row items-center gap-2 shadow-2xl">
                <div className="relative w-full flex-1 pl-4">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="Ingresa tu WhatsApp"
                    className="w-full pl-6 pr-4 py-3 bg-transparent border-0 outline-none text-sm font-bold text-white placeholder:text-neutral-500 placeholder:font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 flex-shrink-0 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  <span>EMPEZAR AHORA</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* MOCKUP EXPLICADO */}
              <div className="pt-10 max-w-lg mx-auto space-y-6">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  📱 Aplicación exclusiva para el control de tu progreso y agendamiento:
                </p>

                {/* Smartphone central simulado */}
                <div className="relative max-w-[280px] mx-auto border-4 border-neutral-800 rounded-[36px] overflow-hidden shadow-2xl bg-neutral-950/90 aspect-[9/18]">
                  {/* Notch del celular */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />

                  {/* UI Interna */}
                  <div className="p-4 pt-8 space-y-4 text-left h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Khora</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <h4 className="text-xs font-black text-white">Mi Agenda Semanal</h4>

                      {/* Grid de Horarios */}
                      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                        {["Lun", "Jue", "Mie"].map(d => (
                          <div key={d} className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg text-center font-bold text-neutral-400">
                            {d}
                          </div>
                        ))}
                        <div className="bg-blue-950/40 border border-blue-500/20 text-blue-300 p-1.5 rounded-lg text-center font-bold">Clase 10:00</div>
                        <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg text-center font-medium text-neutral-600">Ocupado</div>
                        <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg text-center font-medium text-neutral-600">Ocupado</div>
                        <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg text-center font-medium text-neutral-600">Ocupado</div>
                        <div className="bg-blue-950/40 border border-blue-500/20 text-blue-300 p-1.5 rounded-lg text-center font-bold">Clase 13:00</div>
                        <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg text-center font-medium text-neutral-600">Ocupado</div>
                      </div>
                    </div>

                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-2.5 space-y-1.5">
                      <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider">¿Cómo funciona?</p>
                      <ul className="text-[8px] font-semibold text-neutral-300 space-y-1">
                        <li className="flex items-center gap-1">📈 Revisa tu progreso</li>
                        <li className="flex items-center gap-1">📅 Modifica tus clases</li>
                        <li className="flex items-center gap-1">📹 Estudia con material exclusivo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ── STEP 2: AGENDA INTERACTIVA (Frictionless Booking & Scarcity) ──
            <div className="bg-neutral-900/60 backdrop-blur-lg border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl text-left max-w-xl mx-auto animate-in zoom-in duration-300 font-sans">

              {/* Encabezado del Widget */}
              <div className="bg-neutral-950 p-6 md:p-8 flex items-center justify-between border-b border-neutral-800">
                <div>
                  <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Paso 2: Selecciona tu Clase de Prueba
                  </p>
                  <h2 className="text-lg md:text-xl font-black text-white">Agenda con Arnaldo Allende</h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-[10px] font-bold transition-all border border-neutral-800"
                >
                  Atrás
                </button>
              </div>

              {!showWaitlistForm ? (
                // A. RUTA 1: SELECCIONAR FECHA Y HORA
                <div className="p-6 md:p-8 space-y-6">
                  {/* Selector de Fecha */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1 block">Elige la Fecha</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // A partir de mañana
                      className="w-full px-4 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl outline-none focus:border-violet-500 font-bold text-sm text-white"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1 block">
                        Horarios Disponibles para esta Fecha
                      </label>

                      {loadingSlots ? (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-10 bg-neutral-950 rounded-xl animate-pulse" />
                          <div className="h-10 bg-neutral-950 rounded-xl animate-pulse" />
                          <div className="h-10 bg-neutral-950 rounded-xl animate-pulse" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        // LÓGICA DE ESCASÉZ: No hay cupos, invitar a unirse a la lista de espera
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center space-y-4">
                          <p className="text-xs font-bold text-amber-300 italic leading-relaxed">
                            ⚠️ Vaya, parece que Arnaldo no tiene bloques libres para esta fecha debido a la alta demanda.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowWaitlistForm(true)}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                          >
                            Unirse a Lista de Espera Prioritaria 🔥
                          </button>
                        </div>
                      ) : (
                        // Slots Disponibles
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-3 px-1 rounded-xl text-xs font-black transition-all ${selectedSlot === slot
                                    ? "bg-blue-600 text-white shadow-lg scale-95"
                                    : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:border-neutral-500 active:scale-98"
                                  }`}
                              >
                                {formatTime(slot)} hs
                              </button>
                            ))}
                          </div>

                          {/* ¿Deseas otro horario? */}
                          <div className="text-center pt-2 border-t border-neutral-800/50">
                            <button
                              type="button"
                              onClick={() => {
                                setShowWaitlistForm(true)
                                setWaitlistPref({
                                  day: new Date(selectedDate + "T12:00").getDay(),
                                  time: "18:00"
                                })
                              }}
                              className="text-[10px] font-black text-amber-400 hover:underline uppercase tracking-wider"
                            >
                              💡 ¿Ningún horario te sirve? Inscríbete en mi Lista de Espera
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORMULARIO FINAL DE REGISTRO SI SELECCIONÓ SLOT */}
                  {selectedSlot && (
                    <form onSubmit={handleBookSlot} className="space-y-4 pt-4 border-t border-neutral-800 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Nombre Completo</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-3.5 h-3.5" />
                            <input
                              type="text"
                              required
                              value={form.name}
                              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                              placeholder="Ej: Daniel Gómez"
                              className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-violet-500 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Correo Electrónico</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-3.5 h-3.5" />
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                              placeholder="daniel@ejemplo.com"
                              className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-violet-500 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                        {(["presencial", "online"] as const).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, modalidad: m }))}
                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${form.modalidad === m ? "bg-neutral-800 text-white shadow" : "text-neutral-500 hover:text-neutral-300"
                              }`}
                          >
                            {m === "presencial" ? "🏠 Presencial" : "📹 Virtual"}
                          </button>
                        ))}
                      </div>

                      {error && <div className="bg-red-950/20 border border-red-800 text-red-400 p-3 rounded-xl text-xs font-bold">⚠️ {error}</div>}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? "Procesando..." : "🎵 Solicitar Reserva y Abrir WhatsApp"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                // B. RUTA 2: FORMULARIO DE LISTA DE ESPERA (ESCASEZ)
                <form onSubmit={handleJoinWaitlist} className="p-6 md:p-8 space-y-6">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
                    <span className="text-xl">🔥</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Lista de Espera Prioritaria</h4>
                      <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                        Arnaldo tiene clases ficas y su agenda suele llenarse rápidamente. Regístrate en la lista de espera prioritara: si algún alumno actual libera o pausa su horario, te notificaremos de inmediato para que lo reserves tú primero.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-3.5 h-3.5" />
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Ej: Daniel Gómez"
                          className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-amber-500 text-xs font-bold text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-3.5 h-3.5" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="daniel@ejemplo.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-amber-500 text-xs font-bold text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Día Deseado</label>
                      <select
                        value={waitlistPref.day}
                        onChange={e => setWaitlistPref(p => ({ ...p, day: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-amber-500 text-xs font-bold text-white"
                      >
                        {DAY_NAMES.map((name, i) => (
                          <option key={i} value={i} className="bg-neutral-900">{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest pl-1 block mb-1">Hora Deseada (Estimada)</label>
                      <input
                        type="time"
                        required
                        value={waitlistPref.time}
                        onChange={e => setWaitlistPref(p => ({ ...p, time: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-amber-500 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  {error && <div className="bg-red-950/20 border border-red-800 text-red-400 p-3 rounded-xl text-xs font-bold">⚠️ {error}</div>}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWaitlistForm(false)}
                      className="flex-1 py-3.5 bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? "Procesando..." : "Inscribirme en Espera"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="w-full max-w-md mx-auto py-8 text-center text-neutral-600 text-[10px] space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-neutral-600" /> Datos Protegidos</span>
            <span className="w-1 h-1 rounded-full bg-neutral-800" />
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-neutral-600" /> Clases de Élite</span>
          </div>
          <p>© 2026 Musicweekchops. Todos los derechos reservados.</p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // 🎭 RENDER: RUTA DE INGRESO TRADICIONAL DE KHORA
  // ===================================================================
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col p-4 md:p-8 font-sans">
      <div className="max-w-md w-full mx-auto flex justify-center mb-8 pt-4">
        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl">K</span>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-[40px] shadow-xl overflow-hidden mb-10">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <h1 className="text-2xl font-black mb-2 relative z-10 tracking-tight">Inscripción a Clases</h1>
          <p className="text-violet-100 font-medium relative z-10">con {teacherName}</p>
        </div>

        <form onSubmit={handleStandardSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold"
                placeholder="Ej: María José Salas" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold"
                placeholder="maria@ejemplo.com" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp / Teléfono</label>
              <input type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold"
                placeholder="+56 9 1234 5678" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Crea tu contraseña</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold"
                placeholder="Mínimo 6 caracteres" />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 border-t border-neutral-100 pt-6">Preferencias de Clase</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 rounded-2xl border border-neutral-100 mb-4">
              {(["presencial", "online"] as const).map(m => (
                <button key={m} type="button" onClick={() => setForm(p => ({ ...p, modalidad: m }))}
                  className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${form.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                  {m === "online" ? "📹 Virtual" : "🏠 Presencial"}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 mt-4 bg-neutral-900 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-neutral-900/20 hover:bg-violet-600 transition-colors disabled:opacity-50">
            {submitting ? "Creando perfil..." : "Completar Inscripción"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function StudentRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-violet-950 border-t-violet-400 rounded-full animate-spin" />
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  )
}
