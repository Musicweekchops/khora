"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatTime } from "@/lib/utils"
import { DAY_NAMES } from "@/lib/schedule"
import { useToast } from "@/components/ui/Toast"
import { 
  ClipboardList, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  MessageSquare, 
  Copy, 
  Check, 
  Target,
  Sparkles,
  ArrowRight
} from "lucide-react"

interface WaitingLead {
  id: string
  prospect_name: string
  prospect_email: string
  prospect_phone: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
}

export default function WaitingListPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  
  const [leads, setLeads] = useState<WaitingLead[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [pixelId, setPixelId] = useState("")
  const [savingPixel, setSavingPixel] = useState(false)

  const isArnaldo = profile?.email === "arnaldoallende@hotmail.com"

  useEffect(() => {
    // 1. Cargar Pixel ID de localStorage
    if (typeof window !== "undefined") {
      const savedPixel = localStorage.getItem("khora-meta-pixel") || ""
      setPixelId(savedPixel)
    }

    if (profile?.teacherProfileId) {
      loadWaitingList()
    }
  }, [profile?.teacherProfileId])

  async function loadWaitingList() {
    setLoading(true)
    const { data, error } = await supabase
      .from("ScheduleWaitingList")
      .select("*")
      .eq("teacher_id", profile?.teacherProfileId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading waiting list:", error)
      toast("Error al cargar la lista de espera", "error")
    } else if (data) {
      setLeads(data)
    }
    setLoading(false)
  }

  const handleCopyLink = () => {
    if (!profile?.teacherProfileId) return
    const link = `${window.location.origin}/unirse?teacherId=${profile.teacherProfileId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast("¡Enlace de Ads copiado!", "success")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSavePixel = () => {
    setSavingPixel(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("khora-meta-pixel", pixelId.trim())
      toast("¡Píxel de Meta Ads guardado exitosamente!", "success")
    }
    setSavingPixel(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas remover este prospecto de la lista de espera?")) return
    
    const { error } = await supabase
      .from("ScheduleWaitingList")
      .delete()
      .eq("id", id)

    if (error) {
      toast("Error al eliminar", "error")
    } else {
      setLeads(prev => prev.filter(l => l.id !== id))
      toast("Prospecto removido correctamente", "success")
    }
  }

  const handleConvertLead = async (lead: WaitingLead) => {
    if (!confirm(`¿Deseas activar e inscribir a ${lead.prospect_name} en tu panel de alumnos?`)) return

    try {
      // 1. Crear al alumno en CRM (como PROSPECT o TRIAL) para que Arnaldo pueda agendarle
      const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke("create-student", {
        body: {
          email: lead.prospect_email,
          password: "student123", // Contraseña temporal
          name: lead.prospect_name,
          phone: lead.prospect_phone,
          teacher_id: profile?.teacherProfileId
        }
      })

      if (edgeErr || !edgeRes) {
        throw new Error(edgeErr?.message || "Error al registrar en base de datos")
      }

      // 2. Cambiar su estado a prospecto de alta prioridad
      const newUserId = edgeRes.userId
      await supabase
        .from("StudentProfile")
        .update({ status: "TRIAL", lead_source: "WEBSITE" })
        .eq("user_id", newUserId)

      // 3. Remover de la lista de espera
      await supabase.from("ScheduleWaitingList").delete().eq("id", lead.id)

      toast(`¡Excelente! ${lead.prospect_name} ahora está en tu panel CRM.`, "success")
      loadWaitingList()
    } catch (err: any) {
      toast(`Error al inscribir alumno: ${err.message}`, "error")
    }
  }

  const getWhatsAppMessage = (lead: WaitingLead) => {
    const timeFormatted = formatTime(lead.start_time)
    const dayName = DAY_NAMES[lead.day_of_week]
    return encodeURIComponent(
      `¡Hola ${lead.prospect_name}! Te saluda Arnaldo Allende de Musicweekchops. 🥁 Te escribo porque te habías registrado en mi lista de espera prioritara para el horario de los ${dayName} a las ${timeFormatted} hs. ¡Acaba de liberarse esa vacante fija! ¿Te gustaría tomarla tú primero? Avísame para coordinar.`
    )
  }

  if (!isArnaldo) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-neutral-50">
        <div className="kh-card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-5">🔒</div>
          <h2 className="kh-title text-lg mb-2">Acceso Privado</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Este módulo y su respectiva automatización de lista de espera están restringidos al profesor administrador principal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-violet-600" />
            Lista de Espera Prioritaria
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            Gestiona los prospectos interesados en tus horarios fijos actualmente ocupados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: WAITING LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-violet-600 rounded-full" />
              Prospectos Registrados ({leads.length})
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 bg-neutral-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                <p className="text-sm text-neutral-400 font-bold italic">No hay nadie en la lista de espera todavía</p>
                <p className="text-xs text-neutral-300 mt-1">Los alumnos que no encuentren cupo en tu landing se registrarán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map(lead => (
                  <div key={lead.id} className="bg-white border border-neutral-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group">
                    {/* Indicador de escasez lateral */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />

                    <div className="space-y-3 flex-1 min-w-0 pl-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-neutral-900 truncate">{lead.prospect_name}</h3>
                        <span className="bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                          🔥 Esperando Vacante
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-500 font-medium">
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                          {lead.prospect_email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                          {lead.prospect_phone}
                        </span>
                      </div>

                      <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-2.5 inline-flex items-center gap-2 text-xs font-bold text-violet-800">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        <span>Desea: {DAY_NAMES[lead.day_of_week]} a las {formatTime(lead.start_time)} hs</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      {/* WhatsApp Quick Chat */}
                      <a 
                        href={`https://wa.me/${lead.prospect_phone.replace(/\+/g, "")}?text=${getWhatsAppMessage(lead)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                        title="Contactar por WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </a>

                      {/* Convert to Student */}
                      <button
                        onClick={() => handleConvertLead(lead)}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-violet-600 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                        title="Asignar e Inscribir"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Activar</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2.5 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all flex-shrink-0"
                        title="Quitar de lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ADS TOOLS */}
        <div className="space-y-6">
          {/* ADS LINK CARD */}
          <div className="bg-[#1a1a24] text-white border border-[#2d2d3d] rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-violet-500/10 blur-[50px] rounded-full" />
            <div className="absolute bottom-[-15%] left-[5%] w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full" />

            <div className="relative z-10 space-y-6">
              <span className="bg-violet-500/15 text-violet-300 border border-violet-500/35 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Herramientas de Conversión
              </span>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">Tu Enlace de Meta Ads</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                  Usa este enlace exacto en tus anuncios de Instagram y Facebook. Dirige a los alumnos directamente a tu landing page fotorrealista.
                </p>
              </div>

              {/* COPY LINK BOX */}
              <div className="bg-[#13131a] border border-[#2d2d3d] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Enlace de campaña</p>
                  <p className="text-xs font-bold text-violet-400 truncate mt-0.5">
                    {profile?.teacherProfileId ? `${window.location.origin}/unirse?teacherId=${profile.teacherProfileId}` : "Cargando..."}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all flex-shrink-0 shadow-lg shadow-violet-950/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* META PIXEL ID CARD */}
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Meta Pixel (Facebook Ads)
            </h2>
            <p className="text-neutral-500 text-xs leading-relaxed font-medium">
              Ingresa el identificador de tu Píxel de Meta. Khora inyectará el script de seguimiento automáticamente en tu landing y registrará el evento <strong className="text-neutral-800">Lead</strong> en tiempo real cuando un alumno complete su WhatsApp.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">ID del Píxel de Meta</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300">
                    <Target className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={pixelId}
                    onChange={e => setPixelId(e.target.value)}
                    placeholder="Ej: 843920193810293"
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-emerald-400 focus:bg-white text-xs font-bold text-neutral-800 transition-all placeholder:font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePixel}
                disabled={savingPixel}
                className="w-full py-3.5 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {savingPixel ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
