"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatTime } from "@/lib/utils"
import ServiceManager from "./ServiceManager"

const DAYS = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
]

interface Range {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function AvailabilitySettings({ teacherId }: { teacherId: string }) {
  const [ranges, setRanges] = useState<Range[]>([])
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"horarios" | "servicios">("horarios")
  
  const [newRange, setNewRange] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "13:00",
  })

  useEffect(() => {
    loadAvailability()
  }, [teacherId])

  async function loadAvailability() {
    // 1. Fetch ranges
    const { data: rangeData } = await supabase
      .from("Availability")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("day_of_week")
      .order("start_time")
    
    if (rangeData) setRanges(rangeData)

    // 2. Fetch slug
    const { data: tp } = await supabase
      .from("TeacherProfile")
      .select("slug")
      .eq("id", teacherId)
      .single()
    
    if (tp) setSlug(tp.slug || "")

    setLoading(false)
  }

  async function updateSlug() {
    if (!slug.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from("TeacherProfile")
      .update({ slug: slug.trim().toLowerCase().replace(/\s+/g, "-") })
      .eq("id", teacherId)
    
    if (error) alert("Este nombre de link ya está ocupado. Prueba otro.")
    else alert("¡Link actualizado!")
    setSaving(false)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/agendar?p=${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAdd() {
    if (newRange.start_time >= newRange.end_time) {
      alert("La hora de inicio debe ser menor a la de fin")
      return
    }

    setSaving(true)
    const { error } = await supabase.from("Availability").insert({
      teacher_id: teacherId,
      ...newRange
    })

    if (error) alert(error.message)
    else loadAvailability()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("Availability").delete().eq("id", id)
    loadAvailability()
  }

  if (loading) return <div className="kh-skeleton h-40" />

  return (
    <div className="space-y-8">
      {/* Link de Reserva Section */}
      <div className="kh-card p-8 bg-violet-600 text-white border-none shadow-xl shadow-violet-600/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black">Tu Link de Reserva</h3>
            <p className="text-violet-100 text-sm opacity-90 font-medium">Comparte este link para que tus alumnos agenden clases.</p>
          </div>
          <div className="flex gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <input 
              type="text" 
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="bg-transparent border-none text-white font-black text-sm px-4 outline-none w-40"
              placeholder="tu-nombre"
            />
            <button onClick={updateSlug} className="bg-white text-violet-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-50 transition-all">
              {saving ? "..." : "Guardar"}
            </button>
          </div>
          <button 
            onClick={copyLink} 
            className={`px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              copied ? "bg-emerald-500 text-white" : "bg-white text-violet-600 hover:scale-105"
            }`}
          >
            {copied ? "✓ Copiado" : "🔗 Copiar Link Público"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-neutral-100 pb-2">
        <button 
          onClick={() => setActiveTab("horarios")}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === "horarios" ? "text-violet-600" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Horarios
          {activeTab === "horarios" && <span className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("servicios")}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === "servicios" ? "text-violet-600" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Servicios (Clases)
          {activeTab === "servicios" && <span className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
        </button>
      </div>

      {activeTab === "horarios" ? (
        <>
          {/* Formulario para nuevo rango */}
          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="kh-label px-1">Día de la semana</label>
                <select 
                  value={newRange.day_of_week} 
                  onChange={e => setNewRange(p => ({...p, day_of_week: Number(e.target.value)}))}
                  className="kh-input"
                >
                  {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="kh-label px-1">Hora de Inicio</label>
                <input 
                  type="time" 
                  value={newRange.start_time} 
                  onChange={e => setNewRange(p => ({...p, start_time: e.target.value}))}
                  className="kh-input"
                />
              </div>
              <div>
                <label className="kh-label px-1">Hora de Fin</label>
                <input 
                  type="time" 
                  value={newRange.end_time} 
                  onChange={e => setNewRange(p => ({...p, end_time: e.target.value}))}
                  className="kh-input"
                />
              </div>
              <button 
                onClick={handleAdd} 
                disabled={saving}
                className="kh-btn-primary py-4"
              >
                {saving ? "Cargando..." : "+ Agregar Horario"}
              </button>
            </div>
          </div>

          {/* Lista de rangos por día */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map(day => {
              const dayRanges = ranges.filter(r => r.day_of_week === day.id)
              return (
                <div key={day.id} className="bg-white rounded-2xl border border-neutral-100 p-4 border-t-4 border-t-violet-500">
                  <h4 className="font-black text-neutral-900 mb-3 flex items-center justify-between">
                    <span>{day.name}</span>
                    {dayRanges.length === 0 && <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">Cerrado</span>}
                  </h4>
                  <div className="space-y-2">
                    {dayRanges.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-neutral-50 p-2 rounded-xl group transition-all hover:bg-neutral-100">
                        <span className="text-sm font-bold text-neutral-600">
                          {formatTime(r.start_time)} – {formatTime(r.end_time)}
                        </span>
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="text-neutral-300 hover:text-red-500 transition-colors px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <ServiceManager teacherId={teacherId} />
      )}
    </div>
  )
}
