"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { toDateStr } from "@/lib/utils"

export default function NuevoPagoPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ student_id: "", amount: "", method: "TRANSFER", date: toDateStr(new Date()), notes: "" })

  useEffect(() => {
    if (profile?.teacherProfileId) loadStudents(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadStudents(teacherId: string) {
    const { data } = await supabase.from("StudentProfile").select("id, User ( name )").eq("teacher_id", teacherId)
    if (data) setStudents(data.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!profile?.teacherProfileId) throw new Error("Sin perfil")
      if (!form.student_id) throw new Error("Selecciona un alumno")

      const { error: insertErr } = await supabase.from("Payment").insert({
        student_id: form.student_id,
        teacher_id: profile.teacherProfileId,
        amount: parseFloat(form.amount),
        method: form.method,
        date: form.date,
        notes: form.notes,
      })

      if (insertErr) throw insertErr

      // Actualizar lifetime_value
      const { data: payments } = await supabase.from("Payment").select("amount").eq("student_id", form.student_id)
      const total = payments?.reduce((s, p) => s + (p.amount || 0), 0) ?? 0
      await supabase.from("StudentProfile").update({ lifetime_value: total }).eq("id", form.student_id)

      router.push("/dashboard/financiero")
    } catch (err: any) {
      setError(err.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Registrar Pago</h1>
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-sm font-bold">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Alumno *</label>
          <select value={form.student_id} onChange={e => set("student_id", e.target.value)} className="input-field w-full" required>
            <option value="">Seleccionar…</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Monto *</label>
            <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} className="input-field w-full" placeholder="50000" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Método</label>
            <select value={form.method} onChange={e => set("method", e.target.value)} className="input-field w-full">
              <option value="TRANSFER">Transferencia</option>
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fecha *</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field w-full" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Notas</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="input-field w-full" rows={2} placeholder="Opcional…" />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-sm font-bold">Cancelar</button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">
            {loading ? "Guardando..." : "💰 Registrar Pago"}
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
