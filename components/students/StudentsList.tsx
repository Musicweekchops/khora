"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import LastSeenBadge from "@/components/ui/LastSeenBadge"

interface Student {
  id: string
  status: string
  modalidad: string
  name: string
  email: string
  phone: string
  user_id: string
  last_seen_at: string | null
  // Mocked operational flags for UX validation
  has_pending_payment?: boolean
  has_pending_recovery?: boolean
  no_schedule?: boolean
}

const copyToClipboard = (text: string) => {
  if (typeof window === "undefined") return

  const fallbackCopy = (val: string) => {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = val
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
      if (successful) {
        alert("¡Link de inscripción copiado al portapapeles! Envíalo por WhatsApp a tus nuevos alumnos.")
      } else {
        throw new Error("execCommand copy returned false")
      }
    } catch (err) {
      console.error("Fallback copy failed:", err)
      alert(`No se pudo copiar automáticamente. Por favor copia este enlace manualmente:\n\n${val}`)
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("¡Link de inscripción copiado al portapapeles! Envíalo por WhatsApp a tus nuevos alumnos.")
      })
      .catch((err) => {
        console.error("Clipboard API writeText failed, trying fallback:", err)
        fallbackCopy(text)
      })
  } else {
    fallbackCopy(text)
  }
}

export default function StudentsList() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [alertFilter, setAlertFilter] = useState<"ALL" | "PAYMENT" | "RECOVERY" | "SCHEDULE">("ALL")
  const [inviteLink, setInviteLink] = useState("")

  useEffect(() => {
    if (profile?.teacherProfileId) {
      fetchStudents(profile.teacherProfileId)
      if (profile?.role === "TEACHER" && profile?.teacherSlug) {
        setInviteLink(`${window.location.host}/agendar?p=${profile.teacherSlug}`)
      }
    }
  }, [profile])

  async function fetchStudents(teacherId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("StudentProfile")
        .select(`id, status, modalidad, user_id, User ( name, email, phone, last_sign_in_at )`)
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const mapped = (data ?? []).map((s: any, idx: number) => ({
        id: s.id,
        user_id: s.user_id,
        status: s.status ?? "PROSPECT",
        modalidad: s.modalidad ?? "online",
        name: s.User?.name ?? "—",
        email: s.User?.email ?? "—",
        phone: s.User?.phone ?? "",
        last_seen_at: s.User?.last_sign_in_at ?? null,
        // Mocking operational flags based on index to validate UX
        has_pending_payment: idx % 7 === 0 && (s.status === 'ACTIVE' || s.status === 'PAUSED'),
        has_pending_recovery: idx % 5 === 0 && s.status === 'ACTIVE',
        no_schedule: idx % 11 === 0 && s.status === 'ACTIVE',
      }))

      setStudents(mapped)
    } catch (err) {
      console.error("Error loading students:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || s.status === filterStatus;
    
    let matchesAlert = true;
    if (alertFilter === "PAYMENT") matchesAlert = !!s.has_pending_payment;
    if (alertFilter === "RECOVERY") matchesAlert = !!s.has_pending_recovery;
    if (alertFilter === "SCHEDULE") matchesAlert = !!s.no_schedule;

    return matchesSearch && matchesFilter && matchesAlert;
  })

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PROSPECT: "bg-amber-100 text-amber-700",
    TRIAL: "bg-sky-100 text-sky-700",
    PAUSED: "bg-neutral-100 text-neutral-500",
    INACTIVE: "bg-red-100 text-red-600",
  }

  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    PROSPECT: "Prospecto",
    TRIAL: "Prueba",
    PAUSED: "Pausado",
    INACTIVE: "Inactivo",
  }

  if (loading && students.length === 0) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-white rounded-[32px] animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-neutral-100 p-6 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Alumnos</h1>
          <p className="text-neutral-500 font-medium mt-1">{students.length} registrados</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              if (!profile?.teacherSlug) return
              const link = `${window.location.origin}/agendar?p=${profile.teacherSlug}`
              copyToClipboard(link)
            }}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-2xl text-sm font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
            title="Copia el enlace para que tus alumnos se auto-registren en tu escuela"
          >
            <span className="text-lg">🔗</span> 
            <span className="hidden sm:inline">Link de Registro</span>
            <span className="sm:hidden">Link</span>
          </button>
          <Link
            href="/dashboard/alumnos/nuevo"
            className="flex-[2] md:flex-none px-4 md:px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg text-center whitespace-nowrap"
          >
            + Nuevo Alumno
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-3 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm font-bold placeholder:font-medium placeholder:text-neutral-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {["ALL", "ACTIVE", "TRIAL", "INACTIVE"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
                  filterStatus === status 
                    ? "bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-2" 
                    : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {status === "ALL" ? "Todos" : statusLabels[status] ?? status}
              </button>
            ))}
          </div>
        </div>

        {/* Alertas Operativas (Centro de Comando) */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAlertFilter(alertFilter === "PAYMENT" ? "ALL" : "PAYMENT")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              alertFilter === "PAYMENT" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            🔴 Pagos Pendientes
          </button>
          <button
            onClick={() => setAlertFilter(alertFilter === "RECOVERY" ? "ALL" : "RECOVERY")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              alertFilter === "RECOVERY" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            ⚠️ Recuperaciones Pendientes
          </button>
          <button
            onClick={() => setAlertFilter(alertFilter === "SCHEDULE" ? "ALL" : "SCHEDULE")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              alertFilter === "SCHEDULE" ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            📅 Sin Horario
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <span className="text-5xl mb-4 block opacity-30">👥</span>
          <p className="text-neutral-900 font-bold text-lg">Sin alumnos todavía</p>
          <p className="text-neutral-500 text-sm mt-1">Crea tu primer alumno para empezar</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Alumno</th>
                  <th className="px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden md:table-cell">Contacto</th>
                  <th className="px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden sm:table-cell">Modalidad</th>
                  <th className="px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => window.location.href = `/dashboard/alumnos/detalles?id=${s.id}`} className="hover:bg-violet-50/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg font-black shadow-inner border-2 border-white ${
                            s.status === 'ACTIVE' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700' :
                            s.status === 'TRIAL' ? 'bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700' :
                            s.status === 'INACTIVE' ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-700' :
                            'bg-gradient-to-br from-violet-100 to-indigo-200 text-violet-700'
                          }`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
                            <LastSeenBadge lastSeenAt={s.last_seen_at} size="sm" />
                          </span>
                        </div>
                        <div>
                          <p className="font-black text-neutral-900 group-hover:text-violet-600 transition-colors">{s.name}</p>
                          <p className="text-[11px] md:hidden text-neutral-500 mt-0.5">{s.email}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {s.has_pending_payment && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Deuda</span>}
                            {s.has_pending_recovery && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Recuperación</span>}
                            {s.no_schedule && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">Sin Horario</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-neutral-600 font-medium">{s.email}</p>
                      {s.phone && <p className="text-xs text-neutral-400 mt-0.5">{s.phone}</p>}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200/50">
                        {s.modalidad === "online" ? "💻 Online" : "🏠 Presencial"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[s.status] ?? statusColors.PROSPECT}`}>
                          {statusLabels[s.status] ?? s.status}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
