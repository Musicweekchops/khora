"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

const INSTRUMENTOS = [
  "Batería", "Piano / Teclado", "Guitarra", "Bajo Eléctrico",
  "Canto / Voz", "Producción Musical", "Otros"
]

interface Props {
  academyId: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateTeacherModal({ academyId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", email: "", instrumento: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-teacher", {
        body: {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          name: form.name.trim(),
          instrumento: form.instrumento,
          academy_id: academyId,
        },
      })

      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.error)

      onCreated()
    } catch (err: any) {
      setError(err.message ?? "Error al crear el profesor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Nuevo Profesor</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Se enviará un correo de bienvenida con sus credenciales</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200 text-xs transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Nombre completo</label>
            <input
              type="text" required value={form.name} onChange={e => set("name", e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              placeholder="Nombre del profesor"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email" required value={form.email} onChange={e => set("email", e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              placeholder="profesor@academia.cl"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Instrumento / Especialidad</label>
            <select
              required value={form.instrumento} onChange={e => set("instrumento", e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
            >
              <option value="" disabled>Seleccionar...</option>
              {INSTRUMENTOS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Contraseña temporal</label>
            <input
              type="text" required minLength={6} value={form.password} onChange={e => set("password", e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-mono"
              placeholder="Mínimo 6 caracteres"
            />
            <p className="text-[11px] text-neutral-400 mt-1">El profesor deberá cambiarla en su primer inicio de sesión</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</>
              ) : "Crear Profesor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
