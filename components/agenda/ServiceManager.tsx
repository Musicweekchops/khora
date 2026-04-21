"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
  color: string
}

export default function ServiceManager({ teacherId }: { teacherId: string }) {
  const [services, setServices] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "🎵",
    price: "",
    duration: "60",
    color: "#7c3aed"
  })

  useEffect(() => {
    loadServices()
  }, [teacherId])

  async function loadServices() {
    const { data } = await supabase
      .from("ClassType")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at")
    
    if (data) setServices(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from("ClassType").insert({
      teacher_id: teacherId,
      name: form.name,
      description: form.description,
      icon: form.icon,
      price: parseFloat(form.price) || 0,
      duration: parseInt(form.duration) || 60,
      color: form.color
    })

    if (error) alert(error.message)
    else {
      setShowForm(false)
      setForm({ name: "", description: "", icon: "🎵", price: "", duration: "60", color: "#7c3aed" })
      loadServices()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este servicio? Esto no afectará a las clases ya agendadas.")) return
    await supabase.from("ClassType").delete().eq("id", id)
    loadServices()
  }

  if (loading) return <div className="kh-skeleton h-40" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-neutral-900">Tus Servicios y Clases</h3>
          <p className="text-sm text-neutral-400 font-medium mt-1">Configura lo que tus alumnos pueden ver y agendar públicamente.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="kh-btn-primary px-6 py-3 text-xs">
            + Nuevo Servicio
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="kh-card p-8 bg-neutral-50 border-neutral-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="kh-label">Nombre del Servicio *</label>
                <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="kh-input" placeholder="Ej: Clase de Batería 60min" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="kh-label">Precio (CLP) *</label>
                  <input type="number" required value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className="kh-input" placeholder="25000" />
                </div>
                <div>
                  <label className="kh-label">Duración (min) *</label>
                  <input type="number" required value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} className="kh-input" placeholder="60" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="kh-label">Emoji / Icono</label>
                  <input value={form.icon} onChange={e => setForm(p => ({...p, icon: e.target.value}))} className="kh-input text-2xl text-center" placeholder="🎵" />
                </div>
                <div>
                  <label className="kh-label">Color Bio</label>
                  <input type="color" value={form.color} onChange={e => setForm(p => ({...p, color: e.target.value}))} className="kh-input h-[50px] p-1 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="kh-label">Descripción (opcional)</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="kh-input h-[50px] resize-none" placeholder="Breve detalle..." />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200">
            <button type="button" onClick={() => setShowForm(false)} className="kh-btn-secondary px-6">Cancelar</button>
            <button type="submit" disabled={saving} className="kh-btn-primary px-10">
              {saving ? "Guardando..." : "✓ Crear Servicio"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
            <p className="text-neutral-400 font-bold italic">No has configurado servicios todavía. ¡Crea el primero para que aparezca en tu agenda pública!</p>
          </div>
        ) : (
          services.map(s => (
            <div key={s.id} className="kh-card p-6 flex items-center gap-5 group hover:border-violet-300 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-3xl shadow-sm border border-neutral-50" style={{ borderColor: s.color + '44' }}>
                {s.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-neutral-900">{s.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">{s.duration} MIN</span>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="text-xs font-black text-violet-600">${s.price.toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
