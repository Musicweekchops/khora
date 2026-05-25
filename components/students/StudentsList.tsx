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

export default function StudentsList() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
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

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()),
  )

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
              navigator.clipboard.writeText(link)
              alert("¡Link de inscripción copiado al portapapeles! Envíalo por WhatsApp a tus nuevos alumnos.")
            }}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-2xl text-sm font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg">🔗</span> 
            <span className="hidden sm:inline">Copiar Link</span>
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

      {/* Invite Link Card */}
      {profile?.teacherProfileId && (
        <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <span className="text-base">🔗</span> Enlace de invitación para alumnos
            </h2>
            <span className="text-[10px] bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Registro Directo
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Comparte este enlace corto con tus nuevos alumnos. Al ingresar, podrán registrarse y quedar vinculados a tu cuenta automáticamente.
          </p>
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/60 rounded-2xl p-1.5 pl-4 shadow-inner max-w-full">
            <span className="text-xs font-mono text-neutral-600 truncate select-all flex-1 min-w-0">
              {inviteLink}
            </span>
            <button
              onClick={() => {
                const fullLink = `${window.location.origin}/unirse?teacherId=${profile.teacherProfileId}`
                navigator.clipboard.writeText(fullLink)
                alert("¡Link de inscripción copiado al portapapeles! Envíalo por WhatsApp a tus nuevos alumnos.")
              }}
              className="px-4 py-2 bg-neutral-900 hover:bg-violet-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <span>📋</span> Copiar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all text-sm font-medium"
        />
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
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-violet-200 transition-all group">
                {/* Avatar with online dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-lg font-bold text-violet-600">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <LastSeenBadge lastSeenAt={s.last_seen_at} size="sm" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 group-hover:text-violet-600 transition-colors">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-neutral-500 truncate">{s.email}</p>
                    <LastSeenBadge lastSeenAt={s.last_seen_at} size="md" />
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[s.status] ?? statusColors.PROSPECT}`}>
                  {statusLabels[s.status] ?? s.status}
                </span>
                <span className="text-neutral-300 group-hover:text-violet-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
