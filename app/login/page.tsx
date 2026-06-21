"use client"
 
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [emailOrName, setEmailOrName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    let finalEmail = emailOrName.trim()

    // Si no contiene '@', asumimos que es un nombre completo e intentamos resolver su email
    if (!finalEmail.includes("@")) {
      try {
        const { data: resolvedEmail, error: rpcErr } = await supabase.rpc("get_email_by_name", { 
          p_name: finalEmail 
        })
        
        if (rpcErr || !resolvedEmail) {
          setError("Nombre, email o contraseña incorrectos")
          setLoading(false)
          return
        }
        finalEmail = resolvedEmail
      } catch (err) {
        setError("Error al resolver el nombre de usuario")
        setLoading(false)
        return
      }
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email: finalEmail, password })
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Nombre, email o contraseña incorrectos" : err.message)
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
              <label className="kh-label">Nombre o Email</label>
              <input 
                type="text" 
                required 
                value={emailOrName} 
                onChange={e => setEmailOrName(e.target.value)} 
                className="kh-input" 
                placeholder="Nombre completo o email" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="kh-label mb-0">Contraseña</label>
                <Link href="/recuperar" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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

