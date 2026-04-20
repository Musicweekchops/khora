"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[380px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-lg font-bold">K</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-neutral-500 mt-1.5">Accede a tu panel de gestión</p>
        </div>

        {/* Form */}
        <div className="kh-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="kh-label">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="kh-input" placeholder="tu@email.com" />
            </div>

            <div>
              <label className="kh-label">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="kh-input" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="kh-btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando…
                </span>
              ) : "Continuar"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-5">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-neutral-900 font-medium hover:underline">Crear cuenta</Link>
        </p>
      </div>
    </div>
  )
}
