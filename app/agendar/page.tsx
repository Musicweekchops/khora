"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface ClassType {
  id: string; name: string; description: string; icon: string; price: number; currency: string; duration: number
}

export default function AgendarPage() {
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selected, setSelected] = useState<ClassType | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", date: "", start_time: "10:00" })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadClassTypes()
  }, [])

  async function loadClassTypes() {
    const { data } = await supabase.from("ClassType").select("*").order("price")
    if (data) setClassTypes(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setError("")

    try {
      // Find teacher for this class type
      const { data: ct } = await supabase.from("ClassType").select("teacher_id").eq("id", selected.id).single()
      if (!ct) throw new Error("Tipo de clase no encontrado")

      const endHour = parseInt(formData.start_time.split(":")[0]) + Math.ceil(selected.duration / 60)
      const endTime = `${String(endHour).padStart(2, "0")}:${formData.start_time.split(":")[1]}`

      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: ct.teacher_id,
        class_type_id: selected.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        date: formData.date,
        start_time: formData.start_time,
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
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-100 p-10 text-center shadow-xl">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">¡Reserva Confirmada!</h2>
          <p className="text-neutral-500">Nos pondremos en contacto contigo para confirmar los detalles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2">Agenda tu Clase</h1>
          <p className="text-neutral-500 font-medium">Selecciona el tipo de clase y completa tus datos</p>
        </div>

        {!selected ? (
          /* Step 1: Select class type */
          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border p-8 animate-pulse h-32" />)
            ) : classTypes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border">
                <p className="text-neutral-500">No hay tipos de clases disponibles todavía.</p>
              </div>
            ) : (
              classTypes.map(ct => (
                <button key={ct.id} onClick={() => setSelected(ct)} className="w-full text-left">
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex items-center gap-5 hover:shadow-lg hover:border-violet-300 transition-all group">
                    <span className="text-4xl">{ct.icon || "🎵"}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 group-hover:text-violet-600 transition-colors">{ct.name}</h3>
                      <p className="text-sm text-neutral-500">{ct.description || `${ct.duration} min`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-neutral-900">${ct.price.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400 uppercase">{ct.currency}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Form */
          <div>
            <button onClick={() => setSelected(null)} className="text-sm text-violet-600 font-bold mb-6 hover:underline">← Cambiar tipo de clase</button>

            <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                <p className="text-sm font-bold opacity-80">Reservando</p>
                <h2 className="text-xl font-black">{selected.icon} {selected.name}</h2>
                <p className="text-sm opacity-80 mt-1">${selected.price.toLocaleString()} {selected.currency} · {selected.duration} min</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Nombre *</label>
                    <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Email *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium" placeholder="tu@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Teléfono *</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium" placeholder="+56 9 ..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Fecha *</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Hora de inicio</label>
                  <input type="time" value={formData.start_time} onChange={e => setFormData(p => ({...p, start_time: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Mensaje (opcional)</label>
                  <textarea value={formData.message} onChange={e => setFormData(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-medium resize-none" rows={3} placeholder="Algo que debamos saber…" />
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200">⚠️ {error}</div>}

                <button type="submit" disabled={submitting} className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50 shadow-lg shadow-violet-600/20">
                  {submitting ? "Reservando..." : "🎵 Confirmar Reserva"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
