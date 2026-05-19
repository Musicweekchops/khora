"use client"

import { useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Save,
  Eye,
  EyeOff
} from "lucide-react"

export default function AjustesPage() {
  const { profile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  
  const [passForm, setPassForm] = useState({
    newPassword: "",
    confirmPassword: ""
  })

  const [instrumento, setInstrumento] = useState(profile?.instrumento || "")
  const [savingInstrumento, setSavingInstrumento] = useState(false)

  async function handleUpdateInstrumento(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.teacherProfileId) return
    setSavingInstrumento(true)
    
    const { error } = await supabase
      .from("TeacherProfile")
      .update({ instrumento })
      .eq("id", profile.teacherProfileId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Instrumento actualizado correctamente")
      profile.instrumento = instrumento
    }
    setSavingInstrumento(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("Las contraseñas no coinciden")
    }
    if (passForm.newPassword.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres")
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: passForm.newPassword
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Contraseña actualizada correctamente")
      setPassForm({ newPassword: "", confirmPassword: "" })
    }
    setLoading(false)
  }

  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Ajustes</h1>
        <p className="text-neutral-500 font-medium mt-2">Gestiona tu perfil y seguridad de la cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: General Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[40px] border border-neutral-100 p-8 shadow-sm text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-violet-600 shadow-inner">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black text-neutral-900">{profile.name}</h3>
              <p className="text-xs font-black text-violet-500 uppercase tracking-widest mt-1">{profile.role}</p>
            </div>
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-violet-600/5 blur-[50px] rounded-full" />
          </div>

          <div className="bg-neutral-900 rounded-[32px] p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Cuenta Verificada</p>
            </div>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Tu cuenta está protegida por Supabase Auth. Los datos de acceso se almacenan de forma encriptada.
            </p>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-100"
          >
            <Lock className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Right: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="bg-white rounded-[40px] border border-neutral-100 p-10 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3">
              <User className="w-5 h-5 text-neutral-400" />
              Datos del Perfil
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoField label="Nombre Completo" value={profile.name} icon={<User className="w-4 h-4" />} />
              <InfoField label="Correo Electrónico" value={profile.email} icon={<Mail className="w-4 h-4" />} />
              <InfoField label="Rol de Usuario" value={profile.role === 'TEACHER' ? "Profesor" : "Alumno"} icon={<ShieldCheck className="w-4 h-4" />} />
              <InfoField label="Teléfono" value={profile.phone || "No registrado"} icon={<Phone className="w-4 h-4" />} />
              {profile.role === 'TEACHER' && (
                <InfoField label="Instrumento Principal" value={profile.instrumento || "No especificado"} icon={<span>🎸</span>} />
              )}
            </div>
          </section>

          {/* Instrument Section (Only for Teachers) */}
          {profile.role === 'TEACHER' && (
            <section className="bg-white rounded-[40px] border border-neutral-100 p-10 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                <span className="text-lg">🎸</span>
                Especialidad e Instrumento
              </h3>
              
              <form onSubmit={handleUpdateInstrumento} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Instrumento que enseñas</label>
                  <select 
                    value={instrumento}
                    onChange={e => setInstrumento(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-300 transition-all appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.25rem' }}
                    required
                  >
                    <option value="" disabled>Selecciona tu instrumento...</option>
                    <option value="Batería">🥁 Batería</option>
                    <option value="Piano / Teclado">🎹 Piano / Teclado</option>
                    <option value="Guitarra">🎸 Guitarra</option>
                    <option value="Bajo Eléctrico">🎸 Bajo Eléctrico</option>
                    <option value="Canto / Voz">🎤 Canto / Voz</option>
                    <option value="Producción Musical">🎚️ Producción Musical</option>
                    <option value="Otros">🎵 Otros</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={savingInstrumento || instrumento === profile.instrumento}
                  className="w-full sm:w-auto px-10 py-4 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {savingInstrumento ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Especialidad
                </button>
              </form>
            </section>
          )}

          {/* Security Section */}
          <section className="bg-white rounded-[40px] border border-neutral-100 p-10 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3">
              <Lock className="w-5 h-5 text-neutral-400" />
              Seguridad
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Nueva Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    value={passForm.newPassword}
                    onChange={e => setPassForm(p => ({...p, newPassword: e.target.value}))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-300 transition-all pr-14"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-300 hover:text-neutral-500 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Confirmar Nueva Contraseña</label>
                <input 
                  type={showPass ? "text" : "password"}
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm(p => ({...p, confirmPassword: e.target.value}))}
                  placeholder="Repite la contraseña"
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-violet-300 transition-all"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !passForm.newPassword}
                className="w-full sm:w-auto px-10 py-4 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Actualizar Contraseña
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 bg-neutral-50/50 rounded-3xl border border-neutral-100/50">
      <div className="flex items-center gap-2 mb-1.5 opacity-40 text-neutral-900">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</p>
      </div>
      <p className="text-sm font-bold text-neutral-900 truncate">{value}</p>
    </div>
  )
}
