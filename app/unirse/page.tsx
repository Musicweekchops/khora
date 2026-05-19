"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

function RegistrationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get("teacherId")
  
  const [teacherName, setTeacherName] = useState("")
  const [loadingTeacher, setLoadingTeacher] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    modalidad: "online",
    preferred_day: "",
    preferred_time: "",
  })

  useEffect(() => {
    async function loadTeacher() {
      if (!teacherId) {
        setError("El enlace de inscripción no contiene información del profesor.")
        setLoadingTeacher(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("TeacherProfile")
        .select("User ( name )")
        .eq("id", teacherId)
        .maybeSingle()
      
      if (data?.User) {
        const userObj: any = data.User
        const name = Array.isArray(userObj) ? userObj[0]?.name : userObj.name
        setTeacherName(name)
      } else {
        setError("El enlace de inscripción no es válido o ha expirado.")
      }
      setLoadingTeacher(false)
    }
    loadTeacher()
  }, [teacherId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !teacherId) return
    
    setSubmitting(true)
    setError("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // 1. Create account via our existing Edge Function 
      const res = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          teacher_id: teacherId
        })
      })

      const edgeData = await res.json()

      if (!res.ok || edgeData?.error) {
        // Mostramos el error específico que viene de la base de datos si existe
        throw new Error(edgeData?.error || "Error al crear la cuenta. Intenta con otro correo.")
      }

      const newUserId = edgeData.userId

      const { error: profileErr } = await supabase
        .from("StudentProfile")
        .update({
          modalidad: form.modalidad,
          preferred_day: form.preferred_day || null,
          preferred_time: form.preferred_time || null,
          status: "PROSPECT"
        })
        .eq("user_id", newUserId)

      if (profileErr) console.error("Profile update error:", profileErr)

      setSuccess(true)
      
      await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password.trim()
      })
      
      setTimeout(() => {
        router.push("/dashboard/tareas")
      }, 2000)

    } catch (err: any) {
      // Capturamos el mensaje de error exacto para que el usuario sepa qué falló
      setError(err.message || "Ocurrió un error inesperado")
      setSubmitting(false)
    }
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (loadingTeacher) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
    </div>
  }

  if (error && !teacherName) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-sm">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Enlace Inválido</h2>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[40px] max-w-sm w-full text-center shadow-xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight">¡Inscripción Exitosa!</h2>
          <p className="text-neutral-500 text-sm mb-8">Tu cuenta ha sido creada. Entrando a tu panel de alumno...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col p-4 md:p-8">
      <div className="max-w-md w-full mx-auto flex justify-center mb-8 pt-4">
        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl">K</span>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-[40px] shadow-xl overflow-hidden mb-10">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <h1 className="text-2xl font-black mb-2 relative z-10 tracking-tight">Inscripción a Clases</h1>
          <p className="text-violet-100 font-medium relative z-10">con {teacherName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
              <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} 
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold placeholder:font-medium" 
                placeholder="Ej: María José Salas" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
              <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} 
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold placeholder:font-medium" 
                placeholder="maria@ejemplo.com" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp / Teléfono</label>
              <input type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)} 
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold placeholder:font-medium" 
                placeholder="+56 9 1234 5678" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Crea tu contraseña</label>
              <input type="password" required value={form.password} onChange={e => set("password", e.target.value)} 
                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-bold placeholder:font-medium" 
                placeholder="Mínimo 6 caracteres" />
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 border-t border-neutral-100 pt-6">Preferencias de Clase</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 rounded-2xl border border-neutral-100 mb-4">
              {(["online", "presencial"] as const).map(m => (
                <button key={m} type="button" onClick={() => set("modalidad", m)}
                  className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${form.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                  {m === "online" ? "📹 Virtual" : "🏠 Presencial"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Día ideal</label>
                <select value={form.preferred_day} onChange={e => set("preferred_day", e.target.value)} 
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 text-sm font-bold appearance-none">
                  <option value="">Cualquiera</option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Horario estimado</label>
                <input 
                  type="time" 
                  value={form.preferred_time} 
                  onChange={e => set("preferred_time", e.target.value)} 
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-violet-400 text-sm font-bold appearance-none" 
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} 
            className="w-full py-4 mt-4 bg-neutral-900 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-neutral-900/20 hover:bg-violet-600 transition-colors disabled:opacity-50">
            {submitting ? "Creando perfil..." : "Completar Inscripción"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function StudentRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  )
}
