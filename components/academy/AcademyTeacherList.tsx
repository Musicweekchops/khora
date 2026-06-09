"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import CreateTeacherModal from "./CreateTeacherModal"

interface TeacherRow {
  id: string
  user_id: string
  name: string
  email: string
  instrumento: string | null
  students: number
  status: string
}

interface Props {
  academyId: string
}

export default function AcademyTeacherList({ academyId }: Props) {
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (academyId) load()
  }, [academyId])

  async function load() {
    try {
      setLoading(true)
      const { data: at, error } = await supabase
        .from("AcademyTeacher")
        .select(`
          id, status,
          TeacherProfile (
            id, user_id, instrumento,
            User ( name, email ),
            StudentProfile ( id )
          )
        `)
        .eq("academy_id", academyId)

      if (error) throw error

      const rows: TeacherRow[] = (at ?? []).map((row: any) => {
        const tp = row.TeacherProfile
        const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        const students = tp?.StudentProfile?.length ?? 0
        return {
          id: tp?.id ?? "",
          user_id: tp?.user_id ?? "",
          name: u?.name ?? "—",
          email: u?.email ?? "—",
          instrumento: tp?.instrumento ?? null,
          students,
          status: row.status,
        }
      })
      setTeachers(rows)
    } catch (err) {
      console.error("Error loading teachers:", err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(teacherId: string, currentStatus: string) {
    try {
      setUpdatingId(teacherId)
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      
      const { error } = await supabase
        .from("AcademyTeacher")
        .update({ status: newStatus })
        .eq("academy_id", academyId)
        .eq("teacher_id", teacherId)

      if (error) throw error

      setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error("Error updating status:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.instrumento && t.instrumento.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o instrumento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
          />
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Nuevo Profesor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-50 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-neutral-100 rounded" />
                  <div className="h-3 w-48 bg-neutral-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-neutral-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">No se encontraron profesores</p>
            <p className="text-xs text-neutral-400 mt-1">Intenta con otra búsqueda o agrega un nuevo profesor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Profesor</th>
                  <th className="px-6 py-3.5">Instrumento</th>
                  <th className="px-6 py-3.5 text-center">Alumnos</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-neutral-50/40 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{t.name}</p>
                          <p className="text-xs text-neutral-400 truncate">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {t.instrumento ?? "Sin definir"}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-neutral-700">
                      {t.students}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {t.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(t.id, t.status)}
                          disabled={updatingId === t.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            t.status === "ACTIVE"
                              ? "bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                          } disabled:opacity-50`}
                        >
                          {updatingId === t.id ? "..." : t.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTeacherModal
          academyId={academyId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}
    </div>
  )
}
