"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ReassignStudentModal from "./ReassignStudentModal"

interface StudentRow {
  id: string
  name: string
  email: string
  phone: string | null
  teacher_id: string | null
  teacher_name: string
  status: string
}

interface TeacherOption {
  id: string
  name: string
}

interface Props {
  academyId: string
}

export default function AcademyStudentList({ academyId }: Props) {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [search, setSearch] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")
  const [loading, setLoading] = useState(true)

  // Modales
  const [showCreate, setShowCreate] = useState(false)
  const [reassignStudent, setReassignStudent] = useState<StudentRow | null>(null)

  // Formulario nuevo alumno
  const [newForm, setNewForm] = useState({ name: "", email: "", phone: "", teacherId: "", password: "" })
  const [createError, setCreateError] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (academyId) {
      loadData()
    }
  }, [academyId])

  async function loadData() {
    try {
      setLoading(true)
      // Cargar profesores activos
      const { data: at } = await supabase
        .from("AcademyTeacher")
        .select(`
          TeacherProfile (
            id,
            User ( name )
          )
        `)
        .eq("academy_id", academyId)
        .eq("status", "ACTIVE")

      const teacherOpts: TeacherOption[] = (at ?? []).map((row: any) => {
        const tp = row.TeacherProfile
        const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        return {
          id: tp?.id ?? "",
          name: u?.name ?? "—",
        }
      })
      setTeachers(teacherOpts)

      // Cargar alumnos de la academia
      const { data: sp, error } = await supabase
        .from("StudentProfile")
        .select(`
          id, status, teacher_id,
          User ( name, email, phone ),
          TeacherProfile (
            User ( name )
          )
        `)
        .eq("academy_id", academyId)

      if (error) throw error

      const rows: StudentRow[] = (sp ?? []).map((row: any) => {
        const u = Array.isArray(row.User) ? row.User[0] : row.User
        const tp = row.TeacherProfile
        const tUser = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        return {
          id: row.id,
          name: u?.name ?? "—",
          email: u?.email ?? "—",
          phone: u?.phone ?? null,
          teacher_id: row.teacher_id,
          teacher_name: tUser?.name ?? "Sin asignar",
          status: row.status,
        }
      })
      setStudents(rows)
    } catch (err) {
      console.error("Error loading student data:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    setCreating(true)

    try {
      if (!newForm.name.trim() || !newForm.email.trim() || !newForm.teacherId || !newForm.password) {
        throw new Error("Por favor completa los campos requeridos.")
      }

      const res = await supabase.functions.invoke("create-student", {
        body: {
          email: newForm.email.trim().toLowerCase(),
          password: newForm.password,
          name: newForm.name.trim(),
          phone: newForm.phone.trim() || null,
          teacher_id: newForm.teacherId,
          academy_id: academyId,
        },
      })

      if (res.error) throw new Error(res.error.message)
      if (res.data?.error) throw new Error(res.data.error)

      setShowCreate(false)
      setNewForm({ name: "", email: "", phone: "", teacherId: "", password: "" })
      loadData()
    } catch (err: any) {
      setCreateError(err.message ?? "Error al crear el alumno")
    } finally {
      setCreating(false)
    }
  }

  const filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchesTeacher = teacherFilter ? s.teacher_id === teacherFilter : true
    return matchesSearch && matchesTeacher
  })

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
            />
          </div>

          <select
            value={teacherFilter}
            onChange={e => setTeacherFilter(e.target.value)}
            className="px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white text-neutral-700 min-w-[200px]"
          >
            <option value="">Todos los profesores</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Nuevo Alumno
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
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">No se encontraron alumnos</p>
            <p className="text-xs text-neutral-400 mt-1">Intenta con otra búsqueda o agrega un nuevo alumno</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Alumno</th>
                  <th className="px-6 py-3.5">Profesor Asignado</th>
                  <th className="px-6 py-3.5">Teléfono</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-50/40 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{s.name}</p>
                          <p className="text-xs text-neutral-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">
                      {s.teacher_name}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">
                      {s.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {s.status === "ACTIVE" ? "Activo" : "Prospecto"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReassignStudent(s)}
                          className="px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-lg text-xs font-bold transition-all"
                        >
                          Reasignar
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

      {/* Modal Reasignar Profesor */}
      {reassignStudent && (
        <ReassignStudentModal
          academyId={academyId}
          studentId={reassignStudent.id}
          studentName={reassignStudent.name}
          currentTeacherId={reassignStudent.teacher_id}
          currentTeacherName={reassignStudent.teacher_name}
          onClose={() => setReassignStudent(null)}
          onReassigned={() => {
            setReassignStudent(null)
            loadData()
          }}
        />
      )}

      {/* Modal Crear Alumno */}
      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px]">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Nuevo Alumno</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Se creará su cuenta y se le asignará un profesor</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200 text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-xl border border-red-100">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  placeholder="Nombre del alumno"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={newForm.email}
                  onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  placeholder="alumno@email.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Teléfono (Opcional)</label>
                <input
                  type="tel"
                  value={newForm.phone}
                  onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Profesor Asignado</label>
                {teachers.length === 0 ? (
                  <p className="text-xs text-red-500 italic">Debes tener al menos un profesor activo para crear un alumno.</p>
                ) : (
                  <select
                    required
                    value={newForm.teacherId}
                    onChange={e => setNewForm(p => ({ ...p, teacherId: e.target.value }))}
                    className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
                  >
                    <option value="" disabled>Seleccionar profesor...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Contraseña temporal</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newForm.password}
                  onChange={e => setNewForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-mono"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || teachers.length === 0}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</>
                  ) : "Crear Alumno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
