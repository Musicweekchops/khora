"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface StudentFormProps {
  mode: "create" | "edit"
  studentId?: string
}

export default function StudentForm({ mode, studentId }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "PROSPECT",
    leadSource: "",
    modalidad: "online",
    preferredDay: "",
    preferredTime: "",
    emergencyContact: "",
    emergencyPhone: ""
  })

  useEffect(() => {
    if (mode === "edit" && studentId) {
      fetchStudent()
    }
  }, [mode, studentId])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          password: "", // No mostramos la contraseña
          status: data.status,
          leadSource: data.leadSource || "",
          modalidad: data.modalidad || "online",
          preferredDay: data.preferredDay || "",
          preferredTime: data.preferredTime || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || ""
        })
      }
    } catch (error) {
      console.error("Error al cargar alumno:", error)
      setError("Error al cargar los datos del alumno")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = mode === "create" 
        ? "/api/students"
        : `/api/students/${studentId}`
      
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al guardar el alumno")
        return
      }

      // Redirigir a la lista de alumnos
      router.push("/dashboard/alumnos")
      router.refresh()

    } catch (error) {
      setError("Error al guardar el alumno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 text-sm font-bold flex items-center gap-3 animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lado Izquierdo: Datos Personales */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Identidad del Alumno
            </h3>
            
            <div className="space-y-6">
              <FormField label="Nombre Completo *" icon="👤">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 placeholder:text-neutral-300"
                  placeholder="Ej: Rodrigo Tapia"
                />
              </FormField>

              <FormField label="Correo Electrónico *" icon="✉️">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 placeholder:text-neutral-300 disabled:opacity-50"
                  placeholder="nombre@ejemplo.com"
                  disabled={mode === "edit"}
                />
              </FormField>

              <FormField label="Teléfono / WhatsApp" icon="📞">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 placeholder:text-neutral-300"
                  placeholder="+56 9 ..."
                />
              </FormField>

              {mode === "create" && (
                <FormField label="Contraseña Inicial" icon="🔒" subtitle="Dejar vacío para auto-generar">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 placeholder:text-neutral-300"
                    placeholder="••••••••"
                  />
                </FormField>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-amber-400 rounded-full" />
              Estado y Origen
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Estado Académico" icon="📈">
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 appearance-none"
                >
                  <option value="PROSPECT">Prospecto</option>
                  <option value="TRIAL">Clase de Prueba</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </FormField>

              <FormField label="Fuente de Captación" icon="🔗">
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="GOOGLE">Google Ads</option>
                  <option value="REFERRAL">Referido</option>
                  <option value="WEBSITE">Web Directo</option>
                  <option value="OTHER">Otro</option>
                </select>
              </FormField>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Preferencias y Emergencia */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full" />
              Personalización de Clases
            </h3>
            
            <div className="space-y-6">
              <FormField label="Modalidad de Estudio" icon="🎓">
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 rounded-2xl">
                  {['online', 'presencial'].map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setFormData({ ...formData, modalidad: mod })}
                      className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        formData.modalidad === mod
                          ? "bg-white text-primary shadow-sm"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      {mod === 'online' ? '📹 Virtual' : '🏠 Sede'}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Día Preferido" icon="🗓️">
                  <select
                    value={formData.preferredDay}
                    onChange={(e) => setFormData({ ...formData, preferredDay: e.target.value })}
                    className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900 appearance-none"
                  >
                    <option value="">Cualquiera</option>
                    <option value="Monday">Lunes</option>
                    <option value="Tuesday">Martes</option>
                    <option value="Wednesday">Miércoles</option>
                    <option value="Thursday">Jueves</option>
                    <option value="Friday">Viernes</option>
                    <option value="Saturday">Sábado</option>
                  </select>
                </FormField>

                <FormField label="Hora Estimada" icon="⏰">
                  <input
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-neutral-900"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 space-y-6">
            <h3 className="text-lg font-black text-neutral-900 flex items-center gap-3">
              🚨 Contacto de Emergencia
            </h3>
            
            <div className="space-y-4">
              <FormField label="Nombre de Contacto" icon="👤">
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 shadow-sm transition-all outline-none font-bold text-neutral-900"
                  placeholder="Ej: Familiar / Amigo"
                />
              </FormField>

              <FormField label="Teléfono de Emergencia" icon="📞">
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-5 py-3 border border-neutral-200 bg-white rounded-2xl focus:ring-4 shadow-sm transition-all outline-none font-bold text-neutral-900"
                  placeholder="+56 9 ..."
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="sticky bottom-8 z-50 flex justify-end items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-neutral-900/10 disabled:opacity-50 active:scale-95 flex items-center gap-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : '✓'}
          <span>{mode === "create" ? "Crear Alumno" : "Guardar Cambios"}</span>
        </button>
      </div>
    </form>
  )
}

function FormField({ label, icon, subtitle, children }: {
  label: string
  icon: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <span>{icon}</span> {label}
        </label>
        {subtitle && (
          <span className="text-[10px] font-bold text-neutral-300 italic">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
