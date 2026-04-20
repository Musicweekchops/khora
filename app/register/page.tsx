"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: "TEACHER" },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Si requiere confirmación por email
      if (data.user && !data.session) {
        setError("¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.")
        setTimeout(() => router.push("/login"), 4000)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #12131f 50%, #0d1117 100%)" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)", transform: "translate(30%, 30%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.08) 40px, rgba(255,255,255,0.08) 41px)" }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))",
                border: "1px solid rgba(139,92,246,0.4)",
                boxShadow: "0 0 24px rgba(139,92,246,0.2)",
              }}
            >
              🥁
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>Khora</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Crea tu cuenta de profesor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="NOMBRE COMPLETO" value={name} onChange={setName} placeholder="Tu nombre" required />
            <InputField label="EMAIL" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" required />

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>CONTRASEÑA</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {showPw ? "👁" : "👁‍🗨"}
                </button>
              </div>
            </div>

            <InputField label="CONFIRMAR CONTRASEÑA" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite tu contraseña" required />

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,0.9)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-50"
              style={{
                background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white",
                boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : "Crear Cuenta"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium" style={{ color: "rgba(167,139,250,0.9)" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}
      />
    </div>
  )
}
