"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots, addMinutes, timesOverlap } from "@/lib/availability"
import { formatTime } from "@/lib/utils"

interface ClassType {
  id: string; name: string; description: string; icon: string; price: number; currency: string; duration: number
}

export default function AgendarPage() {
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
    loadClassTypes()
  }, [])

  useEffect(() => {
    if (formData.date && selected) {
      loadSlots()
    }
  }, [formData.date, selected])

  async function loadClassTypes() {
    const { data } = await supabase.from("ClassType").select("*").order("price")
    if (data) setClassTypes(data)
    setLoading(false)
  }

  async function loadSlots() {
    if (!selected || !formData.date) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    
    // Find teacher
    const { data: ct } = await supabase.from("ClassType").select("teacher_id").eq("id", selected.id).single()
    if (ct) {
      const slots = await getAvailableSlots(formData.date, ct.teacher_id, selected.duration)
      setAvailableSlots(slots)
    }
    setLoadingSlots(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !selectedSlot) return
    setSubmitting(true)
    setError("")

    try {
      // Find teacher
      const { data: ct } = await supabase.from("ClassType").select("teacher_id").eq("id", selected.id).single()
      if (!ct) throw new Error("Tipo de clase no encontrado")

      const startTime = selectedSlot
      const endTime = addMinutes(startTime, selected.duration)

      // FINAL CONFLICT CHECK (Safety)
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", ct.teacher_id)
        .eq("date", formData.date)
        .neq("status", "CANCELLED")

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", ct.teacher_id)
        .eq("date", formData.date)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("Este horario acaba de ser reservado. Por favor elige otro.")
      }

      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: ct.teacher_id,
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-neutral-100 p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">✓</div>
          <h2 className="text-3xl font-black text-neutral-900 mb-3">¡Reserva Enviada!</h2>
          <p className="text-neutral-500 font-medium leading-relaxed">Hemos recibido tu solicitud. El profesor se pondrá en contacto contigo pronto para confirmar.</p>
          <button onClick={() => window.location.reload()} className="mt-10 kh-btn-primary w-full py-4">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-neutral-900 tracking-tight mb-4">Agenda tu Clase</h1>
          <p className="text-neutral-500 font-bold text-lg">Reserva tu espacio en segundos</p>
        </div>

        {!selected ? (
          /* Step 1: Select class type */
          <div className="grid gap-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="kh-skeleton h-32" />)
            ) : classTypes.length === 0 ? (
              <div className="kh-card p-20 text-center">
                <p className="text-neutral-400 font-bold italic">No hay tipos de clases disponibles todavía.</p>
              </div>
            ) : (
              classTypes.map(ct => (
                <button key={ct.id} onClick={() => setSelected(ct)} className="group text-left p-1">
                  <div className="kh-card p-8 flex items-center gap-6 group-hover:border-violet-500 group-hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-violet-100" />
                    <span className="text-5xl relative z-10">{ct.icon || "🎵"}</span>
                    <div className="flex-1 relative z-10">
                      <h3 className="text-xl font-black text-neutral-900">{ct.name}</h3>
                      <p className="text-neutral-400 font-bold mt-1 uppercase text-xs tracking-widest">{ct.duration} MINUTOS</p>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-2xl font-black text-neutral-900">${ct.price.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">CONFIRMACIÓN RÁPIDA</p>
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
                  <p className="text-[10px] font-bold text-neutral-500 uppercase">{selected.duration} min</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-violet-500 rounded-full" /> Tus Datos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="kh-label px-1">Nombre Completo *</label>
                      <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="kh-input" placeholder="Ej: Juan Pérez" />
                    </div>
                    <div>
                      <label className="kh-label px-1">Email *</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="kh-input" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="kh-label px-1">WhatsApp / Teléfono *</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="kh-input" placeholder="+56 9 ..." />
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-neutral-100">
                  <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-emerald-500 rounded-full" /> Elegir Fecha y Hora</h3>
                  <div>
                    <label className="kh-label px-1">Fecha de la clase *</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="kh-input" min={new Date().toISOString().split("T")[0]} />
                  </div>

                  {formData.date && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="kh-label px-1 mb-3 block">Horas disponibles para el {new Date(formData.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</label>
                      {loadingSlots ? (
                        <div className="flex gap-2"><div className="kh-skeleton w-20 h-10"/><div className="kh-skeleton w-20 h-10"/></div>
                      ) : availableSlots.length === 0 ? (
                        <p className="p-6 bg-neutral-50 rounded-2xl text-center text-sm font-bold text-neutral-400 italic border border-neutral-100">No hay horarios disponibles para este día.</p>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-2 rounded-xl text-xs font-black transition-all ${
                                selectedSlot === slot ? "bg-violet-600 text-white shadow-lg scale-105" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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

                <div>
                  <label className="kh-label px-1">Mensaje o Dudas (opcional)</label>
                  <textarea value={formData.message} onChange={e => setFormData(p => ({...p, message: e.target.value}))} className="kh-input resize-none" rows={3} placeholder="Algo que el profesor deba saber…" />
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-200">⚠️ {error}</div>}

                <button 
                  type="submit" 
                  disabled={submitting || !selectedSlot} 
                  className="w-full kh-btn-primary py-5 text-lg shadow-xl shadow-violet-600/20"
                >
                  {submitting ? "Procesando..." : "🎵 Solicitar Reserva"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
