"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TEACHER"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          }
        }
      })

      if (authError) {
        setError(authError.message || "Error al crear la cuenta")
        return
      }

      // If user is returned but session is null, it means Email Confirmation is enabled in Supabase!
      if (data.user && !data.session) {
        setError("¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta.")
        // Don't redirect immediately so they can read the message
        setTimeout(() => {
          router.push("/login")
        }, 5000)
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #12131f 50%, #0d1117 100%)",
      }}
    >
      {/* Ambient glow elements */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />

      {/* Subtle rhythm lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.08) 40px, rgba(255,255,255,0.08) 41px)",
      }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.3) 100%)",
                border: "1px solid rgba(139,92,246,0.4)",
                boxShadow: "0 0 24px rgba(139,92,246,0.2)",
              }}
            >
              🥁
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>
              Khora
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Crea tu cuenta para empezar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                NOMBRE COMPLETO
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  caretColor: "#8b5cf6",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(139,92,246,0.6)"
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  caretColor: "#8b5cf6",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(139,92,246,0.6)"
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                ROL
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "TEACHER", label: "Profesor", icon: "🎓" },
                  { value: "STUDENT", label: "Alumno", icon: "🎵" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: option.value })}
                    className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      background: formData.role === option.value
                        ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))"
                        : "rgba(255,255,255,0.05)",
                      border: formData.role === option.value
                        ? "1px solid rgba(139,92,246,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: formData.role === option.value
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.4)",
                      boxShadow: formData.role === option.value
                        ? "0 0 16px rgba(139,92,246,0.15)"
                        : "none",
                    }}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                    caretColor: "#8b5cf6",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(139,92,246,0.6)"
                    e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)"
                    e.target.style.boxShadow = "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  caretColor: "#8b5cf6",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(139,92,246,0.6)"
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "rgba(252,165,165,0.9)",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{
                background: loading
                  ? "rgba(139,92,246,0.3)"
                  : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
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

          {/* Footer */}
          <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: "rgba(167,139,250,0.9)" }}
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
