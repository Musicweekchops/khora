"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setError("")
    setLoading(true)

    // El RedirectTo debe apuntar a tu URL de frontend donde el usuario establecerá la nueva contraseña.
    // Usaremos origin para que funcione tanto en local como en producción.
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/actualizar-password` : ''

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-[380px] text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Revisa tu correo</h1>
          <p className="text-neutral-500">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
            Haz clic en el enlace para crear una nueva contraseña.
          </p>
          <div className="pt-6">
            <Link href="/login" className="kh-btn-secondary inline-block px-8 py-2">
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[380px]">
        
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Recuperar Contraseña</h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        {/* Form */}
        <div className="kh-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="kh-label block mb-1">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="kh-input" 
                placeholder="tu@email.com" 
              />
            </div>

            <button type="submit" disabled={loading} className="kh-btn-primary w-full py-2.5 mt-2">
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
