"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatTime } from "@/lib/utils"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newRange, setNewRange] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "13:00",
  })

  useEffect(() => {
    loadAvailability()
  }, [teacherId])

  async function loadAvailability() {
    const { data } = await supabase
      .from("Availability")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("day_of_week")
      .order("start_time")
    
    if (data) setRanges(data)
    setLoading(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-neutral-900">Horarios de Disponibilidad</h3>
        <p className="text-xs text-neutral-400 font-medium italic">Define cuándo estás libre para recibir reservas públicas</p>
      </div>

      {/* Formulario para nuevo rango */}
      <div className="kh-card p-6 bg-neutral-50/50 border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="kh-label">Día</label>
            <select 
              value={newRange.day_of_week} 
              onChange={e => setNewRange(p => ({...p, day_of_week: Number(e.target.value)}))}
              className="kh-input text-sm"
            >
              {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="kh-label">Inicio</label>
            <input 
              type="time" 
              value={newRange.start_time} 
              onChange={e => setNewRange(p => ({...p, start_time: e.target.value}))}
              className="kh-input text-sm"
            />
          </div>
          <div>
            <label className="kh-label">Fin</label>
            <input 
              type="time" 
              value={newRange.end_time} 
              onChange={e => setNewRange(p => ({...p, end_time: e.target.value}))}
              className="kh-input text-sm"
            />
          </div>
          <button 
            onClick={handleAdd} 
            disabled={saving}
            className="kh-btn-primary py-3"
          >
            {saving ? "..." : "+ Agregar Rango"}
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
    </div>
  )
}
