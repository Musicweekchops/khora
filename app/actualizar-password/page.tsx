"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Lock, CheckCircle2 } from "lucide-react"

export default function ActualizarPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [sessionVerified, setSessionVerified] = useState(false)

  useEffect(() => {
    // Verificar si el usuario realmente viene con un token de recuperación válido
    // Cuando el usuario hace clic en el enlace, Supabase automáticamente inicia la sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionVerified(true)
      } else {
        // Podríamos redirigir al login si no hay sesión, pero a veces tarda un milisegundo
        // Supabase onAuthStateChange capturará si entramos
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) setSessionVerified(true)
        })
        return () => authListener.subscription.unsubscribe()
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setError("")
    setLoading(true)

    // Al estar ya autenticado por el token del email, usamos updateUser
    const { error: err } = await supabase.auth.updateUser({
      password: password
    })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      // Cerrar sesión opcionalmente para obligar login con nueva clave, o redirigir
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
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
          <h1 className="text-2xl font-bold text-neutral-900">¡Contraseña Actualizada!</h1>
          <p className="text-neutral-500">
            Tu contraseña se ha cambiado correctamente. Redirigiendo al panel...
          </p>
        </div>
      </div>
    )
  }

  if (!sessionVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-[380px]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Nueva Contraseña</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Ingresa tu nueva contraseña para acceder a Khora.
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
              <label className="kh-label block mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="kh-input" 
                placeholder="Mínimo 6 caracteres" 
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="kh-btn-primary w-full py-2.5 mt-2">
              {loading ? "Actualizando..." : "Guardar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
