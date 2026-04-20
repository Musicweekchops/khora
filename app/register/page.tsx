"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: "TEACHER" } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-lg font-bold">K</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-neutral-500 mt-1.5">Empieza a gestionar tus clases</p>
        </div>

        <div className="kh-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="kh-label">Nombre completo</label>
              <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} className="kh-input" placeholder="Tu nombre" />
            </div>

            <div>
              <label className="kh-label">Email</label>
              <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className="kh-input" placeholder="tu@email.com" />
            </div>

            <div>
              <label className="kh-label">Contraseña</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => set("password", e.target.value)} className="kh-input" placeholder="Mínimo 6 caracteres" />
            </div>

            <button type="submit" disabled={loading} className="kh-btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando…
                </span>
              ) : "Crear cuenta de profesor"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-neutral-900 font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
