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
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    method: "TRANSFER",
    date: toDateStr(new Date()),
    notes: "",
    payment_type: "SINGLE",
    period_start: toDateStr(new Date()),
    period_end: toDateStr(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
    classes_included: "4"
  })

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

      // Refrescar token en segundo plano antes de escribir (no bloquea la UI)
      supabase.auth.refreshSession().catch(() => {})

      const { error: insertErr } = await supabase.from("Payment").insert({
        student_id: form.student_id,
        teacher_id: profile.teacherProfileId,
        amount: parseFloat(form.amount),
        method: form.method,
        date: form.date,
        notes: form.notes,
        payment_type: form.payment_type,
        period_start: form.payment_type === "MONTHLY" ? form.period_start : null,
        period_end: form.payment_type === "MONTHLY" ? form.period_end : null,
        classes_included: form.payment_type === "MONTHLY" ? parseInt(form.classes_included) : 1,
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

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Alumno *</label>
            <select value={form.student_id} onChange={e => set("student_id", e.target.value)} className="kh-input w-full" required>
              <option value="">Seleccionar…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Tipo de Pago</label>
            <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
              <button type="button" onClick={() => set("payment_type", "SINGLE")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${form.payment_type === "SINGLE" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"}`}>Simple</button>
              <button type="button" onClick={() => set("payment_type", "MONTHLY")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${form.payment_type === "MONTHLY" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"}`}>Pack Mensual</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Monto *</label>
            <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} className="kh-input w-full" placeholder="50000" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Método</label>
            <select value={form.method} onChange={e => set("method", e.target.value)} className="kh-input w-full">
              <option value="TRANSFER">Transferencia</option>
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fecha Pago *</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="kh-input w-full" required />
          </div>
        </div>

        {form.payment_type === "MONTHLY" && (
          <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 space-y-4">
            <h3 className="text-xs font-black text-violet-700 uppercase tracking-widest">Detalles del Pack Mensual</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-violet-400 uppercase mb-2">Inicio Período</label>
                <input type="date" value={form.period_start} onChange={e => set("period_start", e.target.value)} className="kh-input w-full border-violet-200" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-violet-400 uppercase mb-2">Fin Período</label>
                <input type="date" value={form.period_end} onChange={e => set("period_end", e.target.value)} className="kh-input w-full border-violet-200" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-violet-400 uppercase mb-2">Clases Incluidas</label>
                <input type="number" value={form.classes_included} onChange={e => set("classes_included", e.target.value)} className="kh-input w-full border-violet-200" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Notas</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className="kh-input w-full" rows={2} placeholder="Opcional…" />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="kh-btn-secondary py-3 px-6">Cancelar</button>
          <button type="submit" disabled={loading} className="kh-btn-primary py-3 px-8">
            {loading ? "Guardando..." : "💰 Registrar Pago"}
          </button>
        </div>
      </form>
    </div>
  )
}
