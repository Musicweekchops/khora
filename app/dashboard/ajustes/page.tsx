"use client"

import { useState, useEffect } from "react"
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
  EyeOff,
  CreditCard
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

  // MERCADO PAGO STATE HOOKS (For all Teachers)
  const isTeacher = profile?.role === "TEACHER"
  const [billing, setBilling] = useState({
    gateway_enabled: false,
    sandbox_mode: true,
    mp_access_token: "",
    mp_public_key: "",
    mp_sandbox_token: "",
    mp_sandbox_key: "",
    trial_class_price: 25000,
    meta_pixel_id: ""
  })
  const [loadingBilling, setLoadingBilling] = useState(false)
  const [savingBilling, setSavingBilling] = useState(false)

  useEffect(() => {
    if (isTeacher && profile?.teacherProfileId) {
      loadBillingConfig()
    }
  }, [profile])

  async function loadBillingConfig() {
    setLoadingBilling(true)
    try {
      const { data, error } = await supabase
        .from("TeacherBillingConfig")
        .select("*")
        .eq("teacher_id", profile?.teacherProfileId)
        .maybeSingle()

      if (error) {
        console.error("Error loading billing config:", error)
      } else if (data) {
        setBilling({
          gateway_enabled: data.gateway_enabled,
          sandbox_mode: data.sandbox_mode,
          mp_access_token: data.mp_access_token || "",
          mp_public_key: data.mp_public_key || "",
          mp_sandbox_token: data.mp_sandbox_token || "",
          mp_sandbox_key: data.mp_sandbox_key || "",
          trial_class_price: data.trial_class_price || 25000,
          meta_pixel_id: data.meta_pixel_id || ""
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingBilling(false)
    }
  }

  async function handleUpdateBilling(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.teacherProfileId) return
    setSavingBilling(true)

    try {
      const { error } = await supabase
        .from("TeacherBillingConfig")
        .upsert({
          teacher_id: profile.teacherProfileId,
          gateway_enabled: billing.gateway_enabled,
          sandbox_mode: billing.sandbox_mode,
          mp_access_token: billing.mp_access_token.trim() || null,
          mp_public_key: billing.mp_public_key.trim() || null,
          mp_sandbox_token: billing.mp_sandbox_token.trim() || null,
          mp_sandbox_key: billing.mp_sandbox_key.trim() || null,
          trial_class_price: Number(billing.trial_class_price) || 25000,
          meta_pixel_id: billing.meta_pixel_id.trim() || null
        }, { onConflict: "teacher_id" })

      if (error) {
        toast.error("Error al guardar credenciales: " + error.message)
      } else {
        toast.success("Credenciales de Mercado Pago guardadas con éxito")
      }
    } catch (err: any) {
      toast.error(err.message || "Error al guardar")
    } finally {
      setSavingBilling(false)
    }
  }

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

          {/* Mercado Pago Gateway Section (Exclusive to Arnaldo Allende) */}
          {isTeacher && (
            <section className="bg-white rounded-[40px] border border-neutral-100 p-10 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
              
              <h3 className="text-xl font-black text-neutral-900 flex items-center gap-3 relative z-10">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Pasarela de Pagos y Marketing
              </h3>

              {loadingBilling ? (
                <div className="space-y-4 py-4 animate-pulse">
                  <div className="h-10 bg-neutral-50 rounded-xl" />
                  <div className="h-10 bg-neutral-50 rounded-xl" />
                </div>
              ) : (
                <form onSubmit={handleUpdateBilling} className="space-y-6 relative z-10 font-sans">
                  {/* Gateway Toggle Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">Pasarela de Pagos</p>
                        <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Activar cobros con Mercado Pago</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBilling(b => ({ ...b, gateway_enabled: !b.gateway_enabled }))}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${billing.gateway_enabled ? "bg-emerald-500 flex justify-end" : "bg-neutral-200 flex justify-start"}`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">Modo de Pruebas (Sandbox)</p>
                        <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Usar credenciales simulatorias</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBilling(b => ({ ...b, sandbox_mode: !b.sandbox_mode }))}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${billing.sandbox_mode ? "bg-amber-500 flex justify-end" : "bg-neutral-200 flex justify-start"}`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow" />
                      </button>
                    </div>
                  </div>

                  {/* Config: Trial Price and Meta Pixel ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Valor Clase de Prueba (CLP)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={billing.trial_class_price}
                          onChange={e => setBilling(b => ({ ...b, trial_class_price: Number(e.target.value) }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl pl-10 pr-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-emerald-300 transition-all"
                          placeholder="25000"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">ID del Píxel de Meta (Facebook Pixel)</label>
                      <input
                        type="text"
                        value={billing.meta_pixel_id}
                        onChange={e => setBilling(b => ({ ...b, meta_pixel_id: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-emerald-300 transition-all"
                        placeholder="ID del Pixel"
                      />
                    </div>
                  </div>

                  {billing.sandbox_mode ? (
                    // SANDBOX CREDENTIALS
                    <div className="space-y-4 p-5 bg-amber-500/5 border border-amber-200/40 rounded-3xl space-y-4 animate-in fade-in duration-300">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider pl-1">Credenciales Sandbox (Pruebas)</p>
                      
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Public Key Sandbox</label>
                        <input
                          type="text"
                          value={billing.mp_sandbox_key}
                          onChange={e => setBilling(b => ({ ...b, mp_sandbox_key: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold outline-none focus:bg-white focus:border-amber-300 transition-all"
                          placeholder="TEST-c12b7..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Access Token Sandbox</label>
                        <input
                          type="password"
                          value={billing.mp_sandbox_token}
                          onChange={e => setBilling(b => ({ ...b, mp_sandbox_token: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold outline-none focus:bg-white focus:border-amber-300 transition-all"
                          placeholder="TEST-4839210..."
                        />
                      </div>
                    </div>
                  ) : (
                    // PRODUCTION CREDENTIALS
                    <div className="space-y-4 p-5 bg-emerald-500/5 border border-emerald-200/40 rounded-3xl space-y-4 animate-in fade-in duration-300">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider pl-1">Credenciales de Producción (Dinero Real)</p>
                      
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Public Key Producción</label>
                        <input
                          type="text"
                          value={billing.mp_public_key}
                          onChange={e => setBilling(b => ({ ...b, mp_public_key: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold outline-none focus:bg-white focus:border-emerald-300 transition-all"
                          placeholder="APP_USR-..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Access Token Producción</label>
                        <input
                          type="password"
                          value={billing.mp_access_token}
                          onChange={e => setBilling(b => ({ ...b, mp_access_token: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold outline-none focus:bg-white focus:border-emerald-300 transition-all"
                          placeholder="APP_USR-..."
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingBilling}
                    className="w-full sm:w-auto px-10 py-4 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {savingBilling ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Configuración de Pago
                  </button>
                </form>
              )}
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
