"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { toDateStr } from "@/lib/utils"

export default function NuevaClasePage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    student_id: "", date: toDateStr(new Date()),
    start_time: "10:00", end_time: "11:00", modalidad: "online",
  })

  useEffect(() => {
    if (profile?.teacherProfileId) loadStudents(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadStudents(teacherId: string) {
    const { data } = await supabase
      .from("StudentProfile")
      .select("id, User ( name )")
      .eq("teacher_id", teacherId)
    if (data) setStudents(data.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!profile?.teacherProfileId) throw new Error("Sin perfil de profesor")

      const { error: insertErr } = await supabase.from("Class").insert({
        teacher_id: profile.teacherProfileId,
        student_id: form.student_id || null,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        modalidad: form.modalidad,
        status: "SCHEDULED",
      })

      if (insertErr) throw insertErr
      router.push("/dashboard/clases")
    } catch (err: any) {
      setError(err.message || "Error creando clase")
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Nueva Clase</h1>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-sm font-bold">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Alumno</label>
          <select value={form.student_id} onChange={e => set("student_id", e.target.value)} className="input-field w-full">
            <option value="">Sin asignar</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fecha</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Inicio</label>
            <input type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fin</label>
            <input type="time" value={form.end_time} onChange={e => set("end_time", e.target.value)} className="input-field w-full" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Modalidad</label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 rounded-2xl">
            {(["online", "presencial"] as const).map(mod => (
              <button key={mod} type="button" onClick={() => set("modalidad", mod)}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.modalidad === mod ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                {mod === "online" ? "📹 Virtual" : "🏠 Presencial"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-sm font-bold">Cancelar</button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors disabled:opacity-50">
            {loading ? "Creando..." : "Crear Clase"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input-field { width: 100%; padding: 0.75rem 1.25rem; border: 1px solid #e5e7eb; background: white; border-radius: 1rem; outline: none; font-weight: 700; font-size: 0.875rem; color: #171717; transition: all 0.2s; }
        .input-field:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
      `}</style>
    </div>
  )
}
