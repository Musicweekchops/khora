"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots, addMinutes, timesOverlap } from "@/lib/availability"
import { formatTime } from "@/lib/utils"

interface ClassType {
  id: string; name: string; description: string; icon: string; price: number; currency: string; duration: number
}

interface Teacher {
  id: string; user_id: string; slug: string; User: { name: string }
}

export default function AgendarPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="animate-pulse font-bold text-neutral-400">Cargando...</p></div>}>
      <PublicBookingPage />
    </Suspense>
  )
}

function PublicBookingPage() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("p")

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selected, setSelected] = useState<ClassType | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", date: "" })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (slug) loadTeacherAndClasses()
  }, [slug])

  useEffect(() => {
    if (formData.date && selected && teacher) {
      loadSlots()
    }
  }, [formData.date, selected, teacher])

  async function loadTeacherAndClasses() {
    setLoading(true)
    setError("")
    
    // 1. Fetch teacher by slug
    const { data: t, error: tErr } = await supabase
      .from("TeacherProfile")
      .select("id, user_id, slug, User ( name )")
      .eq("slug", slug)
      .maybeSingle()

    if (tErr || !t) {
      setError("Profesor no encontrado")
      setLoading(false)
      return
    }

    setTeacher(t as any)

    // 2. Fetch class types for THIS teacher
    const { data: ct } = await supabase
      .from("ClassType")
      .select("*")
      .eq("teacher_id", t.id)
      .order("price")
    
    if (ct) setClassTypes(ct)
    setLoading(false)
  }

  async function loadSlots() {
    if (!selected || !formData.date || !teacher) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    
    const slots = await getAvailableSlots(formData.date, teacher.id, selected.duration)
    setAvailableSlots(slots)
    setLoadingSlots(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !selectedSlot || !teacher) return
    setSubmitting(true)
    setError("")

    try {
      const startTime = selectedSlot
      const endTime = addMinutes(startTime, selected.duration)

      // FINAL CONFLICT CHECK
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", formData.date)
        .neq("status", "CANCELLED")

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", formData.date)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("Este horario acaba de ser reservado. Por favor elige otro.")
      }

      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: teacher.id,
        class_type_id: selected.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        date: formData.date,
        start_time: startTime,
        end_time: endTime,
        total_price: selected.price,
        status: "PENDING",
      })

      if (insertErr) throw insertErr
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al agendar")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="kh-skeleton w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-neutral-400 font-bold animate-pulse">Cargando agenda de {slug}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-neutral-100 p-12 text-center shadow-2xl">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Lo sentimos</h2>
          <p className="text-neutral-500 font-medium">{error}</p>
          <a href="/" className="mt-8 block kh-btn-secondary py-3">Volver al inicio</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-neutral-100 p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">✓</div>
          <h2 className="text-3xl font-black text-neutral-900 mb-3">¡Reserva Enviada!</h2>
          <p className="text-neutral-500 font-medium leading-relaxed">Hemos recibido tu solicitud para agendar con <b>{teacher?.User?.name}</b>. Te contactaremos pronto.</p>
          <button onClick={() => window.location.reload()} className="mt-10 kh-btn-primary w-full py-4">Agendar otra</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-violet-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-violet-600/20">
            {teacher?.User?.name.charAt(0)}
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2">Agenda con {teacher?.User?.name}</h1>
          <p className="text-neutral-500 font-bold">Selecciona el servicio para ver horarios disponibles</p>
        </div>

        {!selected ? (
          <div className="grid gap-4">
            {classTypes.length === 0 ? (
              <div className="kh-card p-20 text-center">
                <p className="text-neutral-400 font-bold italic">Este profesor no tiene servicios configurados todavía.</p>
              </div>
            ) : (
              classTypes.map(ct => (
                <button key={ct.id} onClick={() => setSelected(ct)} className="group text-left p-1">
                  <div className="kh-card p-8 flex items-center gap-6 group-hover:border-violet-500 group-hover:shadow-xl transition-all relative overflow-hidden">
                    <span className="text-5xl">{ct.icon || "🎵"}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-neutral-900">{ct.name}</h3>
                      <p className="text-neutral-400 font-bold mt-1 uppercase text-xs tracking-widest">{ct.duration} MINUTOS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-neutral-900">${ct.price.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Form & Slots */
          <div className="space-y-6">
            <button onClick={() => setSelected(null)} className="text-xs font-black text-violet-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
              ← Volver a servicios
            </button>

            <div className="kh-card p-0 overflow-hidden">
              <div className="bg-neutral-900 p-8 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Servicio seleccionado</p>
                  <h2 className="text-2xl font-black">{selected.icon} {selected.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">${selected.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-violet-500 rounded-full" /> Tus Datos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="kh-input" placeholder="Nombre completo" />
                    <input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="kh-input" placeholder="Email" />
                  </div>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="kh-input" placeholder="WhatsApp / Teléfono" />
                </div>

                <div className="space-y-6 pt-4 border-t border-neutral-100">
                  <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-emerald-500 rounded-full" /> Fecha y Hora</h3>
                  <input type="date" required value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="kh-input" min={new Date().toISOString().split("T")[0]} />

                  {formData.date && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="kh-label mb-3 block">Horas disponibles ({formatDate(formData.date)})</label>
                      {loadingSlots ? (
                        <div className="flex gap-2"><div className="kh-skeleton w-20 h-10"/><div className="kh-skeleton w-20 h-10"/></div>
                      ) : availableSlots.length === 0 ? (
                        <p className="p-6 bg-neutral-50 rounded-2xl text-center text-sm font-bold text-neutral-400 italic">No hay horarios disponibles.</p>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-2 rounded-xl text-xs font-black transition-all ${
                                selectedSlot === slot ? "bg-violet-600 text-white shadow-lg" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                              }`}
                            >
                              {formatTime(slot)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-200">⚠️ {error}</div>}

                <button 
                  type="submit" 
                  disabled={submitting || !selectedSlot} 
                  className="w-full kh-btn-primary py-5 text-lg shadow-xl shadow-violet-600/20"
                >
                  {submitting ? "Reservando..." : "🎵 Solicitar Reserva"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
}
