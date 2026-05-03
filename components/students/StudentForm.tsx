"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface StudentFormProps {
  mode: "create" | "edit"
  studentId?: string
}

export default function StudentForm({ mode, studentId }: StudentFormProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    status: "PROSPECT", lead_source: "", modalidad: "online",
    preferred_day: "", preferred_time: "",
    emergency_contact: "", emergency_phone: "",
  })

  useEffect(() => {
    if (mode === "edit" && studentId) loadStudent()
  }, [mode, studentId])

  async function loadStudent() {
    const { data, error } = await supabase
      .from("StudentProfile")
      .select("*, User ( name, email, phone )")
      .eq("id", studentId)
      .single()

    if (error || !data) return setError("No se pudo cargar el alumno")

    setForm({
      name: data.User?.name ?? "",
      email: data.User?.email ?? "",
      phone: data.User?.phone ?? "",
      password: "",
      status: data.status ?? "PROSPECT",
      lead_source: data.lead_source ?? "",
      modalidad: data.modalidad ?? "online",
      preferred_day: data.preferred_day ?? "",
      preferred_time: data.preferred_time ?? "",
      emergency_contact: data.emergency_contact ?? "",
      emergency_phone: data.emergency_phone ?? "",
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!profile?.teacherProfileId) {
        throw new Error("No tienes perfil de profesor. Cierra sesión y vuelve a entrar.")
      }

      console.log("[StudentForm] Starting submit, mode:", mode, "teacherId:", profile.teacherProfileId)

      if (mode === "create") {
        if (!form.name.trim()) throw new Error("El nombre es obligatorio")
        if (!form.email.trim()) throw new Error("El email es obligatorio")

        const email = form.email.trim().toLowerCase()
        const initialPassword = form.password.trim() || "student123"

        console.log("[StudentForm] Creating student via Edge Function:", email)

        // Usamos fetch nativo para evitar cuelgues del cliente de Supabase
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token

        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            email: email,
            password: initialPassword,
            name: form.name.trim(),
            phone: form.phone.trim() || null,
            teacher_id: profile.teacherProfileId
          })
        })

        const edgeData = await res.json()

        if (!res.ok || edgeData?.error) {
          console.error("[StudentForm] Edge Function Error:", edgeData?.error)
          throw new Error(edgeData?.error || "No se pudo crear la cuenta del alumno")
        }

        const newUserId = edgeData.userId
        console.log("[StudentForm] Student created with UID:", newUserId)

        // 1. Actualizar el StudentProfile con el resto de los campos del formulario
        const { data: updatedProfile, error: profileErr } = await supabase
          .from("StudentProfile")
          .update({
            status: form.status,
            modalidad: form.modalidad,
            lead_source: form.lead_source || null,
            preferred_day: form.preferred_day || null,
            preferred_time: form.preferred_time || null,
            emergency_contact: form.emergency_contact || null,
            emergency_phone: form.emergency_phone || null,
          })
          .eq("user_id", newUserId)
          .select()

        if (profileErr) {
          console.error("[StudentForm] Profile update error:", profileErr)
          throw new Error("Alumno creado, pero hubo un error al guardar sus detalles adicionales.")
        }
        
        if (!updatedProfile || updatedProfile.length === 0) {
          console.error("[StudentForm] No rows updated. user_id:", newUserId)
          throw new Error("Alumno creado, pero no se encontró su perfil para actualizar detalles.")
        }

        console.log("[StudentForm] Profile updated successfully:", updatedProfile)

        // 2. Buscar el ID del StudentProfile para redirigir al detalle
        const { data: sp } = await supabase
          .from("StudentProfile")
          .select("id")
          .eq("user_id", newUserId)
          .single()

        if (sp) {
          router.push(`/dashboard/alumnos/detalles?id=${sp.id}`)
          return
        }


      } else {
        // EDIT mode
        const { data: sp } = await supabase
          .from("StudentProfile")
          .select("user_id")
          .eq("id", studentId)
          .single()

        if (!sp) throw new Error("Perfil no encontrado")

        await supabase.from("User").update({
          name: form.name,
          phone: form.phone || null,
        }).eq("id", sp.user_id)

        await supabase
          .from("StudentProfile")
          .update({
            status: form.status,
            lead_source: form.lead_source || null,
            modalidad: form.modalidad,
            preferred_day: form.preferred_day || null,
            preferred_time: form.preferred_time || null,
            emergency_contact: form.emergency_contact || null,
            emergency_phone: form.emergency_phone || null,
          })
          .eq("id", studentId)
      }

      router.push("/dashboard/alumnos")
    } catch (err: any) {
      console.error("[StudentForm] Error:", err)
      setError(err.message || "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-20">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-sm font-bold flex items-center gap-3">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left */}
        <div className="space-y-8">
          <Section title="Identidad del Alumno" accent="bg-violet-500">
            <Field label="Nombre Completo *" icon="👤">
              <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} className="input-field" placeholder="Ej: Rodrigo Tapia" />
            </Field>
            <Field label="Correo Electrónico *" icon="✉️">
              <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className="input-field" placeholder="nombre@ejemplo.com" disabled={mode === "edit"} />
            </Field>
            <Field label="Teléfono / WhatsApp" icon="📞">
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="input-field" placeholder="+56 9 ..." />
            </Field>
            {mode === "create" && (
              <Field label="Contraseña Inicial" icon="🔒">
                <input type="password" value={form.password} onChange={e => set("password", e.target.value)} className="input-field" placeholder="Dejar vacío = student123" />
              </Field>
            )}
          </Section>

          <Section title="Estado y Origen" accent="bg-amber-400">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estado" icon="📈">
                <select value={form.status} onChange={e => set("status", e.target.value)} className="input-field">
                  <option value="PROSPECT">Prospecto</option>
                  <option value="TRIAL">Clase de Prueba</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </Field>
              <Field label="Fuente" icon="🔗">
                <select value={form.lead_source} onChange={e => set("lead_source", e.target.value)} className="input-field">
                  <option value="">Seleccionar…</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="GOOGLE">Google</option>
                  <option value="REFERRAL">Referido</option>
                  <option value="WEBSITE">Web</option>
                  <option value="OTHER">Otro</option>
                </select>
              </Field>
            </div>
          </Section>
        </div>

        {/* Right */}
        <div className="space-y-8">
          <Section title="Preferencias" accent="bg-emerald-500">
            <Field label="Modalidad" icon="🎓">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-100 rounded-2xl">
                {(["online", "presencial"] as const).map(mod => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => set("modalidad", mod)}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.modalidad === mod ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"
                    }`}
                  >
                    {mod === "online" ? "📹 Virtual" : "🏠 Presencial"}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Día Preferido" icon="🗓️">
                <select value={form.preferred_day} onChange={e => set("preferred_day", e.target.value)} className="input-field">
                  <option value="">Cualquiera</option>
                  {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Hora" icon="⏰">
                <input type="time" value={form.preferred_time} onChange={e => set("preferred_time", e.target.value)} className="input-field" />
              </Field>
            </div>
          </Section>

          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 space-y-4">
            <h3 className="text-lg font-black text-neutral-900">🚨 Contacto de Emergencia</h3>
            <Field label="Nombre" icon="👤">
              <input type="text" value={form.emergency_contact} onChange={e => set("emergency_contact", e.target.value)} className="input-field" placeholder="Familiar / Amigo" />
            </Field>
            <Field label="Teléfono" icon="📞">
              <input type="tel" value={form.emergency_phone} onChange={e => set("emergency_phone", e.target.value)} className="input-field" placeholder="+56 9 ..." />
            </Field>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-8 z-50 flex justify-end items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
        <button type="button" onClick={() => router.back()} className="px-8 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all">
          Descartar
        </button>
        <button type="submit" disabled={loading} className="px-10 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "✓"}
          <span>{mode === "create" ? "Crear Alumno" : "Guardar Cambios"}</span>
        </button>
      </div>
    </form>
  )
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
        <span className={`w-2 h-6 ${accent} rounded-full`} />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
        <span>{icon}</span> {label}
      </label>
      {children}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 1rem;
          outline: none;
          font-weight: 700;
          font-size: 0.875rem;
          color: #171717;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        .input-field:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}
