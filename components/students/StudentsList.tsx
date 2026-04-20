"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"

interface Student {
  id: string
  status: string
  modalidad: string
  name: string
  email: string
  phone: string
}

export default function StudentsList() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (profile?.teacherProfileId) fetchStudents(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function fetchStudents(teacherId: string) {
    try {
      const { data, error } = await supabase
        .from("StudentProfile")
        .select(`id, status, modalidad, User ( name, email, phone )`)
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const mapped = (data ?? []).map((s: any) => ({
        id: s.id,
        status: s.status ?? "PROSPECT",
        modalidad: s.modalidad ?? "online",
        name: s.User?.name ?? "—",
        email: s.User?.email ?? "—",
        phone: s.User?.phone ?? "",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Alumnos</h1>
          <p className="text-neutral-500 font-medium mt-1">{students.length} registrados</p>
        </div>
        <Link
          href="/dashboard/alumnos/nuevo"
          className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg"
        >
          + Nuevo Alumno
        </Link>
      </div>

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
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-lg font-bold text-violet-600">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 group-hover:text-violet-600 transition-colors">{s.name}</p>
                  <p className="text-sm text-neutral-500">{s.email}</p>
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
