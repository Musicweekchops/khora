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
  const [inviteLink, setInviteLink] = useState("")

  useEffect(() => {
    if (profile?.teacherProfileId) {
      fetchStudents(profile.teacherProfileId)
      if (typeof window !== "undefined") {
        setInviteLink(`${window.location.host}/unirse?teacherId=${profile.teacherProfileId}`)
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

      const mapped = (data ?? []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        status: s.status ?? "PROSPECT",
        modalidad: s.modalidad ?? "online",
        name: s.User?.name ?? "—",
        email: s.User?.email ?? "—",
        phone: s.User?.phone ?? "",
        last_seen_at: s.User?.last_sign_in_at ?? null,
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
    return matchesSearch && matchesFilter;
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
              if (!profile?.teacherProfileId) return
              const link = `${window.location.origin}/unirse?teacherId=${profile.teacherProfileId}`
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
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm font-bold placeholder:font-medium placeholder:text-neutral-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["ALL", "ACTIVE", "TRIAL", "INACTIVE"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <span className="text-5xl mb-4 block opacity-30">👥</span>
          <p className="text-neutral-900 font-bold text-lg">Sin alumnos todavía</p>
          <p className="text-neutral-500 text-sm mt-1">Crea tu primer alumno para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <Link key={s.id} href={`/dashboard/alumnos/detalles?id=${s.id}`}>
              <div className="bg-white rounded-[24px] border border-neutral-100 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-lg hover:border-violet-200 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Dynamic Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow-inner border-2 border-white ${
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
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-neutral-900 group-hover:text-violet-600 transition-colors truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-neutral-500 font-medium truncate">{s.email}</p>
                      {s.phone && <span className="hidden md:inline text-neutral-300 text-xs">•</span>}
                      {s.phone && <p className="hidden md:inline text-xs text-neutral-500 font-medium">{s.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-50 mt-2 md:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100/80 px-2.5 py-1.5 rounded-xl border border-neutral-200/50">
                      {s.modalidad === "online" ? "💻 Online" : "🏠 Presenc."}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[s.status] ?? statusColors.PROSPECT}`}>
                      {statusLabels[s.status] ?? s.status}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
